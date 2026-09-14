import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ breaks: true })

export function renderMarkdown(text) {
  const html = marked.parse(text || '')
  return DOMPurify.sanitize(html)
}
