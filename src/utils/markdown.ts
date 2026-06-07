import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const md = new MarkdownIt({
  html: true,       // 信任后端 Jsoup XSS 清洗后的安全 HTML
  linkify: true,    // 自动将 URL 转为链接
  typographer: true, // 智能引号、破折号等
})

// LaTeX 数学公式渲染（KaTeX）
md.use(texmath, {
  engine: katex,
  delimiters: ['dollars', 'fences'],  // 支持 $...$、$$...$$ 和 ```math 块
  katexOptions: {
    throwOnError: false,   // 公式错误时不抛异常，降级显示原文
    trust: true,
    strict: false,
  },
})

// 链接在新窗口打开
const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens: any, idx: any, options: any, _env: any, self: any) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens: any, idx: any, options: any, env: any, self: any) {
  const token = tokens[idx]
  if (token) {
    const hrefIndex = token.attrIndex('href')
    if (hrefIndex >= 0) {
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noopener noreferrer')
    }
  }
  return defaultRender(tokens, idx, options, env, self)
}

export function renderMarkdown(content: string) {
  if (!content) return ''
  // 预处理：将 AI 返回的 LaTeX 格式标准化
  // \( ... \) 行内公式 → $...$
  // \[ ... \] 块级公式 → $$...$$
  let processed = content
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$')
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
  return md.render(processed)
}

/** 剥离 HTML 标签，取纯文本（用于帖子摘要等场景） */
export function stripHtml(html: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
}
