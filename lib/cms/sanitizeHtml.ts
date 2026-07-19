import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
  'blockquote', 'hr', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'pre', 'code', 'div', 'span', 'br',
];

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  div: ['class', 'data-type'],
  span: ['class'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
};

export function sanitizeRenderedHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  });
}
