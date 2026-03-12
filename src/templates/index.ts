import { resumeTemplate } from './resume';
import { academicTemplate } from './academic';
import { blogTemplate } from './blog';
import { professionalTemplate } from './professional';

export const templateDefinitions = {
  resume: resumeTemplate,
  academic: academicTemplate,
  blog: blogTemplate,
  professional: professionalTemplate,
};

export const getTemplateById = (id: string) => {
  const templateKey = Object.keys(templateDefinitions).find(
    key => id.includes(key)
  );
  return templateKey ? templateDefinitions[templateKey as keyof typeof templateDefinitions] : null;
};

export { resumeTemplate, academicTemplate, blogTemplate, professionalTemplate };
