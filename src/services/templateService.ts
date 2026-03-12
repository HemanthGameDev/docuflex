import { supabase } from '../lib/supabase';
import type { Json, Template } from '../types/database';
import { sanitizePlainText } from './sanitizationService';

interface TemplatePlaceholders {
  title: string;
  author: string;
  content: string;
  date: string;
}

export interface RenderedTemplate {
  bodyHtml: string;
  css: string;
  templateId: string | null;
}

const DEFAULT_TEMPLATE = `
  <article class="docuflex-template">
    <header>
      <h1>{{title}}</h1>
      <p>{{author}}</p>
      <p>{{date}}</p>
    </header>
    <section>
      {{content}}
    </section>
  </article>
`;

const extractStructureStyles = (structure: Json): string => {
  if (!structure || typeof structure !== 'object' || Array.isArray(structure)) {
    return '';
  }

  const structureObject = structure as Record<string, Json>;
  const fontFamily = typeof structureObject.fontFamily === 'string' ? structureObject.fontFamily : null;
  const fontSize = typeof structureObject.fontSize === 'string' ? structureObject.fontSize : null;
  const maxWidth = typeof structureObject.maxWidth === 'string' ? structureObject.maxWidth : null;
  const margins = typeof structureObject.margins === 'string' ? structureObject.margins : null;

  return `
    body {
      ${fontFamily ? `font-family: ${fontFamily};` : ''}
      ${fontSize ? `font-size: ${fontSize};` : ''}
      ${maxWidth ? `max-width: ${maxWidth};` : ''}
      margin: ${margins ?? '1in'} auto;
      line-height: 1.6;
      color: #1f2937;
    }
  `;
};

const applyPlaceholders = (templateHtml: string, values: TemplatePlaceholders): string => {
  return templateHtml.replace(/{{\s*(title|author|content|date)\s*}}/g, (_match, key: keyof TemplatePlaceholders) => {
    if (key === 'content') {
      return values.content;
    }

    return sanitizePlainText(values[key]);
  });
};

export const loadTemplateById = async (templateId?: string | null): Promise<Template | null> => {
  if (!templateId) {
    return null;
  }

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load template: ${error.message}`);
  }

  return (data as Template | null) ?? null;
};

export const renderTemplate = (
  template: Template | null,
  placeholders: TemplatePlaceholders
): RenderedTemplate => {
  const sourceTemplate = template?.html_template?.trim() || DEFAULT_TEMPLATE;
  const templateWithContent = sourceTemplate.includes('{{content}}')
    ? sourceTemplate
    : `${sourceTemplate}<section>{{content}}</section>`;

  const bodyHtml = applyPlaceholders(templateWithContent, placeholders);
  const css = `
    ${extractStructureStyles(template?.structure ?? {})}
    ${template?.css_styles ?? ''}
  `;

  return {
    bodyHtml,
    css,
    templateId: template?.id ?? null,
  };
};

export const renderTemplatePreview = (
  template: Template | null,
  placeholders: TemplatePlaceholders
): string => {
  const rendered = renderTemplate(template, placeholders);
  return `<style>${rendered.css}</style>${rendered.bodyHtml}`;
};
