import { marked } from 'marked';
import { sanitizeHTML, sanitizeText } from '../utils/sanitize';
import { downloadPDF } from './pdfService';
import { convertToDocx } from './conversionService';
import { Template } from '../types/database';

export type ContentType = 'plain' | 'markdown' | 'richtext';
export type ExportFormat = 'pdf' | 'docx' | 'html';

export interface ExportOptions {
  title: string;
  content: string;
  contentType: ContentType;
  format: ExportFormat;
  template?: Template;
}

const processContent = (content: string, contentType: ContentType): string => {
  switch (contentType) {
    case 'markdown':
      const html = marked(content) as string;
      return sanitizeHTML(html);
    case 'richtext':
      return sanitizeHTML(content);
    case 'plain':
      return sanitizeText(content).replace(/\n/g, '<br>');
    default:
      return sanitizeHTML(content);
  }
};

const applyTemplate = (
  content: string,
  title: string,
  template?: Template
): string => {
  const defaultStyles = {
    fontSize: '12pt',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margins: '1in',
  };

  const templateStyles = template?.structure || defaultStyles;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizeText(title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      margin: ${templateStyles.margins || '1in'};
    }

    body {
      font-family: ${templateStyles.fontFamily || 'Arial, sans-serif'};
      font-size: ${templateStyles.fontSize || '12pt'};
      line-height: 1.6;
      color: #333;
      max-width: ${templateStyles.maxWidth || '800px'};
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 0.5em;
      color: #1a1a1a;
      line-height: 1.2;
      font-weight: 700;
    }

    h2 {
      font-size: 2em;
      margin-top: 1em;
      margin-bottom: 0.5em;
      color: #2a2a2a;
      line-height: 1.3;
      font-weight: 600;
    }

    h3 {
      font-size: 1.5em;
      margin-top: 1em;
      margin-bottom: 0.5em;
      color: #3a3a3a;
      font-weight: 600;
    }

    p {
      margin-bottom: 1em;
    }

    ul, ol {
      margin-bottom: 1em;
      padding-left: 2em;
    }

    li {
      margin-bottom: 0.5em;
    }

    strong {
      font-weight: 600;
    }

    em {
      font-style: italic;
    }

    u {
      text-decoration: underline;
    }

    a {
      color: #0066cc;
      text-decoration: none;
    }

    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin: 1em 0;
      color: #666;
      font-style: italic;
    }

    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    pre {
      background: #f5f5f5;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
      margin-bottom: 1em;
    }

    pre code {
      background: none;
      padding: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1em;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 0.75em;
      text-align: left;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
    }

    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 2em 0;
    }

    ${template?.css_styles || ''}
  </style>
</head>
<body>
  <h1>${sanitizeText(title)}</h1>
  ${content}
</body>
</html>
  `.trim();
};

export const exportDocument = async (options: ExportOptions): Promise<void> => {
  const { title, content, contentType, format, template } = options;

  const processedContent = processContent(content, contentType);
  const html = applyTemplate(processedContent, title, template);

  switch (format) {
    case 'html':
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const htmlUrl = window.URL.createObjectURL(htmlBlob);
      const htmlLink = document.createElement('a');
      htmlLink.href = htmlUrl;
      htmlLink.download = `${title}.html`;
      document.body.appendChild(htmlLink);
      htmlLink.click();
      document.body.removeChild(htmlLink);
      window.URL.revokeObjectURL(htmlUrl);
      break;

    case 'docx':
      const docxBlob = await convertToDocx(html);
      const docxUrl = window.URL.createObjectURL(docxBlob);
      const docxLink = document.createElement('a');
      docxLink.href = docxUrl;
      docxLink.download = `${title}.docx`;
      document.body.appendChild(docxLink);
      docxLink.click();
      document.body.removeChild(docxLink);
      window.URL.revokeObjectURL(docxUrl);
      break;

    case 'pdf':
      await downloadPDF({ title, html }, title);
      break;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};
