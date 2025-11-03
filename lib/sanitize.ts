/**
 * HTML Sanitization utility using isomorphic-dompurify
 * Prevents XSS attacks by cleaning dangerous HTML/attributes
 * Fallback to basic sanitization if DOMPurify not available
 */

let DOMPurify: any = null

// Try to load DOMPurify (works in both Node and browser)
try {
  const createDOMPurify = require('isomorphic-dompurify')
  DOMPurify = createDOMPurify()
} catch (err) {
  console.warn('DOMPurify not available, using fallback sanitizer')
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''

  if (DOMPurify) {
    // Use DOMPurify with strict configuration
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'rel', 'target', 'width', 'height', 'loading',
        'colspan', 'rowspan'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      KEEP_CONTENT: true,
      RETURN_TRUSTED_TYPE: false
    })
  }

  // Fallback: Basic sanitization (removes scripts and event handlers)
  return String(dirty)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*["']?[^"'>]*["']?/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Sanitize JSON content (for Tiptap editor content)
 * @param content - Tiptap JSON content object
 * @returns Sanitized content object
 */
export function sanitizeEditorContent(content: any): any {
  if (!content) return content

  // If it's a string HTML, sanitize it
  if (typeof content === 'string') {
    return sanitizeHtml(content)
  }

  // If it's Tiptap JSON format with html property
  if (content.html && typeof content.html === 'string') {
    return {
      ...content,
      html: sanitizeHtml(content.html)
    }
  }

  return content
}
