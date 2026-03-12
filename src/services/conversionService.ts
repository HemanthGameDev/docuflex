import { marked } from 'marked';
import { sanitizeHTML, sanitizeText } from '../utils/sanitize';
import { convertHtmlToDocx } from './docxService';

export type ContentType = 'plain' | 'markdown' | 'richtext';
export type ExportFormat = 'pdf' | 'docx' | 'html';

interface ConversionOptions {
  title: string;
  content: string;
  contentType: ContentType;
  format: ExportFormat;
  templateId?: string;
}

interface Template {
  id: string;
  name: string;
  structure: {
    fontSize?: string;
    fontFamily?: string;
    maxWidth?: string;
    margins?: string;
  };
}

export const convertMarkdownToHTML = (markdown: string): string => {
  const html = marked(markdown) as string;
  return sanitizeHTML(html);
};

export const convertPlainToHTML = (plainText: string): string => {
  const escaped = sanitizeText(plainText);
  return escaped.replace(/\n/g, '<br>');
};

export const applyTemplate = (
  content: string,
  title: string,
  template?: Template
): string => {
  const defaultTemplate = {
    fontSize: '12pt',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margins: '1in',
  };

  const templateStyles = template?.structure || defaultTemplate;

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

    h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.5em;
      color: #4a4a4a;
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

    s {
      text-decoration: line-through;
    }

    a {
      color: #0066cc;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
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

    @media print {
      body {
        max-width: 100%;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <h1>${sanitizeText(title)}</h1>
  ${content}
</body>
</html>
  `.trim();
};

export const processContent = (
  content: string,
  contentType: ContentType
): string => {
  switch (contentType) {
    case 'markdown':
      return convertMarkdownToHTML(content);
    case 'richtext':
      return sanitizeHTML(content);
    case 'plain':
      return convertPlainToHTML(content);
    default:
      return sanitizeHTML(content);
  }
};

export const generateHTMLDocument = (
  options: ConversionOptions,
  template?: Template
): string => {
  const processedContent = processContent(options.content, options.contentType);
  return applyTemplate(processedContent, options.title, template);
};

export const convertToDocx = async (htmlContent: string): Promise<Blob> => {
  return convertHtmlToDocx(htmlContent);
};

export const downloadFile = (
  blob: Blob,
  filename: string,
  mimeType: string
): void => {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportDocument = async (
  options: ConversionOptions,
  template?: Template
): Promise<void> => {
  const htmlContent = generateHTMLDocument(options, template);

  switch (options.format) {
    case 'html':
      downloadFile(
        new Blob([htmlContent], { type: 'text/html' }),
        `${options.title}.html`,
        'text/html'
      );
      break;

    case 'docx':
      {
        const docxBlob = await convertToDocx(htmlContent);
        downloadFile(
          docxBlob,
          `${options.title}.docx`,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
      }
      break;

    case 'pdf':
      throw new Error('PDF export requires server-side conversion. Use the edge function instead.');

    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
};
