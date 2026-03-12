import { Template } from '../types/database';
import { FileText, CheckCircle2 } from 'lucide-react';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateSelector({ templates, selectedTemplateId, onSelectTemplate }: TemplateSelectorProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'resume':
        return 'from-blue-500 to-blue-600';
      case 'academic':
        return 'from-purple-500 to-purple-600';
      case 'blog':
        return 'from-green-500 to-green-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template) => {
        const isSelected = selectedTemplateId === template.id;
        return (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`relative p-4 border-2 rounded-xl transition-all text-left ${
              isSelected
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            )}

            <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(template.category)} rounded-lg flex items-center justify-center mb-3`}>
              <FileText className="w-6 h-6 text-white" />
            </div>

            <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{template.description}</p>

            <div className="mt-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {template.category}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
