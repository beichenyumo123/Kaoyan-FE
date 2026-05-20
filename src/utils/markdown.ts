import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,       // 信任后端 Jsoup XSS 清洗后的安全 HTML
  linkify: true,    // 自动将 URL 转为链接
  typographer: true, // 智能引号、破折号等
  breaks: true,     // 换行符转为 <br>
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
