import { sanitizeRenderedHtml } from './sanitizeHtml';

type JsonNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: JsonNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarks(text: string, marks?: JsonNode['marks']): string {
  if (!marks?.length) return escapeHtml(text);
  let out = escapeHtml(text);
  for (const m of marks) {
    if (m.type === 'bold') out = `<strong>${out}</strong>`;
    else if (m.type === 'italic') out = `<em>${out}</em>`;
    else if (m.type === 'underline') out = `<u>${out}</u>`;
    else if (m.type === 'strike') out = `<s>${out}</s>`;
    else if (m.type === 'code') out = `<code>${out}</code>`;
    else if (m.type === 'link' && m.attrs?.href) {
      const href = escapeHtml(String(m.attrs.href));
      out = `<a href="${href}" rel="noopener noreferrer">${out}</a>`;
    }
  }
  return out;
}

function renderNode(node: JsonNode): string {
  if (!node?.type) return '';
  if (node.type === 'text') return renderMarks(node.text ?? '', node.marks);
  const inner = (node.content ?? []).map(renderNode).join('');

  switch (node.type) {
    case 'doc':
      return inner;
    case 'paragraph':
      return `<p>${inner || '<br>'}</p>`;
    case 'heading': {
      const level = Number(node.attrs?.level ?? 2);
      const tag = level >= 2 && level <= 4 ? `h${level}` : 'h2';
      return `<${tag}>${inner}</${tag}>`;
    }
    case 'bulletList':
      return `<ul>${inner}</ul>`;
    case 'orderedList':
      return `<ol>${inner}</ol>`;
    case 'listItem':
      return `<li>${inner}</li>`;
    case 'blockquote':
      return `<blockquote>${inner}</blockquote>`;
    case 'horizontalRule':
      return '<hr>';
    case 'codeBlock':
      return `<pre><code>${inner}</code></pre>`;
    case 'hardBreak':
      return '<br>';
    case 'image': {
      const src = escapeHtml(String(node.attrs?.src ?? ''));
      const alt = escapeHtml(String(node.attrs?.alt ?? ''));
      return src ? `<img src="${src}" alt="${alt}" loading="lazy">` : '';
    }
    case 'table':
      return `<table>${inner}</table>`;
    case 'tableRow':
      return `<tr>${inner}</tr>`;
    case 'tableHeader':
      return `<th>${inner}</th>`;
    case 'tableCell':
      return `<td>${inner}</td>`;
    case 'callout': {
      const variant = escapeHtml(String(node.attrs?.variant ?? 'info'));
      return `<div class="cms-callout cms-callout--${variant}">${inner}</div>`;
    }
    case 'cta': {
      const label = escapeHtml(String(node.attrs?.label ?? 'بیشتر بدانید'));
      const url = escapeHtml(String(node.attrs?.url ?? '#'));
      return `<div class="cms-cta"><a href="${url}" class="cms-cta__link">${label}</a></div>`;
    }
    case 'faq': {
      const items = (node.attrs?.items as { question: string; answer: string }[]) ?? [];
      const rows = items
        .map(
          (i) =>
            `<details class="cms-faq__item"><summary>${escapeHtml(i.question)}</summary><p>${escapeHtml(i.answer)}</p></details>`
        )
        .join('');
      return `<div class="cms-faq">${rows}</div>`;
    }
    default:
      return inner;
  }
}

export function tiptapJsonToHtml(doc: Record<string, unknown>): string {
  const html = renderNode(doc as JsonNode);
  return sanitizeRenderedHtml(html);
}

export function countWordsFromDoc(doc: Record<string, unknown>): number {
  const texts: string[] = [];
  function walk(n: JsonNode) {
    if (n.type === 'text' && n.text) texts.push(n.text);
    (n.content ?? []).forEach(walk);
  }
  walk(doc as JsonNode);
  const joined = texts.join(' ').trim();
  if (!joined) return 0;
  return joined.split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}
