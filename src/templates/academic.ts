export const academicTemplate = {
  name: 'Academic Report',
  category: 'academic',
  description: 'Formal academic report template with citation support',
  structure: {
    fontSize: '12pt',
    fontFamily: "'Times New Roman', 'Georgia', serif",
    maxWidth: '800px',
    margins: '1in',
  },
  css_styles: `
    body {
      font-family: 'Times New Roman', 'Georgia', serif;
      font-size: 12pt;
      line-height: 2;
    }

    h1 {
      font-size: 2em;
      text-align: center;
      margin-bottom: 1em;
      color: #000;
      font-weight: 700;
      text-transform: none;
    }

    h2 {
      font-size: 1.5em;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      color: #000;
      font-weight: 700;
    }

    h3 {
      font-size: 1.2em;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
      color: #000;
      font-weight: 700;
      font-style: italic;
    }

    p {
      text-align: justify;
      text-indent: 0.5in;
      margin-bottom: 0;
      line-height: 2;
    }

    p:first-of-type {
      text-indent: 0;
    }

    blockquote {
      margin-left: 0.5in;
      margin-right: 0.5in;
      font-style: italic;
      border-left: none;
      padding-left: 0;
    }

    ul, ol {
      margin-left: 0.5in;
      margin-bottom: 1em;
    }

    li {
      margin-bottom: 0.5em;
    }

    .abstract {
      margin: 2em 1in;
      text-align: justify;
    }

    .abstract h2 {
      text-align: center;
      font-size: 1.2em;
      margin-bottom: 1em;
    }

    .references {
      margin-top: 2em;
    }

    .references h2 {
      text-align: center;
    }

    table {
      margin: 1em auto;
      border: 1px solid #000;
    }

    th, td {
      border: 1px solid #000;
      padding: 0.5em;
    }
  `,
  html_template: `
    <div class="title-page">
      <h1>Document Title</h1>
      <p style="text-align: center; text-indent: 0;">Author Name</p>
      <p style="text-align: center; text-indent: 0;">Institution Name</p>
      <p style="text-align: center; text-indent: 0;">Date</p>
    </div>
  `,
};
