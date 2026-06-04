/**
 * 错题本 PDF 导出
 * 使用 html2canvas + jsPDF 实现纯客户端导出
 */
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export interface WrongQuestion {
  id: number
  imageUrl: string | null
  ocrText: string
  subject: string
  errorReason: string
  notes: string
  masteryLevel: string
  knowledgePoints: { id: number; name: string }[]
  tags: string[]
  reviewCount: number
  lastReviewDate: string | null
  createdAt: string
}

const SUBJECT_MAP: Record<string, string> = {
  MATH: '数学',
  ENGLISH: '英语',
  POLITICS: '政治',
  MAJOR: '专业课',
}

const ERROR_REASON_MAP: Record<string, string> = {
  CONCEPT: '概念不清',
  CALCULATION: '计算错误',
  CARELESS: '审题失误',
  FORGET: '知识点遗忘',
  OTHER: '其他',
}

const MASTERY_MAP: Record<string, string> = {
  NONE: '完全不会',
  LOW: '不太熟练',
  MEDIUM: '基本掌握',
  HIGH: '完全掌握',
}

function createExportElement(questions: WrongQuestion[], title: string): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0; width: 750px;
    background: #fff; padding: 40px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #27272a; line-height: 1.8;
  `

  let html = `
    <div style="text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #27272a;">
      <h1 style="font-size:28px;font-weight:700;margin:0 0 8px;">📒 ${title}</h1>
      <p style="font-size:14px;color:#71717a;margin:0;">导出时间: ${new Date().toLocaleString('zh-CN')}</p>
      <p style="font-size:14px;color:#71717a;margin:4px 0 0;">共 ${questions.length} 道错题</p>
    </div>
  `

  questions.forEach((q, index) => {
    const subjectLabel = SUBJECT_MAP[q.subject] || q.subject
    const errorLabel = ERROR_REASON_MAP[q.errorReason] || q.errorReason
    const masteryLabel = MASTERY_MAP[q.masteryLevel] || q.masteryLevel

    html += `
      <div style="margin-bottom:35px;padding:20px;border:1px solid #e4e4e7;border-radius:12px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3 style="font-size:18px;font-weight:600;margin:0;">
            <span style="background:#27272a;color:#fff;padding:2px 10px;border-radius:12px;font-size:13px;margin-right:8px;">#${index + 1}</span>
            ${subjectLabel}
          </h3>
          <span style="font-size:12px;color:#71717a;">${new Date(q.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>

        <div style="margin-bottom:10px;display:flex;gap:12px;flex-wrap:wrap;">
          <span style="background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:6px;font-size:12px;">错因: ${errorLabel}</span>
          <span style="background:#dbeafe;color:#2563eb;padding:2px 10px;border-radius:6px;font-size:12px;">掌握: ${masteryLabel}</span>
          <span style="background:#fef3c7;color:#d97706;padding:2px 10px;border-radius:6px;font-size:12px;">已复习${q.reviewCount}次</span>
        </div>

        ${q.knowledgePoints.length ? `
        <div style="margin-bottom:10px;font-size:13px;color:#52525b;">
          知识点: ${q.knowledgePoints.map((kp: { name: string }) => kp.name).join('、')}
        </div>
        ` : ''}

        ${(q.ocrText || (q as any).questionContent) ? `
        <div style="margin-bottom:10px;padding:12px;background:#f4f4f5;border-radius:8px;">
          <p style="font-weight:600;font-size:13px;color:#71717a;margin:0 0 4px;">📝 题目内容:</p>
          <p style="font-size:14px;color:#3f3f46;margin:0;white-space:pre-wrap;">${q.ocrText || (q as any).questionContent}</p>
        </div>
        ` : ''}

        ${(q.notes || (q as any).answer) ? `
        <div style="margin-bottom:10px;">
          <p style="font-weight:600;font-size:13px;color:#71717a;margin:0 0 4px;">💡 备注:</p>
          <p style="font-size:14px;color:#3f3f46;margin:0;white-space:pre-wrap;">${q.notes || (q as any).answer}</p>
        </div>
        ` : ''}

        ${q.tags.length ? `
        <div style="font-size:12px;color:#a1a1aa;">
          标签: ${q.tags.map((t: string) => `#${t}`).join(' ')}
        </div>
        ` : ''}
      </div>
    `
  })

  html += `
    <div style="text-align:center;margin-top:40px;padding-top:15px;border-top:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;">
      由考研论坛错题本生成
    </div>
  `

  container.innerHTML = html
  return container
}

/**
 * 导出单道错题为 PDF
 */
export async function exportQuestionToPdf(question: WrongQuestion): Promise<void> {
  return exportQuestionsToPdf([question], `错题详情 #${question.id}`)
}

/**
 * 批量导出错题为 PDF
 */
export async function exportQuestionsToPdf(questions: WrongQuestion[], title: string): Promise<void> {
  const element = createExportElement(questions, title)
  document.body.appendChild(element)

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF('p', 'mm', 'a4')

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${title}.pdf`)
  } finally {
    document.body.removeChild(element)
  }
}
