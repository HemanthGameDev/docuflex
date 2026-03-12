export const resumeTemplate = {
  name: 'Professional Resume',
  category: 'resume',
  description: 'Clean, professional resume template with modern styling',
  structure: {
    fontSize: '11pt',
    fontFamily: "'Calibri', 'Arial', sans-serif",
    maxWidth: '800px',
    margins: '0.75in',
  },
  css_styles: `
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
    }

    h1 {
      font-size: 2.2em;
      color: #1e293b;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 0.3em;
      margin-bottom: 0.8em;
    }

    h2 {
      font-size: 1.4em;
      color: #334155;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.2em;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
    }

    h3 {
      font-size: 1.1em;
      color: #475569;
      margin-top: 0.8em;
      margin-bottom: 0.4em;
    }

    p {
      margin-bottom: 0.6em;
      line-height: 1.5;
    }

    ul {
      list-style-type: disc;
      padding-left: 1.5em;
      margin-bottom: 0.8em;
    }

    li {
      margin-bottom: 0.3em;
      line-height: 1.4;
    }

    strong {
      color: #1e293b;
      font-weight: 600;
    }

    .contact-info {
      text-align: center;
      margin-bottom: 1.5em;
      color: #64748b;
    }

    .section-title {
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `,
  html_template: `
    <div class="contact-info">
      <p>Email: your.email@example.com | Phone: (123) 456-7890 | LinkedIn: linkedin.com/in/yourname</p>
    </div>
  `,
};
