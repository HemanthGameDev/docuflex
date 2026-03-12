/*
  # Seed Professional Templates

  1. Templates
    - Insert Resume template with professional styling
    - Insert Academic Report template with formal styling
    - Insert Blog Post template with modern styling

  2. Features
    - Each template includes HTML structure and CSS styles
    - Templates support markdown content injection
    - Professional layouts with proper typography and spacing
*/

INSERT INTO templates (name, description, category, html_template, css_styles) VALUES
(
  'Professional Resume',
  'Clean and professional resume template perfect for job applications',
  'resume',
  '<div class="resume-container"><div class="resume-header"><h1>{{title}}</h1></div><div class="resume-content">{{content}}</div></div>',
  'body { font-family: "Calibri", Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; } .resume-header { border-bottom: 3px solid #2c3e50; padding-bottom: 15px; margin-bottom: 25px; } .resume-header h1 { font-size: 28pt; font-weight: 700; color: #2c3e50; margin: 0; } h2 { font-size: 16pt; font-weight: 600; color: #2c3e50; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; } h3 { font-size: 13pt; font-weight: 600; color: #34495e; margin-top: 15px; margin-bottom: 8px; } p { margin-bottom: 10px; } ul { margin-bottom: 12px; padding-left: 25px; } li { margin-bottom: 6px; } strong { font-weight: 600; color: #2c3e50; } @media print { body { padding: 20px; } }'
),
(
  'Academic Report',
  'Formal academic report template with proper citations and structure',
  'academic',
  '<div class="academic-container"><div class="academic-header"><h1>{{title}}</h1></div><div class="academic-content">{{content}}</div></div>',
  'body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 2; color: #000; max-width: 750px; margin: 0 auto; padding: 1in; text-align: justify; } .academic-header { text-align: center; margin-bottom: 40px; } .academic-header h1 { font-size: 18pt; font-weight: 700; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; } h2 { font-size: 14pt; font-weight: 700; margin-top: 30px; margin-bottom: 15px; text-align: left; } h3 { font-size: 12pt; font-weight: 700; margin-top: 20px; margin-bottom: 10px; font-style: italic; text-align: left; } p { margin-bottom: 12pt; text-indent: 0.5in; } p:first-of-type { text-indent: 0; } ul, ol { margin-bottom: 12pt; margin-left: 0.5in; } li { margin-bottom: 6pt; } blockquote { margin: 20px 0.5in; padding-left: 20px; border-left: 3px solid #ccc; font-style: italic; } @page { margin: 1in; } @media print { body { padding: 0; } }'
),
(
  'Modern Blog Post',
  'Engaging blog post template with modern design and readability focus',
  'blog',
  '<div class="blog-container"><article class="blog-article"><header class="blog-header"><h1>{{title}}</h1></header><div class="blog-content">{{content}}</div></article></div>',
  'body { font-family: "Georgia", "Cambria", serif; font-size: 18px; line-height: 1.8; color: #2d3748; max-width: 680px; margin: 0 auto; padding: 60px 30px; background: #fff; } .blog-header { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; } .blog-header h1 { font-size: 42px; font-weight: 700; line-height: 1.2; color: #1a202c; margin: 0 0 15px 0; letter-spacing: -0.5px; } h2 { font-size: 32px; font-weight: 600; line-height: 1.3; color: #2d3748; margin-top: 50px; margin-bottom: 20px; } h3 { font-size: 24px; font-weight: 600; line-height: 1.4; color: #4a5568; margin-top: 35px; margin-bottom: 15px; } p { margin-bottom: 24px; } p:first-letter { font-size: 1.3em; font-weight: 600; color: #1a202c; } ul, ol { margin-bottom: 24px; padding-left: 30px; } li { margin-bottom: 10px; } strong { font-weight: 600; color: #1a202c; } em { font-style: italic; color: #4a5568; } a { color: #3182ce; text-decoration: underline; transition: color 0.2s; } a:hover { color: #2c5aa0; } blockquote { margin: 30px 0; padding: 20px 30px; background: #f7fafc; border-left: 4px solid #3182ce; font-style: italic; color: #4a5568; } code { background: #edf2f7; padding: 3px 8px; border-radius: 4px; font-family: "Courier New", monospace; font-size: 0.9em; color: #e53e3e; } pre { background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; margin-bottom: 24px; } pre code { background: none; padding: 0; color: #e2e8f0; } @media print { body { padding: 30px; font-size: 14px; } .blog-header h1 { font-size: 32px; } h2 { font-size: 24px; } h3 { font-size: 18px; } }'
)
ON CONFLICT (id) DO NOTHING;