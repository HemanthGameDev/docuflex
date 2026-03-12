import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from "npm:docx@9.6.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateDocxRequest {
  title: string;
  content: string;
  contentType: 'plain' | 'markdown' | 'richtext';
}

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const parseInlineFormatting = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  let currentIndex = 0;

  const boldRegex = /\*\*(.+?)\*\*/g;
  const italicRegex = /\*(.+?)\*/g;
  const combinedRegex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;

  let match;
  const matches: Array<{ index: number; length: number; text: string; bold?: boolean; italic?: boolean }> = [];

  while ((match = boldRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      text: match[1],
      bold: true,
    });
  }

  boldRegex.lastIndex = 0;

  while ((match = italicRegex.exec(text)) !== null) {
    if (!text.substring(match.index - 1, match.index + match[0].length + 1).includes('**')) {
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[1],
        italic: true,
      });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  for (const m of matches) {
    if (m.index > currentIndex) {
      segments.push({ text: text.substring(currentIndex, m.index) });
    }
    segments.push({ text: m.text, bold: m.bold, italic: m.italic });
    currentIndex = m.index + m.length;
  }

  if (currentIndex < text.length) {
    segments.push({ text: text.substring(currentIndex) });
  }

  return segments.length > 0 ? segments : [{ text }];
};

const parseMarkdownToParagraphs = (markdown: string, title: string): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  );

  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const segments = parseInlineFormatting(line.substring(2));
      paragraphs.push(
        new Paragraph({
          children: segments.map(seg => new TextRun({ text: seg.text, bold: seg.bold, italics: seg.italic })),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '');
      const segments = parseInlineFormatting(text);
      paragraphs.push(
        new Paragraph({
          children: segments.map(seg => new TextRun({ text: seg.text, bold: seg.bold, italics: seg.italic })),
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { after: 100 },
        })
      );
    } else if (line !== '') {
      const segments = parseInlineFormatting(line);
      paragraphs.push(
        new Paragraph({
          children: segments.map(seg => new TextRun({ text: seg.text, bold: seg.bold, italics: seg.italic })),
          spacing: { after: 200 },
        })
      );
    }

    i++;
  }

  return paragraphs;
};

const parseHTMLToParagraphs = (html: string, title: string): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  );

  const stripTags = (str: string) => str.replace(/<[^>]+>/g, '');
  const tagRegex = /<(h[1-3]|p|li|strong|em)(?:\s[^>]*)?>(.+?)<\/\1>/gs;

  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const content = stripTags(match[2]);

    if (tag === 'h1') {
      paragraphs.push(
        new Paragraph({
          text: content,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (tag === 'h2') {
      paragraphs.push(
        new Paragraph({
          text: content,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (tag === 'h3') {
      paragraphs.push(
        new Paragraph({
          text: content,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (tag === 'p') {
      paragraphs.push(
        new Paragraph({
          text: content,
          spacing: { after: 200 },
        })
      );
    }
  }

  return paragraphs;
};

const parsePlainTextToParagraphs = (text: string, title: string): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  );

  const blocks = text.split('\n\n');

  for (const block of blocks) {
    if (block.trim()) {
      paragraphs.push(
        new Paragraph({
          text: block.trim(),
          spacing: { after: 200 },
        })
      );
    }
  }

  return paragraphs;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { title, content, contentType }: GenerateDocxRequest = await req.json();

    let paragraphs: Paragraph[];

    if (contentType === 'markdown') {
      paragraphs = parseMarkdownToParagraphs(content, title);
    } else if (contentType === 'richtext') {
      paragraphs = parseHTMLToParagraphs(content, title);
    } else {
      paragraphs = parsePlainTextToParagraphs(content, title);
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await doc.toBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${title}.docx"`,
      },
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);

    return new Response(
      JSON.stringify({
        error: error.message || "DOCX generation failed"
      }),
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
