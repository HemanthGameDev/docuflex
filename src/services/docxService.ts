import {
  Document as DocxDocument,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  type ParagraphChild,
} from 'docx';

type HeadingLevelValue = (typeof HeadingLevel)[keyof typeof HeadingLevel];

const headingMap: Record<string, HeadingLevelValue> = {
  h1: HeadingLevel.HEADING_1,
  h2: HeadingLevel.HEADING_2,
  h3: HeadingLevel.HEADING_3,
  h4: HeadingLevel.HEADING_4,
  h5: HeadingLevel.HEADING_5,
  h6: HeadingLevel.HEADING_6,
};

const supportedBlockTags = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ul',
  'ol',
  'blockquote',
  'pre',
]);

interface InlineFormatting {
  bold?: boolean;
  italics?: boolean;
  code?: boolean;
}

const toTextRun = (text: string, format: InlineFormatting = {}): TextRun => {
  return new TextRun({
    text,
    bold: format.bold,
    italics: format.italics,
    font: format.code ? 'Courier New' : undefined,
  });
};

const parseInlineNodes = (
  nodes: NodeListOf<ChildNode> | ChildNode[],
  format: InlineFormatting = {}
): ParagraphChild[] => {
  const children = Array.from(nodes);

  return children.flatMap((node): ParagraphChild[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent ?? '';
      return value.length > 0 ? [toTextRun(value, format)] : [];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return [];
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (tag === 'br') {
      return [new TextRun({ break: 1, text: '' })];
    }

    if (tag === 'a') {
      const href = element.getAttribute('href');
      const linkText = element.textContent ?? href ?? '';
      if (!href) {
        return linkText ? [toTextRun(linkText, format)] : [];
      }

      return [
        new ExternalHyperlink({
          link: href,
          children: [
            new TextRun({
              text: linkText,
              bold: format.bold,
              italics: format.italics,
              font: format.code ? 'Courier New' : undefined,
              color: '0563C1',
              underline: {},
            }),
          ],
        }),
      ];
    }

    const nextFormat: InlineFormatting = {
      ...format,
      bold: format.bold || tag === 'strong' || tag === 'b',
      italics: format.italics || tag === 'em' || tag === 'i',
      code: format.code || tag === 'code',
    };

    return parseInlineNodes(element.childNodes as NodeListOf<ChildNode>, nextFormat);
  });
};

const createParagraph = (
  element: HTMLElement,
  options: {
    heading?: HeadingLevelValue;
    bullet?: boolean;
    orderedIndex?: number;
  } = {}
): Paragraph => {
  const children = parseInlineNodes(element.childNodes as NodeListOf<ChildNode>);
  const paragraphChildren =
    typeof options.orderedIndex === 'number'
      ? [new TextRun(`${options.orderedIndex + 1}. `), ...children]
      : children;

  return new Paragraph({
    heading: options.heading,
    bullet: options.bullet ? { level: 0 } : undefined,
    children: paragraphChildren.length > 0 ? paragraphChildren : [new TextRun('')],
    spacing: { after: 200 },
  });
};

const htmlToParagraphs = (html: string): Paragraph[] => {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, 'text/html');
  const collectBlocks = (root: HTMLElement): HTMLElement[] => {
    const directChildren = Array.from(root.children) as HTMLElement[];

    return directChildren.flatMap((child) => {
      const tag = child.tagName.toLowerCase();
      if (supportedBlockTags.has(tag)) {
        return [child];
      }

      return collectBlocks(child);
    });
  };

  const blocks = collectBlocks(parsed.body);

  if (blocks.length === 0) {
    return [new Paragraph({ children: [new TextRun(parsed.body.textContent ?? '')] })];
  }

  const paragraphs: Paragraph[] = [];

  blocks.forEach((block) => {
    const tag = block.tagName.toLowerCase();

    if (tag in headingMap) {
      paragraphs.push(createParagraph(block, { heading: headingMap[tag] }));
      return;
    }

    if (tag === 'p') {
      paragraphs.push(createParagraph(block));
      return;
    }

    if (tag === 'ul') {
      const items = Array.from(block.querySelectorAll(':scope > li'));
      items.forEach((item) => paragraphs.push(createParagraph(item as HTMLElement, { bullet: true })));
      return;
    }

    if (tag === 'ol') {
      const items = Array.from(block.querySelectorAll(':scope > li'));
      items.forEach((item, index) =>
        paragraphs.push(createParagraph(item as HTMLElement, { orderedIndex: index }))
      );
      return;
    }

    if (tag === 'blockquote') {
      paragraphs.push(
        new Paragraph({
          children: parseInlineNodes(block.childNodes as NodeListOf<ChildNode>),
          indent: { left: 720 },
          spacing: { after: 200 },
        })
      );
      return;
    }

    if (tag === 'pre') {
      paragraphs.push(
        new Paragraph({
          children: [toTextRun(block.textContent ?? '', { code: true })],
          spacing: { after: 200 },
        })
      );
      return;
    }

    paragraphs.push(createParagraph(block));
  });

  return paragraphs;
};

export const convertHtmlToDocx = async (html: string): Promise<Blob> => {
  const paragraphs = htmlToParagraphs(html);
  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return Packer.toBlob(doc);
};
