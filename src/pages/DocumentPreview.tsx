import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Document, Template } from '../types/database';
import { marked } from 'marked';
import { sanitizeHTML, sanitizeText } from '../utils/sanitize';
import { Download, Edit, ArrowLeft, FileText } from 'lucide-react';

export function DocumentPreview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id, user]);

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

      setDocument(docData);

      if (docData.template_id) {
        const { data: templateData } = await supabase
          .from('templates')
          .select('*')
          .eq('id', docData.template_id)
          .maybeSingle();

        if (templateData) {
          setTemplate(templateData);
        }
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!document) return '';

    let processedContent = '';

    if (document.content_type === 'markdown') {
      const html = marked(document.content) as string;
      processedContent = sanitizeHTML(html);
    } else if (document.content_type === 'richtext') {
      processedContent = sanitizeHTML(document.content);
    } else {
      processedContent = sanitizeText(document.content).replace(/\n/g, '<br>');
    }

    if (template?.html_template) {
      return `
        <style>${template.css_styles}</style>
        <div class="template-content">
          <h1>${sanitizeText(document.title)}</h1>
          ${processedContent}
        </div>
      `;
    }

    return processedContent;
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'html') => {
    if (!document) return;

    setDownloading(true);
    try {
      const sanitizedContent =
        document.content_type === 'richtext' ? sanitizeHTML(document.content) : sanitizeText(document.content);

      let endpoint = '';
      let requestBody = {};

      if (format === 'pdf') {
        endpoint = 'generate-pdf';
        const html = renderPreview();
        requestBody = {
          html,
          title: document.title,
        };
      } else if (format === 'docx') {
        endpoint = 'generate-docx';
        requestBody = {
          title: document.title,
          content: sanitizedContent,
          contentType: document.content_type,
        };
      } else {
        const html = renderPreview();
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${document.title}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setDownloading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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
            dangerouslySetInnerHTML={{ __html: renderPreview() }}
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
