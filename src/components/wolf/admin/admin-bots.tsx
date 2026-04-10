'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bot,
  Search,
  Filter,
  Trash2,
  Square,
  Loader2,
  ShieldCheck,
  Server,
  Code,
  Calendar,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AdminBot {
  id: string;
  name: string;
  description: string | null;
  language: string;
  status: string;
  containerId: string | null;
  port: number | null;
  cpuLimit: number;
  ramLimit: number;
  autoRestart: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface AdminUsersResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBanned: boolean;
  maxBots: number;
  createdAt: string;
  bots: AdminBot[];
  _count: { bots: number };
}

type BotStatusFilter = 'all' | 'running' | 'stopped';

export default function AdminBots() {
  const { user, setCurrentPage } = useAppStore();

  const [allUsers, setAllUsers] = useState<AdminUsersResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BotStatusFilter>('all');

  
  const [deleteTarget, setDeleteTarget] = useState<AdminBot | null>(null);
  const [deleting, setDeleting] = useState(false);

  
  const [stopTarget, setStopTarget] = useState<AdminBot | null>(null);
  const [stopping, setStopping] = useState(false);

  
  const allBots: AdminBot[] = useMemo(() => {
    return allUsers.flatMap((u) =>
      (u.bots || []).map((b) => ({
        ...b,
        user: { id: u.id, email: u.email, name: u.name },
      }))
    );
  }, [allUsers]);

  
  const filteredBots = useMemo(() => {
    let result = [...allBots];

    if (statusFilter === 'running') {
      result = result.filter((b) => b.status === 'running');
    } else if (statusFilter === 'stopped') {
      result = result.filter((b) => b.status === 'stopped');
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.user.email.toLowerCase().includes(q) ||
          (b.user.name && b.user.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allBots, statusFilter, search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      } else {
        throw new Error('فشل في جلب البيانات');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user?.role, fetchData]);

  const handleStopBot = async (bot: AdminBot) => {
    setStopping(true);
    try {
      const res = await fetch(`/api/bots/${bot.id}/stop`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(`تم إيقاف البوت "${bot.name}"`);
        setStopTarget(null);
        await fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في إيقاف البوت');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setStopping(false);
    }
  };

  const handleDeleteBot = async (bot: AdminBot) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/bots/${bot.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(`تم حذف البوت "${bot.name}"`);
        setDeleteTarget(null);
        await fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في حذف البوت');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy/MM/dd HH:mm', { locale: ar });
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <Badge
            variant="outline"
            className="text-[10px] text-emerald-400 border-emerald-500/30"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 pulse-dot inline-block" />
            يعمل
          </Badge>
        );
      case 'stopped':
        return (
          <Badge
            variant="outline"
            className="text-[10px] text-muted-foreground"
          >
            متوقف
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  const getLanguageBadge = (language: string) => {
    switch (language) {
      case 'python':
        return (
          <Badge
            variant="secondary"
            className="text-[10px] text-blue-400"
          >
            <Code className="h-2.5 w-2.5 ml-0.5" />
            Python
          </Badge>
        );
      case 'php':
        return (
          <Badge variant="secondary" className="text-[10px] text-blue-400">
            <Code className="h-2.5 w-2.5 ml-0.5" />
            PHP
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px]">
            {language}
          </Badge>
        );
    }
  };

  
  const runningCount = allBots.filter((b) => b.status === 'running').length;
  const stoppedCount = allBots.filter((b) => b.status === 'stopped').length;

  
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <ShieldCheck className="h-16 w-16 text-muted-foreground/40" />
        <p className="text-muted-foreground text-lg">ليس لديك صلاحيات المدير</p>
        <Button variant="outline" onClick={() => setCurrentPage('dashboard')}>
          العودة للوحة التحكم
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          إدارة البوتات
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
            <Activity className="h-3 w-3 ml-1" />
            {runningCount} يعمل
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Square className="h-3 w-3 ml-1" />
            {stoppedCount} متوقف
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث باسم البوت أو البريد..."
                className="pr-9 text-sm"
                dir="ltr"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BotStatusFilter)}
            >
              <SelectTrigger className="w-[140px] text-sm">
                <Filter className="h-3.5 w-3.5 ml-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="running">يعمل</SelectItem>
                <SelectItem value="stopped">متوقف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bots Table */}
      <Card className="border-border/50 flex-1">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="mr-2 text-muted-foreground text-sm">
                جارٍ تحميل البوتات...
              </span>
            </div>
          ) : filteredBots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Bot className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">لا يوجد بوتات</p>
              {search && (
                <p className="text-muted-foreground/60 text-xs">
                  جرب تغيير معايير البحث
                </p>
              )}
            </div>
          ) : (
            <ScrollArea className="max-h-[calc(100vh-320px)]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">اسم البوت</TableHead>
                    <TableHead className="text-xs">المالك</TableHead>
                    <TableHead className="text-xs">اللغة</TableHead>
                    <TableHead className="text-xs">الحالة</TableHead>
                    <TableHead className="text-xs">الحاوية</TableHead>
                    <TableHead className="text-xs">الموارد</TableHead>
                    <TableHead className="text-xs">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-xs text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBots.map((bot) => (
                    <TableRow key={bot.id}>
                      {/* Bot Name */}
                      <TableCell className="text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                          <Bot className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {bot.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Owner */}
                      <TableCell>
                        <div className="text-sm" dir="ltr">
                          <span className="truncate max-w-[180px] block">
                            {bot.user.email}
                          </span>
                          {bot.user.name && (
                            <span className="text-[10px] text-muted-foreground">
                              {bot.user.name}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Language */}
                      <TableCell>{getLanguageBadge(bot.language)}</TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(bot.status)}</TableCell>

                      {/* Container */}
                      <TableCell>
                        {bot.containerId ? (
                          <span
                            className="text-xs text-muted-foreground font-mono truncate block max-w-[120px]"
                            dir="ltr"
                            title={bot.containerId}
                          >
                            <Server className="h-3 w-3 inline ml-1" />
                            {bot.containerId.substring(0, 12)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">
                            -
                          </span>
                        )}
                      </TableCell>

                      {/* Resources */}
                      <TableCell>
                        <div className="text-[10px] text-muted-foreground space-y-0.5" dir="ltr">
                          <span>CPU: {bot.cpuLimit} | RAM: {bot.ramLimit}MB</span>
                        </div>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {formatDate(bot.createdAt)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-left">
                        <div className="flex items-center gap-1">
                          {bot.status === 'running' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStopTarget(bot)}
                              className="h-7 text-xs text-blue-400 hover:text-blue-300"
                              title="إيقاف البوت"
                            >
                              <Square className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(bot)}
                            className="h-7 text-xs text-red-400 hover:text-red-300"
                            title="حذف البوت"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      {!loading && filteredBots.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            عرض {filteredBots.length} بوت من أصل {allBots.length}
          </p>
        </div>
      )}

      {/* Stop Bot Dialog */}
      <AlertDialog open={!!stopTarget} onOpenChange={() => setStopTarget(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>إيقاف البوت</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد إيقاف البوت &quot;{stopTarget?.name}&quot؛ التابع
              للمستخدم &quot;{stopTarget?.user?.email}&quot؛؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={stopping}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => stopTarget && handleStopBot(stopTarget)}
              disabled={stopping}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {stopping && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              إيقاف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bot Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              حذف البوت
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف البوت &quot;{deleteTarget?.name}&quot؛ التابع
              للمستخدم &quot;{deleteTarget?.user?.email}&quot؛؟ سيتم حذف جميع
              ملفاته وسجلاته نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDeleteBot(deleteTarget)}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
