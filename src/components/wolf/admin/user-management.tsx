'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Ban,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Calendar,
  Bot,
  Filter,
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
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBanned: boolean;
  maxBots: number;
  createdAt: string;
  updatedAt: string;
  bots: Array<{
    id: string;
    name: string;
    status: string;
    language: string;
    createdAt: string;
  }>;
  _count: { bots: number };
}

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'banned';

export default function UserManagement() {
  const { user, setCurrentPage } = useAppStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Ban dialog
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [togglingBan, setTogglingBan] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Max bots editing
  const [editingMaxBots, setEditingMaxBots] = useState<string | null>(null);
  const [maxBotsValue, setMaxBotsValue] = useState(0);
  const [savingMaxBots, setSavingMaxBots] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        throw new Error('فشل في جلب المستخدمين');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user?.role, fetchUsers]);

  // Filter and search
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((u) => !u.isBanned);
    } else if (statusFilter === 'banned') {
      result = result.filter((u) => u.isBanned);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [users, statusFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleToggleBan = async (target: AdminUser) => {
    setTogglingBan(true);
    try {
      const res = await fetch(`/api/users/${target.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleBan' }),
      });

      if (res.ok) {
        toast.success(
          target.isBanned
            ? `تم تفعيل حساب ${target.email}`
            : `تم تعطيل حساب ${target.email}`
        );
        setBanTarget(null);
        await fetchUsers();
      } else {
        throw new Error('فشل في تنفيذ العملية');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setTogglingBan(false);
    }
  };

  const handleDeleteUser = async (target: AdminUser) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${target.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(`تم حذف المستخدم ${target.email}`);
        setDeleteTarget(null);
        setExpandedUser(null);
        await fetchUsers();
      } else {
        throw new Error('فشل في حذف المستخدم');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveMaxBots = async (userId: string) => {
    if (maxBotsValue < 1 || maxBotsValue > 100) {
      toast.error('الحد يجب أن يكون بين 1 و 100');
      return;
    }
    setSavingMaxBots(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateMaxBots', maxBots: maxBotsValue }),
      });

      if (res.ok) {
        toast.success('تم تحديث الحد الأقصى للبوتات');
        setEditingMaxBots(null);
        await fetchUsers();
      } else {
        throw new Error('فشل في التحديث');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setSavingMaxBots(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy/MM/dd', { locale: ar });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy/MM/dd HH:mm', { locale: ar });
    } catch {
      return '-';
    }
  };

  // Not admin
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
          <Users className="h-7 w-7 text-primary" />
          إدارة المستخدمين
        </h1>
        <Badge variant="secondary" className="text-xs">
          {filteredUsers.length} مستخدم
        </Badge>
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
                placeholder="بحث بالبريد أو الاسم..."
                className="pr-9 text-sm"
                dir="ltr"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-[140px] text-sm">
                <Filter className="h-3.5 w-3.5 ml-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="banned">معطل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/50 flex-1">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="mr-2 text-muted-foreground text-sm">
                جارٍ تحميل المستخدمين...
              </span>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Users className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">لا يوجد مستخدمين</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[calc(100vh-300px)]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-8 text-xs" />
                    <TableHead className="text-xs">البريد الإلكتروني</TableHead>
                    <TableHead className="text-xs">الاسم</TableHead>
                    <TableHead className="text-xs">الدور</TableHead>
                    <TableHead className="text-xs text-center">البوتات</TableHead>
                    <TableHead className="text-xs">الحد الأقصى</TableHead>
                    <TableHead className="text-xs">الحالة</TableHead>
                    <TableHead className="text-xs">تاريخ التسجيل</TableHead>
                    <TableHead className="text-xs text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((u) => (
                    <>
                      <TableRow key={u.id}>
                        {/* Expand */}
                        <TableCell className="w-8 p-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              setExpandedUser(
                                expandedUser === u.id ? null : u.id
                              )
                            }
                          >
                            {expandedUser === u.id ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="text-sm" dir="ltr">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                            {u.email}
                          </span>
                        </TableCell>

                        {/* Name */}
                        <TableCell className="text-sm">
                          {u.name || <span className="text-muted-foreground">-</span>}
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <Badge
                            variant={
                              u.role === 'admin' ? 'default' : 'secondary'
                            }
                            className="text-[10px]"
                          >
                            {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                          </Badge>
                        </TableCell>

                        {/* Bot Count */}
                        <TableCell className="text-center text-sm">
                          <span className="flex items-center justify-center gap-1">
                            <Bot className="h-3 w-3 text-muted-foreground" />
                            {u._count?.bots ?? 0}
                          </span>
                        </TableCell>

                        {/* Max Bots */}
                        <TableCell>
                          {editingMaxBots === u.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                value={maxBotsValue}
                                onChange={(e) =>
                                  setMaxBotsValue(
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 h-7 text-xs text-center"
                                dir="ltr"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveMaxBots(u.id)}
                                disabled={savingMaxBots}
                                className="h-7 w-7 p-0"
                              >
                                {savingMaxBots ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingMaxBots(u.id);
                                setMaxBotsValue(u.maxBots);
                              }}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {u.maxBots}
                            </button>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {u.isBanned ? (
                            <Badge
                              variant="destructive"
                              className="text-[10px]"
                            >
                              معطل
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-emerald-400 border-emerald-500/30"
                            >
                              نشط
                            </Badge>
                          )}
                        </TableCell>

                        {/* Created At */}
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {formatDate(u.createdAt)}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-left">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setBanTarget(u)}
                              className={`h-7 text-xs ${
                                u.isBanned
                                  ? 'text-emerald-400 hover:text-emerald-300'
                                  : 'text-blue-400 hover:text-blue-300'
                              }`}
                              title={
                                u.isBanned
                                  ? 'تفعيل الحساب'
                                  : 'تعطيل الحساب'
                              }
                            >
                              {u.isBanned ? (
                                <ShieldCheck className="h-3.5 w-3.5" />
                              ) : (
                                <Ban className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteTarget(u)}
                              className="h-7 text-xs text-red-400 hover:text-red-300"
                              title="حذف المستخدم"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details */}
                      {expandedUser === u.id && (
                        <TableRow key={`${u.id}-details`}>
                          <TableCell colSpan={9} className="bg-muted/20 p-0">
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    البريد الإلكتروني
                                  </p>
                                  <p className="text-sm" dir="ltr">
                                    {u.email}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    تاريخ التسجيل
                                  </p>
                                  <p className="text-sm">
                                    {formatDateTime(u.createdAt)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    آخر تحديث
                                  </p>
                                  <p className="text-sm">
                                    {formatDateTime(u.updatedAt)}
                                  </p>
                                </div>
                              </div>

                              <Separator />

                              {u.bots && u.bots.length > 0 ? (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <Bot className="h-3 w-3" />
                                    بوتات المستخدم ({u.bots.length})
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {u.bots.map((bot) => (
                                      <div
                                        key={bot.id}
                                        className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/30"
                                      >
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {bot.name}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground">
                                            {bot.language} •{' '}
                                            {formatDate(bot.createdAt)}
                                          </p>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] shrink-0 ${
                                            bot.status === 'running'
                                              ? 'text-emerald-400 border-emerald-500/30'
                                              : 'text-muted-foreground'
                                          }`}
                                        >
                                          {bot.status === 'running'
                                            ? 'نشط'
                                            : 'متوقف'}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  لا يوجد بوتات لهذا المستخدم
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs"
          >
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs"
          >
            التالي
          </Button>
        </div>
      )}

      {/* Ban/Unban Dialog */}
      <AlertDialog open={!!banTarget} onOpenChange={() => setBanTarget(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banTarget?.isBanned ? 'تفعيل الحساب' : 'تعطيل الحساب'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget?.isBanned
                ? `هل تريد تفعيل حساب "${banTarget?.email}"؟`
                : `هل تريد تعطيل حساب "${banTarget?.email}"؟ سيتم إيقاف جميع بوتات المستخدم.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={togglingBan}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => banTarget && handleToggleBan(banTarget)}
              disabled={togglingBan}
              className={
                banTarget?.isBanned
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            >
              {togglingBan && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              {banTarget?.isBanned ? 'تفعيل' : 'تعطيل'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              حذف المستخدم نهائياً
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المستخدم &quot;{deleteTarget?.email}&quot؛؟
              سيتم حذف جميع بوتاته وملفاته وسجلاته نهائياً ولا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDeleteUser(deleteTarget)}
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
