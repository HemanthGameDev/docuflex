import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import type { Template } from '../types/database';
import { FileText, ArrowRight } from 'lucide-react';

export function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase.from('templates').select('*');

      if (error) throw error;
      setTemplates((data ?? []) as Template[]);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/editor?template=${templateId}`);
  };

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

  const getCategoryIcon = () => {
    return <FileText className="w-8 h-8 text-white" />;
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Document Templates</h1>
          <p className="text-slate-600">
            Choose from our professionally designed templates to get started quickly.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${getCategoryColor(
                    template.category
                  )} flex items-center justify-center`}
                >
                  {getCategoryIcon()}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {template.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{template.name}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all w-full justify-center group-hover:shadow-lg"
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need a custom template?</h2>
          <p className="text-slate-700 mb-4">
            Contact us to create a custom template tailored to your specific needs.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg">
            Request Custom Template
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
