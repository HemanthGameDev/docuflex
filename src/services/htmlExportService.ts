import { sanitizePlainText } from './sanitizationService';

export interface HtmlDocumentOptions {
  title: string;
  bodyHtml: string;
  css?: string;
}

export const createHtmlDocument = (options: HtmlDocumentOptions): string => {
  const { title, bodyHtml, css = '' } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizePlainText(title)}</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0 auto;
      padding: 24px;
      background: #ffffff;
    }

    ${css}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>
  `.trim();
};

export const createHtmlBlob = (htmlDocument: string): Blob => {
  return new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
};
