export const blogTemplate = {
  name: 'Modern Blog Post',
  category: 'blog',
  description: 'Clean, modern blog post template with great readability',
  structure: {
    fontSize: '16px',
    fontFamily: "'Georgia', 'Cambria', serif",
    maxWidth: '680px',
    margins: '0.5in',
  },
  css_styles: `
    body {
      font-family: 'Georgia', 'Cambria', serif;
      font-size: 18px;
      line-height: 1.8;
      color: #1a1a1a;
    }

    h1 {
      font-size: 3em;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 0.5em;
      color: #000;
      letter-spacing: -0.02em;
    }

    h2 {
      font-size: 2em;
      font-weight: 700;
      margin-top: 2em;
      margin-bottom: 0.8em;
      color: #1a1a1a;
      line-height: 1.2;
    }

    h3 {
      font-size: 1.5em;
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.6em;
      color: #2a2a2a;
    }

    p {
      margin-bottom: 1.5em;
      line-height: 1.8;
    }

    p:first-of-type::first-letter {
      font-size: 3.5em;
      line-height: 1;
      float: left;
      margin: 0.1em 0.1em 0 0;
      font-weight: bold;
      color: #3b82f6;
    }

    blockquote {
      font-size: 1.2em;
      font-style: italic;
      border-left: 4px solid #3b82f6;
      padding-left: 1.5em;
      margin: 2em 0;
      color: #4a5568;
    }

    code {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      padding: 0.2em 0.4em;
      font-size: 0.9em;
      border-radius: 4px;
    }

    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1.5em;
      border-radius: 8px;
      overflow-x: auto;
      margin: 2em 0;
    }

    pre code {
      background: none;
      border: none;
      color: #e2e8f0;
      padding: 0;
    }

    ul, ol {
      margin-bottom: 1.5em;
      padding-left: 2em;
    }

    li {
      margin-bottom: 0.8em;
    }

    a {
      color: #3b82f6;
      text-decoration: underline;
      text-decoration-color: rgba(59, 130, 246, 0.3);
      text-decoration-thickness: 2px;
      transition: all 0.2s;
    }

    a:hover {
      text-decoration-color: rgba(59, 130, 246, 1);
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 2em 0;
    }

    .byline {
      color: #64748b;
      font-size: 0.9em;
      margin-bottom: 2em;
      font-style: italic;
    }
  `,
  html_template: `
    <div class="byline">
      <p>By Author Name • Published on Date</p>
    </div>
  `,
};
