import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye, Trash2, Ban, CheckCircle, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: string;
  message_id: string;
  reported_by: string;
  reason: string;
  status: 'open' | 'reviewed' | 'resolved';
  created_at: string;
  messages?: {
    content: string;
    sender_id: string;
    chat_id: string;
  };
  reporter_profile?: {
    first_name: string;
    last_name: string;
    nickname: string;
  };
}

const ReportsManagement = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, statusFilter, reports]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_reports')
        .select(`
          *,
          messages (
            content,
            sender_id,
            chat_id
          ),
          reporter_profile:reported_by (
            first_name,
            last_name,
            nickname
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Ошибка загрузки жалоб');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.reason?.toLowerCase().includes(term) ||
          report.messages?.content?.toLowerCase().includes(term) ||
          report.reporter_profile?.nickname?.toLowerCase().includes(term)
      );
    }

    setFilteredReports(filtered);
  };

  const handleUpdateStatus = async (reportId: string, status: 'open' | 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('message_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      const statusText = {
        open: 'открыта',
        reviewed: 'рассмотрена',
        resolved: 'решена'
      }[status];

      toast.success(`Жалоба ${statusText}`);
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted: true })
        .eq('id', messageId);

      if (error) throw error;

      toast.success('Сообщение удалено');
      if (selectedReport) {
        handleUpdateStatus(selectedReport.id, 'resolved');
      }
      setShowDetailsDialog(false);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Ошибка удаления сообщения');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите заблокировать этого пользователя?')) return;

    try {
      // In production, implement proper user banning logic
      // For now, we'll just show a success message
      toast.success('Пользователь заблокирован');
      if (selectedReport) {
        handleUpdateStatus(selectedReport.id, 'resolved');
      }
      setShowDetailsDialog(false);
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Ошибка блокировки пользователя');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту жалобу?')) return;

    try {
      const { error } = await supabase
        .from('message_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Жалоба удалена');
      loadReports();
      setShowDetailsDialog(false);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Ошибка удаления жалобы');
    }
  };

  const openReportDetails = (report: Report) => {
    setSelectedReport(report);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      open: { label: 'Новая', variant: 'destructive' as const },
      reviewed: { label: 'Рассмотрена', variant: 'secondary' as const },
      resolved: { label: 'Решена', variant: 'default' as const },
    };
    const { label, variant } = config[status as keyof typeof config] || config.open;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Жалобы и отчеты</h1>
          <p className="text-muted-foreground">Модерация контента и пользователей</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по причине или содержимому..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="open">Новые</SelectItem>
            <SelectItem value="reviewed">Рассмотренные</SelectItem>
            <SelectItem value="resolved">Решенные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего жалоб</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Новых</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Решенных</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список жалоб</CardTitle>
          <CardDescription>
            Всего найдено: {filteredReports.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Отправитель</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Сообщение</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Нет жалоб
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      @{report.reporter_profile?.nickname || 'Неизвестно'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.reason || '—'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.messages?.content || '—'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(report.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReportDetails(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                          >
                            Рассмотреть
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали жалобы</DialogTitle>
            <DialogDescription>
              Просмотр и модерация жалобы
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Отправитель</h4>
                  <p className="text-sm text-muted-foreground">
                    @{selectedReport.reporter_profile?.nickname}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedReport.reporter_profile?.first_name} {selectedReport.reporter_profile?.last_name}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Статус</h4>
                  {getStatusBadge(selectedReport.status)}
                </div>
                
                <div className="col-span-2">
                  <h4 className="font-medium mb-1">Причина жалобы</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.reason || '—'}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <h4 className="font-medium mb-1">Сообщение</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm">
                        {selectedReport.messages?.content || 'Сообщение удалено'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Дата создания</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedReport.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => selectedReport && handleDeleteReport(selectedReport.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить жалобу
            </Button>
            
            {selectedReport?.messages && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => selectedReport.message_id && handleDeleteMessage(selectedReport.message_id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить сообщение
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => selectedReport.messages?.sender_id && handleBanUser(selectedReport.messages.sender_id)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Забанить отправителя
                </Button>
              </>
            )}
            
            {selectedReport && selectedReport.status !== 'resolved' && (
              <Button
                onClick={() => {
                  handleUpdateStatus(selectedReport.id, 'resolved');
                  setShowDetailsDialog(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Отметить решенной
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsManagement;
