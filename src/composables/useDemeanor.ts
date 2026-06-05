// ============================================================
// 视频仪态分析 composable
// 基于 MediaPipe Face Mesh 实时分析：
//   - 眼神交流（iris 在眼框中的居中程度）
//   - 坐姿（头部倾斜/偏转角度）
//   - 表情（微笑 / 紧张 / 自然）
//   - 眨眼频率
// ============================================================

import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

// @mediapipe/face_mesh 是 IIFE 脚本，不导出 ES 模块，FaceMesh 通过全局变量获取。
// 使用 CDN 加载方式在 startAnalysis() 中动态创建实例，不在此处 import。

// ---- 类型定义 ----

interface Point {
  x: number
  y: number
  z: number
}

interface EyeIndex {
  outer: number
  inner: number
  top: number
  bottom: number
  iris: number
}

interface DemeanorSnapshot {
  eyeContact: number
  posture: number
  expression: string
  blinkRate: number
  frameCount: number
}

interface DemeanorSummary {
  averageEyeContact: number
  averagePosture: number
  averageBlinkRate: number
  dominantExpression: string
  totalSnapshots: number
}

interface MetricsEntry {
  gaze: number
  posture: number
  expr: string
}

// MediaPipe Face Mesh 关键点位索引（468点 + 10个虹膜点）
const LM = {
  LEFT_EYE: { outer: 33, inner: 133, top: 159, bottom: 145, iris: 468 } as EyeIndex,
  RIGHT_EYE: { outer: 263, inner: 362, top: 386, bottom: 374, iris: 473 } as EyeIndex,
  MOUTH: { left: 61, right: 291, top: 13, bottom: 14 },
  NOSE_TIP: 1,
  CHIN: 152,
  FOREHEAD: 10,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function useDemeanor() {
  // ---- 状态 ----
  const cameraReady = ref(false)
  const isAnalyzing = ref(false)
  const videoEl: ShallowRef<HTMLVideoElement | null> = shallowRef(null)
  const streamRef: ShallowRef<MediaStream | null> = shallowRef(null)

  // 实时仪表盘数据
  const eyeContact: Ref<number> = ref(100)
  const postureScore: Ref<number> = ref(100)
  const expression: Ref<string> = ref('neutral')
  const blinkRate: Ref<number> = ref(0)

  // ---- 内部 ----
  let faceMesh: any = null
  let stream: MediaStream | null = null
  let animFrameId: number | null = null
  let processing = false
  let metricsRing: MetricsEntry[] = []
  const RING_SIZE = 60
  let totalFrames = 0

  // 眨眼检测
  let earHistory: number[] = []
  const EAR_WINDOW = 10
  let blinkCount = 0
  let blinkStartTime = Date.now()
  let wasOpen = true

  /** 虹膜居中度：1.0 = 完全居中看镜头，0.0 = 完全偏向一侧 */
  function irisCenterScore(eye: { inner: Point; outer: Point }, irisPt: Point): number {
    const w = dist(eye.inner, eye.outer)
    if (w < 1e-6) return 0.5
    const irisToInner = dist(irisPt, eye.inner)
    const ratio = irisToInner / w
    return 1 - Math.abs(ratio - 0.5) * 2
  }

  /** 眼部纵横比 (Eye Aspect Ratio)，用于检测眨眼 */
  function eyeAspectRatio(landmarks: Point[], eyeIdx: EyeIndex): number {
    const top = landmarks[eyeIdx.top]
    const bottom = landmarks[eyeIdx.bottom]
    const inner = landmarks[eyeIdx.inner]
    const outer = landmarks[eyeIdx.outer]
    const mid = landmarks[(eyeIdx.top + eyeIdx.bottom) >> 1]
    if (!top || !bottom || !inner || !outer || !mid) return 0.3

    const h1 = dist(top, bottom)
    const h2 = dist(mid, inner)
    const w = dist(inner, outer)
    return w > 1e-6 ? (h1 + h2) / (2 * w) : 0.3
  }

  function analyze(landmarks: Point[]) {
    // 1. 眼神交流：双眼虹膜居中度的平均
    const leftInner = landmarks[LM.LEFT_EYE.inner]
    const leftOuter = landmarks[LM.LEFT_EYE.outer]
    const leftIris = landmarks[LM.LEFT_EYE.iris]
    const rightInner = landmarks[LM.RIGHT_EYE.inner]
    const rightOuter = landmarks[LM.RIGHT_EYE.outer]
    const rightIris = landmarks[LM.RIGHT_EYE.iris]
    if (!leftInner || !leftOuter || !leftIris || !rightInner || !rightOuter || !rightIris) return

    const leftScore = irisCenterScore(
      { inner: leftInner, outer: leftOuter },
      leftIris,
    )
    const rightScore = irisCenterScore(
      { inner: rightInner, outer: rightOuter },
      rightIris,
    )
    const gaze = ((leftScore + rightScore) / 2) * 100

    // 2. 坐姿：鼻子偏离面部中线的程度
    const nosePt = landmarks[LM.NOSE_TIP]
    const leftCheek = landmarks[LM.LEFT_CHEEK]
    const rightCheek = landmarks[LM.RIGHT_CHEEK]
    if (!nosePt || !leftCheek || !rightCheek) return

    const noseX = nosePt.x
    const faceCx = (leftCheek.x + rightCheek.x) / 2
    const faceW = dist(leftCheek, rightCheek)
    const deviation = faceW > 0 ? Math.abs(noseX - faceCx) / faceW : 0
    const posture = Math.max(0, 100 - deviation * 250)

    // 3. 表情：嘴宽 / 嘴高 比值
    const mouthLeft = landmarks[LM.MOUTH.left]
    const mouthRight = landmarks[LM.MOUTH.right]
    const mouthTop = landmarks[LM.MOUTH.top]
    const mouthBottom = landmarks[LM.MOUTH.bottom]
    if (!mouthLeft || !mouthRight || !mouthTop || !mouthBottom) return

    const mw = dist(mouthLeft, mouthRight)
    const mh = dist(mouthTop, mouthBottom)
    const ratio = mh > 0 ? mw / mh : 3
    let expr: string
    if (ratio > 3.8) expr = 'smiling'
    else if (ratio < 2.0) expr = 'nervous'
    else expr = 'neutral'

    // 4. 眨眼检测：左右眼 EAR 均值
    const leftEAR = eyeAspectRatio(landmarks, LM.LEFT_EYE)
    const rightEAR = eyeAspectRatio(landmarks, LM.RIGHT_EYE)
    const ear = (leftEAR + rightEAR) / 2
    earHistory.push(ear)
    if (earHistory.length > EAR_WINDOW) earHistory.shift()
    // EAR < 0.18 判定为闭眼
    const isClosed = ear < 0.18
    if (wasOpen && isClosed) {
      blinkCount++
      wasOpen = false
    }
    if (!isClosed) wasOpen = true
    // 每分钟眨眼次数
    const elapsedMin = (Date.now() - blinkStartTime) / 60000
    if (elapsedMin >= 0.05) {
      blinkRate.value = Math.round(blinkCount / Math.max(elapsedMin, 0.02))
    }

    // 写入滑动窗口
    metricsRing.push({ gaze, posture, expr })
    if (metricsRing.length > RING_SIZE) metricsRing.shift()
    totalFrames++

    // 用滑动窗口均值更新反应式状态
    const n = metricsRing.length
    eyeContact.value = Math.round(metricsRing.reduce((s, m) => s + m.gaze, 0) / n)
    postureScore.value = Math.round(metricsRing.reduce((s, m) => s + m.posture, 0) / n)

    // 出现最频繁的表情
    const cnt: Record<string, number> = {}
    metricsRing.forEach((m) => {
      cnt[m.expr] = (cnt[m.expr] || 0) + 1
    })
    let best = 'neutral'
    let bestN = 0
    for (const [k, v] of Object.entries(cnt)) {
      if (v > bestN) {
        bestN = v
        best = k
      }
    }
    if (bestN >= n * 0.35) expression.value = best
  }

  // ---- 帧循环 ----
  async function tick() {
    if (!isAnalyzing.value || !faceMesh || !videoEl.value) return
    if (processing) {
      animFrameId = requestAnimationFrame(tick)
      return
    }
    processing = true
    try {
      await faceMesh.send({ image: videoEl.value })
    } catch {
      /* skip bad frames */
    }
    processing = false
    animFrameId = requestAnimationFrame(tick)
  }

  // ---- 公开 API ----

  /** 打开摄像头，返回 <video> 元素供模板绑定 srcObject */
  async function startCamera(): Promise<HTMLVideoElement> {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
    })
    streamRef.value = stream
    const v = document.createElement('video')
    v.setAttribute('playsinline', '')
    v.setAttribute('autoplay', '')
    v.srcObject = stream
    await v.play()
    videoEl.value = v
    cameraReady.value = true
    return v
  }

  /** 动态加载 FaceMesh 脚本（如果尚未加载） */
  async function ensureFaceMeshLoaded(): Promise<void> {
    if ((window as any).FaceMesh) return
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src =
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Face Mesh 脚本加载失败'))
      document.head.appendChild(script)
    })
  }

  /** 加载模型并开始逐帧分析 */
  async function startAnalysis(): Promise<void> {
    await ensureFaceMeshLoaded()
    const FM = (window as any).FaceMesh
    if (!FM) throw new Error('Face Mesh 未正确加载')

    faceMesh = new FM({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
    })
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults((results: { multiFaceLandmarks?: Point[][] }) => {
      const landmarks = results.multiFaceLandmarks
      if (landmarks && landmarks[0]) {
        analyze(landmarks[0])
      }
    })

    metricsRing = []
    totalFrames = 0
    blinkCount = 0
    blinkStartTime = Date.now()
    blinkRate.value = 0
    earHistory = []
    isAnalyzing.value = true
    tick()
  }

  /** 停止逐帧分析（保留摄像头） */
  function stopAnalysis(): void {
    isAnalyzing.value = false
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    if (faceMesh) {
      try {
        faceMesh.close()
      } catch {}
      faceMesh = null
    }
  }

  /** 释放摄像头 + 停止分析 */
  function stopCamera(): void {
    stopAnalysis()
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      stream = null
    }
    streamRef.value = null
    cameraReady.value = false
    videoEl.value = null
  }

  /** 当前时刻的仪态快照（每次提交回答时调用） */
  function takeSnapshot(): DemeanorSnapshot {
    const snap: DemeanorSnapshot = {
      eyeContact: eyeContact.value,
      posture: postureScore.value,
      expression: expression.value,
      blinkRate: blinkRate.value,
      frameCount: totalFrames,
    }
    metricsRing = []
    totalFrames = 0
    blinkCount = 0
    blinkStartTime = Date.now()
    return snap
  }

  /** 汇总多轮快照，生成给后端报告的仪态数据 */
  function summarize(snapshots: DemeanorSnapshot[]): DemeanorSummary | null {
    if (!snapshots?.length) return null
    const n = snapshots.length
    const avgEye = snapshots.reduce((s, sn) => s + sn.eyeContact, 0) / n
    const avgPosture = snapshots.reduce((s, sn) => s + sn.posture, 0) / n
    const avgBlink = snapshots.reduce((s, sn) => s + (sn.blinkRate || 0), 0) / n
    const cnt: Record<string, number> = { smiling: 0, nervous: 0, neutral: 0 }
    snapshots.forEach((sn) => {
      cnt[sn.expression] = (cnt[sn.expression] || 0) + 1
    })

    return {
      averageEyeContact: Math.round(avgEye),
      averagePosture: Math.round(avgPosture),
      averageBlinkRate: Math.round(avgBlink),
      dominantExpression:
        Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral',
      totalSnapshots: n,
    }
  }

  return {
    cameraReady,
    isAnalyzing,
    videoEl,
    streamRef,
    eyeContact,
    postureScore,
    expression,
    blinkRate,
    startCamera,
    startAnalysis,
    stopAnalysis,
    stopCamera,
    takeSnapshot,
    summarize,
  }
}
