export const professionalTemplate = {
  name: 'Professional Article',
  category: 'professional',
  description: 'Professional business article template',
  structure: {
    fontSize: '11pt',
    fontFamily: "'Arial', 'Helvetica', sans-serif",
    maxWidth: '750px',
    margins: '1in',
  },
  css_styles: `
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #2d3748;
    }

    h1 {
      font-size: 2.5em;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 0.5em;
      line-height: 1.2;
      border-bottom: 4px solid #3b82f6;
      padding-bottom: 0.3em;
    }

    h2 {
      font-size: 1.8em;
      font-weight: 600;
      color: #2d3748;
      margin-top: 2em;
      margin-bottom: 0.8em;
      line-height: 1.3;
    }

    h3 {
      font-size: 1.3em;
      font-weight: 600;
      color: #4a5568;
      margin-top: 1.5em;
      margin-bottom: 0.6em;
    }

    p {
      margin-bottom: 1.2em;
      line-height: 1.7;
    }

    strong {
      font-weight: 600;
      color: #1a202c;
    }

    ul, ol {
      margin-bottom: 1.2em;
      padding-left: 2em;
    }

    li {
      margin-bottom: 0.6em;
      line-height: 1.6;
    }

    blockquote {
      background: #f7fafc;
      border-left: 4px solid #3b82f6;
      padding: 1em 1.5em;
      margin: 1.5em 0;
      color: #4a5568;
      font-style: italic;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      background: #fff;
    }

    th {
      background: #3b82f6;
      color: #fff;
      font-weight: 600;
      text-align: left;
      padding: 0.8em;
    }

    td {
      border: 1px solid #e2e8f0;
      padding: 0.8em;
    }

    tr:nth-child(even) {
      background: #f7fafc;
    }

    code {
      background: #edf2f7;
      border: 1px solid #cbd5e0;
      padding: 0.2em 0.4em;
      font-size: 0.9em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    pre {
      background: #2d3748;
      color: #e2e8f0;
      padding: 1.2em;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1.5em 0;
    }

    pre code {
      background: none;
      border: none;
      color: #e2e8f0;
      padding: 0;
    }

    .header-info {
      color: #718096;
      font-size: 0.9em;
      margin-bottom: 2em;
      padding-bottom: 1em;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-highlight {
      background: #ebf8ff;
      border-left: 4px solid #3b82f6;
      padding: 1em 1.5em;
      margin: 1.5em 0;
    }
  `,
  html_template: `
    <div class="header-info">
      <p>Company Name • Department • Date</p>
    </div>
  `,
};
