import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Document, Template } from '../types/database';
import { buildPreviewHtml, runDocumentPipeline } from '../services/documentPipeline';
import { downloadFromStorage, triggerDownload } from '../services/downloadService';
import type { ContentType, ExportFormat } from '../services/types';
import { Download, Edit, ArrowLeft, FileText } from 'lucide-react';

export function DocumentPreview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id, user]);

  useEffect(() => {
    if (!document) {
      setPreviewHtml('');
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const rendered = await buildPreviewHtml({
          title: document.title,
          content: document.content,
          contentType: document.content_type as ContentType,
          template,
          templateId: template ? undefined : document.template_id,
          author: user?.email ?? 'DocuFlex User',
        });

        if (!mounted) {
          return;
        }

        const parsed = new DOMParser().parseFromString(rendered, 'text/html');
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
  }, [document, template, user?.email]);

  const loadDocument = async () => {
    if (!id || !user) return;

    try {
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (docError) throw docError;

      if (!docData) {
        navigate('/documents');
        return;
      }

      const loadedDocument = docData as Document;
      setDocument(loadedDocument);

      if (loadedDocument.template_id) {
        const { data: templateData } = await supabase
          .from('templates')
          .select('*')
          .eq('id', loadedDocument.template_id)
          .maybeSingle();

        setTemplate((templateData as Template | null) ?? null);
      } else {
        setTemplate(null);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: ExportFormat) => {
    if (!document || !user) return;

    setDownloading(true);
    try {
      if (document.file_path && document.format === format) {
        await downloadFromStorage(document.file_path, `${document.title}.${format}`);
        return;
      }

      const result = await runDocumentPipeline({
        userId: user.id,
        documentId: document.id,
        title: document.title,
        content: document.content,
        contentType: document.content_type as ContentType,
        format,
        template,
        templateId: document.template_id,
      });

      triggerDownload(result.downloadUrl, `${document.title}.${format}`);
      setDocument((current) =>
        current
          ? {
              ...current,
              format,
              file_path: result.filePath,
              file_size: result.fileSize,
            }
          : current
      );
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!document) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg mb-6">Document not found</p>
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Documents
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Documents
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">{document.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">Type:</span>
                {document.content_type}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">Format:</span>
                {document.format.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">Created:</span>
                {new Date(document.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/editor?id=${document.id}`}
              className="flex items-center gap-2 bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-all shadow-lg"
            >
              <Edit className="w-5 h-5" />
              Edit
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Document Preview</h2>
          </div>
          <div
            className="p-8 prose prose-slate max-w-none min-h-[500px]"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Download Options</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={() => handleDownload('docx')}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download DOCX
            </button>
            <button
              onClick={() => handleDownload('html')}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download HTML
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
