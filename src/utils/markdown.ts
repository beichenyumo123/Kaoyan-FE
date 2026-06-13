import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import hljs from 'highlight.js'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-dark.css'

const md = new MarkdownIt({
  html: true,       // 信任后端 Jsoup XSS 清洗后的安全 HTML
  linkify: true,    // 自动将 URL 转为链接
  typographer: true, // 智能引号、破折号等
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch (_) {}
    }
    return '' // use default escaping
  },
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

/**
 * 增强代码块：为 <pre><code> 添加语言标签头部和复制按钮
 * 在 Markdown 渲染后调用，纯 DOM 字符串处理，零依赖
 */
export function enhanceCodeBlocks(html: string): string {
  if (!html) return html

  // 匹配 <pre><code class="language-xxx"> 或 <pre><code>
  return html.replace(
    /<pre><code(?:\s+class="language-(\w+)")?>/g,
    (_match: string, lang: string | undefined) => {
      const langLabel = lang || 'code'
      return `<div class="code-block-wrapper"><div class="code-block-header"><span class="lang-label">${langLabel}</span><button class="copy-code-btn" type="button"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:2px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>复制</button></div><pre><code${lang ? ` class="language-${lang}"` : ''}>`
    },
  ).replace(/<\/code><\/pre>/g, '</code></pre></div>')
}

/** 剥离 HTML 标签，取纯文本（用于帖子摘要等场景） */
export function stripHtml(html: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
}
