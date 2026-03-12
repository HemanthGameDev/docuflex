import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ConvertRequest {
  title: string;
  content: string;
  contentType: 'plain' | 'markdown' | 'richtext';
  format: 'pdf' | 'docx' | 'html';
  templateId?: string;
}

const applyTemplate = (content: string, title: string, templateId?: string): string => {
  const templates: Record<string, any> = {
    resume: {
      fontSize: '11pt',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      style: 'professional'
    },
    academic: {
      fontSize: '12pt',
      fontFamily: 'Times New Roman, serif',
      maxWidth: '800px',
      style: 'formal'
    },
    blog: {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      maxWidth: '680px',
      style: 'modern'
    }
  };

  const template = templateId ? templates[templateId] || templates.resume : templates.resume;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${template.fontFamily};
      font-size: ${template.fontSize};
      line-height: 1.6;
      color: #333;
      max-width: ${template.maxWidth};
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 0.5em;
      color: #1a1a1a;
      line-height: 1.2;
    }

    h2 {
      font-size: 2em;
      margin-top: 1em;
      margin-bottom: 0.5em;
      color: #2a2a2a;
      line-height: 1.3;
    }

    h3 {
      font-size: 1.5em;
      margin-top: 1em;
      margin-bottom: 0.5em;
      color: #3a3a3a;
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
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>
  `.trim();
};

const convertMarkdownToHTML = async (markdown: string): Promise<string> => {
  const lines = markdown.split('\n');
  let html = '';
  let inCodeBlock = false;
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html += '</code></pre>\n';
        inCodeBlock = false;
      } else {
        html += '<pre><code>\n';
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      html += line + '\n';
      continue;
    }

    if (line.startsWith('# ')) {
      html += `<h1>${line.substring(2)}</h1>\n`;
    } else if (line.startsWith('## ')) {
      html += `<h2>${line.substring(3)}</h2>\n`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${line.substring(4)}</h3>\n`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `<li>${line.substring(2)}</li>\n`;
    } else if (/^\d+\.\s/.test(line)) {
      if (!inList) {
        html += '<ol>\n';
        inList = true;
      }
      html += `<li>${line.replace(/^\d+\.\s/, '')}</li>\n`;
    } else {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }

      if (line.trim() === '') {
        html += '<br>\n';
      } else {
        let processedLine = line;
        processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        processedLine = processedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');
        processedLine = processedLine.replace(/`(.+?)`/g, '<code>$1</code>');
        processedLine = processedLine.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
        html += `<p>${processedLine}</p>\n`;
      }
    }
  }

  if (inList) {
    html += '</ul>\n';
  }
  if (inCodeBlock) {
    html += '</code></pre>\n';
  }

  return html;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { title, content, contentType, format, templateId }: ConvertRequest = await req.json();

    let processedContent = content;

    if (contentType === 'markdown') {
      processedContent = await convertMarkdownToHTML(content);
    } else if (contentType === 'plain') {
      processedContent = content.replace(/\n/g, '<br>\n').replace(/^(.+)$/gm, '<p>$1</p>');
    }

    if (format === 'html') {
      const html = applyTemplate(processedContent, title, templateId);

      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="${title}.html"`,
        },
      });
    } else if (format === 'pdf') {
      const html = applyTemplate(processedContent, title, templateId);

      return new Response(
        JSON.stringify({
          error: "PDF generation requires additional setup. Please use HTML format for now.",
          html: html
        }),
        {
          status: 501,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else if (format === 'docx') {
      return new Response(
        JSON.stringify({
          error: "DOCX generation requires additional setup. Please use HTML format for now.",
        }),
        {
          status: 501,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unsupported format" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error converting document:', error);

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
