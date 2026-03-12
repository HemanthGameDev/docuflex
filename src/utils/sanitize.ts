import {
  sanitizeHtml,
  sanitizePlainText,
} from '../services/sanitizationService';

export function sanitizeHTML(html: string): string {
  return sanitizeHtml(html);
}

export function sanitizeText(text: string): string {
  return sanitizePlainText(text);
}
