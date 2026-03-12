import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { RichTextEditor } from '../components/RichTextEditor';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Document, Template } from '../types/database';
import { exportDocument } from '../services/exportService';
import { createVersion } from '../services/versionService';
import { buildPreviewHtml } from '../services/documentPipeline';
import { sanitizeContentForStorage } from '../services/sanitizationService';
import type { ContentType, ExportFormat } from '../services/types';
import toast from 'react-hot-toast';
import {
  FileText,
  Download,
  Save,
  Eye,
  Code,
  Type,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
} from 'lucide-react';

export function Editor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('id');
  const templateParam = searchParams.get('template');

  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<ContentType>('plain');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadTemplates();
    if (documentId) {
      loadDocument();
    }
  }, [documentId, templateParam]);

  useEffect(() => {
    if (!showPreview) {
      setPreviewHtml('');
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const selectedTemplateData = templates.find((template) => template.id === selectedTemplate) ?? null;
        const html = await buildPreviewHtml({
          title,
          content,
          contentType,
          template: selectedTemplateData,
          templateId: selectedTemplateData ? undefined : selectedTemplate,
          author: user?.email ?? 'DocuFlex User',
        });

        if (!mounted) {
          return;
        }

        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const styles = Array.from(parsed.querySelectorAll('style'))
          .map((style) => style.textContent ?? '')
          .join('\n');
        setPreviewHtml(`<style>${styles}</style>${parsed.body.innerHTML}`);
      } catch (error) {
        console.error('Error generating preview:', error);
        if (mounted) {
          setPreviewHtml('<p>Failed to generate preview.</p>');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showPreview, title, content, contentType, selectedTemplate, templates, user?.email]);

  const loadTemplates = async () => {
    const { data } = await supabase.from('templates').select('*');
    if (data) {
      const templateData = data as Template[];
      setTemplates(templateData);

      if (templateParam) {
        const fromQuery = templateData.find((template) => template.id === templateParam);
        if (fromQuery) {
          setSelectedTemplate(fromQuery.id);
          return;
        }
      }

      if (!selectedTemplate && templateData.length > 0) {
        setSelectedTemplate(templateData[0].id);
      }
    }
  };

  const loadDocument = async () => {
    if (!documentId || !user) return;

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading document:', error);
      return;
    }

    if (data) {
      const doc = data as Document;
      setTitle(doc.title);
      setContent(doc.content);
      setContentType(doc.content_type as ContentType);
      if (doc.template_id) setSelectedTemplate(doc.template_id);
      setExportFormat(doc.format as ExportFormat);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const loadingToast = toast.loading('Saving document...');

    try {
      const sanitizedContent = sanitizeContentForStorage(content, contentType);

      const documentData = {
        user_id: user.id,
        title,
        content: sanitizedContent,
        content_type: contentType,
        template_id: selectedTemplate || null,
        format: exportFormat,
        file_size: new Blob([sanitizedContent]).size,
        updated_at: new Date().toISOString(),
      };

      if (documentId) {
        const { error } = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', documentId);

        if (error) throw error;
        await createVersion(documentId, title, sanitizedContent, contentType, user.id);
      } else {
        const { data, error } = await supabase
          .from('documents')
          .insert([documentData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const insertedDocument = data as Document;
          navigate(`/editor?id=${insertedDocument.id}`, { replace: true });
          await createVersion(insertedDocument.id, title, sanitizedContent, contentType, user.id);
        }
      }

      toast.success('Document saved successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;

    setExporting(true);
    const loadingToast = toast.loading(`Exporting as ${exportFormat.toUpperCase()}...`);

    try {
      const selectedTemplateData = templates.find((template) => template.id === selectedTemplate) ?? null;
      const result = await exportDocument({
        userId: user.id,
        title,
        content,
        contentType,
        format: exportFormat,
        template: selectedTemplateData,
        templateId: selectedTemplate,
        documentId: documentId ?? undefined,
      });

      const versionContent = sanitizeContentForStorage(content, contentType);
      await createVersion(result.documentId, title, versionContent, contentType, user.id);

      if (!documentId) {
        navigate(`/editor?id=${result.documentId}`, { replace: true });
      }

      toast.success(`Document exported successfully as ${exportFormat.toUpperCase()}!`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error('Error exporting document:', error);
      toast.error('Failed to export document', { id: loadingToast });
    } finally {
      setExporting(false);
    }
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent =
      content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold text-slate-900 bg-transparent border-none outline-none w-full mb-4"
            placeholder="Document Title"
          />

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Content Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setContentType('plain')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    contentType === 'plain'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  Plain Text
                </button>
                <button
                  onClick={() => setContentType('markdown')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    contentType === 'markdown'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Markdown
                </button>
                <button
                  onClick={() => setContentType('richtext')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    contentType === 'richtext'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Rich Text
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>
        </div>

        {contentType === 'markdown' && (
          <div className="mb-4 flex gap-2 p-2 bg-white border border-slate-200 rounded-lg">
            <button
              onClick={() => insertFormatting('# ', '')}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={() => insertFormatting('## ', '')}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={() => insertFormatting('**', '**')}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={() => insertFormatting('- ', '')}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={() => insertFormatting('1. ', '')}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Editor</h2>
            </div>

            {contentType === 'richtext' ? (
              <RichTextEditor content={content} onChange={setContent} />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[600px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm resize-none"
                placeholder="Start writing your content here..."
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'}
              </button>
            </div>
            <div
              className="w-full h-[600px] p-6 bg-white border border-slate-300 rounded-lg overflow-auto prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{
                __html: showPreview ? previewHtml : '',
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Document'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || !content}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg"
          >
            <Download className="w-5 h-5" />
            {exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
