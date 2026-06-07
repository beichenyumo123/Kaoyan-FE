declare module 'markdown-it-texmath' {
  import MarkdownIt from 'markdown-it'
  interface TexmathOptions {
    engine?: any
    delimiters?: string | string[]
    katexOptions?: Record<string, any>
  }
  const texmath: MarkdownIt.PluginWithOptions<TexmathOptions>
  export default texmath
}
