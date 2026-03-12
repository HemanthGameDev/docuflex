import { marked } from 'marked';
import { sanitizeHtml } from './sanitizationService';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export const convertMarkdownToHtml = (markdown: string): string => {
  const parsed = marked.parse(markdown);
  const html = typeof parsed === 'string' ? parsed : '';
  return sanitizeHtml(html);
};
