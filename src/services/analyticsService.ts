import { supabase } from '../lib/supabase';

export interface DocumentStats {
  total: number;
  byFormat: {
    pdf: number;
    docx: number;
    html: number;
  };
  thisWeek: number;
  thisMonth: number;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

export const getDocumentAnalytics = async (
  userId: string
): Promise<DocumentStats> => {
  const { data: documents } = await supabase
    .from('documents')
    .select('format, created_at')
    .eq('user_id', userId);

  if (!documents) {
    return {
      total: 0,
      byFormat: { pdf: 0, docx: 0, html: 0 },
      thisWeek: 0,
      thisMonth: 0,
      recentActivity: [],
    };
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats: DocumentStats = {
    total: documents.length,
    byFormat: {
      pdf: documents.filter((d) => d.format === 'pdf').length,
      docx: documents.filter((d) => d.format === 'docx').length,
      html: documents.filter((d) => d.format === 'html').length,
    },
    thisWeek: documents.filter(
      (d) => new Date(d.created_at) > weekAgo
    ).length,
    thisMonth: documents.filter(
      (d) => new Date(d.created_at) > monthAgo
    ).length,
    recentActivity: [],
  };

  const activityMap = new Map<string, number>();
  documents.forEach((doc) => {
    const date = new Date(doc.created_at).toISOString().split('T')[0];
    activityMap.set(date, (activityMap.get(date) || 0) + 1);
  });

  stats.recentActivity = Array.from(activityMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return stats;
};

export const getFormatDistribution = async (userId: string) => {
  const stats = await getDocumentAnalytics(userId);
  return [
    { name: 'PDF', value: stats.byFormat.pdf, color: '#ef4444' },
    { name: 'DOCX', value: stats.byFormat.docx, color: '#3b82f6' },
    { name: 'HTML', value: stats.byFormat.html, color: '#10b981' },
  ];
};
