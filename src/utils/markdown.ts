import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,       // 信任后端 Jsoup XSS 清洗后的安全 HTML
  linkify: true,    // 自动将 URL 转为链接
  typographer: true, // 智能引号、破折号等
})

// 链接在新窗口打开
const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const hrefIndex = token.attrIndex('href')
  if (hrefIndex >= 0) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }
  return defaultRender(tokens, idx, options, env, self)
}

export function renderMarkdown(content) {
  if (!content) return ''
  return md.render(content)
}

/** 剥离 HTML 标签，取纯文本（用于帖子摘要等场景） */
export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
}
