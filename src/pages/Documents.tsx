import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Document } from '../types/database';
import { downloadFromStorage, triggerDownload } from '../services/downloadService';
import { runDocumentPipeline } from '../services/documentPipeline';
import { deleteDocumentAsset } from '../services/storageService';
import { getVersionHistory, type DocumentVersion } from '../services/versionService';
import type { ContentType, ExportFormat } from '../services/types';
import {
  FileText,
  Trash2,
  Download,
  CreditCard as Edit,
  Search,
  History,
  Eye,
  X,
} from 'lucide-react';

export function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [historyForId, setHistoryForId] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<DocumentVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data ?? []) as Document[]);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (document: Document) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setDeleting(document.id);
    try {
      if (document.file_path) {
        await deleteDocumentAsset(document.file_path);
      }

      const { error } = await supabase.from('documents').delete().eq('id', document.id);
      if (error) throw error;

      setDocuments((current) => current.filter((doc) => doc.id !== document.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (document: Document) => {
    if (!user) return;

    setDownloading(document.id);
    try {
      if (document.file_path) {
        await downloadFromStorage(document.file_path, `${document.title}.${document.format}`);
        return;
      }

      const generated = await runDocumentPipeline({
        userId: user.id,
        documentId: document.id,
        title: document.title,
        content: document.content,
        contentType: document.content_type as ContentType,
        format: document.format as ExportFormat,
        templateId: document.template_id,
      });

      triggerDownload(generated.downloadUrl, `${document.title}.${document.format}`);
      await loadDocuments();
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  const handleViewHistory = async (documentId: string) => {
    setHistoryForId(documentId);
    setHistoryLoading(true);

    try {
      const versions = await getVersionHistory(documentId);
      setHistoryItems(versions);
    } catch (error) {
      console.error('Error loading version history:', error);
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Documents</h1>
          <p className="text-slate-600">Manage all your converted documents in one place.</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg mb-2">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </p>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first document to get started'}
            </p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg"
            >
              <FileText className="w-5 h-5" />
              Create Document
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Title
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Format
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Size
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Created
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{doc.title}</p>
                            <p className="text-sm text-slate-500">{doc.content_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {doc.format.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/editor?id=${doc.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDownload(doc)}
                            disabled={downloading === doc.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewHistory(doc.id)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Version History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc)}
                            disabled={deleting === doc.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <p>
            Showing {filteredDocuments.length} of {documents.length} documents
          </p>
        </div>

        {historyForId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Version History</h3>
                <button
                  onClick={() => setHistoryForId(null)}
                  className="p-2 rounded-lg hover:bg-slate-100"
                  title="Close"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {historyLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : historyItems.length === 0 ? (
                  <p className="text-slate-600">No versions found for this document.</p>
                ) : (
                  <div className="space-y-3">
                    {historyItems.map((version) => (
                      <div
                        key={version.id}
                        className="border border-slate-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            Version {version.version_number}
                          </p>
                          <p className="text-sm text-slate-600">{version.content_type}</p>
                        </div>
                        <p className="text-sm text-slate-500">
                          {new Date(version.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
