import DOMPurify from 'dompurify';
import type { ContentType } from './types';

const ALLOWED_TAGS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'code',
  'pre',
  'blockquote',
  'table',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title'];

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload'],
  });
};

export const sanitizePlainText = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const sanitizeContentForStorage = (
  content: string,
  contentType: ContentType
): string => {
  if (contentType === 'richtext') {
    return sanitizeHtml(content);
  }

  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
};

export const plainTextToHtml = (text: string): string => {
  const safeText = sanitizePlainText(text);
  const lines = safeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return '<p></p>';
  }

  return lines.map((line) => `<p>${line}</p>`).join('');
};
