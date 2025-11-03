import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Eye, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Report {
  id: string;
  message_id: string;
  reported_by: string;
  reason: string;
  status: 'open' | 'reviewed' | 'resolved';
  created_at: string;
  message?: {
    content: string;
    sender_id: string;
  };
  reporter?: {
    first_name?: string;
    last_name?: string;
  };
}

const ChatsManagement = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('message_reports')
        .select(`
          *,
          message:messages(content, sender_id),
          reporter:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedReports = (data || []).map((report: any) => ({
        ...report,
        status: report.status as 'open' | 'reviewed' | 'resolved',
        reporter: report.reporter as { first_name?: string; last_name?: string } | undefined
      }));
      
      setReports(typedReports);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error('Ошибка загрузки жалоб');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Удалить это сообщение?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted: true })
        .eq('id', messageId);

      if (error) throw error;
      toast.success('Сообщение удалено');
      loadReports();
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error('Ошибка удаления сообщения');
    }
  };

  const updateReportStatus = async (reportId: string, status: 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('message_reports')
        .update({ 
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      toast.success('Статус обновлен');
      loadReports();
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const filteredReports = reports.filter(report => {
    const searchLower = search.toLowerCase();
    return (
      report.reason.toLowerCase().includes(searchLower) ||
      report.message?.content?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      open: 'destructive',
      reviewed: 'default',
      resolved: 'secondary'
    };

    const labels: Record<string, string> = {
      open: 'Открыта',
      reviewed: 'Проверена',
      resolved: 'Решена'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getReporterName = (report: Report) => {
    if (!report.reporter) return 'Неизвестно';
    return `${report.reporter.first_name || ''} ${report.reporter.last_name || ''}`.trim() || 'Пользователь';
  };

  if (loading) {
    return <div className="p-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Модерация чатов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по жалобам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сообщение</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Отправитель жалобы</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="max-w-xs truncate">
                    {report.message?.content || 'Сообщение удалено'}
                  </TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{getReporterName(report)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                      locale: ru
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {report.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'reviewed')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Проверить
                        </Button>
                      )}
                      {report.status === 'reviewed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'resolved')}
                        >
                          Решить
                        </Button>
                      )}
                      {report.message && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMessage(report.message_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Удалить
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Жалоб не найдено
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatsManagement;
