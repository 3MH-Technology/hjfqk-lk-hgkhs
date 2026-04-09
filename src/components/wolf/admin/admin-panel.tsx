'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Bot,
  BarChart3,
  Loader2,
  ShieldCheck,
  Ban,
  Trash2,
  Play,
  Square,
  Save,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBanned: boolean;
  maxBots: number;
  createdAt: string;
  _count: { bots: number };
}

interface AdminStats {
  totalUsers: number;
  totalBots: number;
  runningBots: number;
  totalLogs: number;
}

export default function AdminPanel() {
  const { user, setCurrentPage } = useAppStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Ban dialog
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [togglingBan, setTogglingBan] = useState(false);

  // Max bots editing
  const [editingMaxBots, setEditingMaxBots] = useState<string | null>(null);
  const [maxBotsValue, setMaxBotsValue] = useState(0);
  const [savingMaxBots, setSavingMaxBots] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Silent
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      // Silent
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
      fetchUsers();
    }
  }, [user?.role, fetchStats, fetchUsers]);

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
        await fetchUsers();
        await fetchStats();
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
      return format(new Date(dateStr), 'yyyy/MM/dd HH:mm', { locale: ar });
    } catch {
      return '-';
    }
  };

  // Not admin check
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
      <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
        <ShieldCheck className="h-7 w-7 text-primary" />
        لوحة إدارة النظام
      </h1>

      <Tabs defaultValue="overview" dir="rtl" className="flex-1">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="text-sm">
            <LayoutDashboard className="h-4 w-4 ml-1.5" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="users" className="text-sm">
            <Users className="h-4 w-4 ml-1.5" />
            إدارة المستخدمين
          </TabsTrigger>
          <TabsTrigger value="bots" className="text-sm">
            <Bot className="h-4 w-4 ml-1.5" />
            إدارة البوتات
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      إجمالي المستخدمين
                    </p>
                    <p className="text-3xl font-bold">
                      {loadingStats ? (
                        <Loader2 className="h-6 w-6 animate-spin inline text-primary" />
                      ) : (
                        stats?.totalUsers ?? '-'
                      )}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      إجمالي البوتات
                    </p>
                    <p className="text-3xl font-bold">
                      {loadingStats ? (
                        <Loader2 className="h-6 w-6 animate-spin inline text-primary" />
                      ) : (
                        stats?.totalBots ?? '-'
                      )}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      البوتات النشطة
                    </p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {loadingStats ? (
                        <Loader2 className="h-6 w-6 animate-spin inline" />
                      ) : (
                        stats?.runningBots ?? '-'
                      )}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      إجمالي السجلات
                    </p>
                    <p className="text-3xl font-bold">
                      {loadingStats ? (
                        <Loader2 className="h-6 w-6 animate-spin inline text-primary" />
                      ) : (
                        stats?.totalLogs ?? '-'
                      )}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick User Summary */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                ملخص سريع للمستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">مستخدمين نشطين</span>
                    <span className="font-medium">
                      {users.filter((u) => !u.isBanned).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">حسابات معطلة</span>
                    <span className="font-medium text-red-400">
                      {users.filter((u) => u.isBanned).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">مديرين</span>
                    <span className="font-medium text-primary">
                      {users.filter((u) => u.role === 'admin').length}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                إدارة المستخدمين
              </CardTitle>
              <CardDescription>
                عرض وإدارة جميع المستخدمين في المنصة
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="mr-2 text-muted-foreground text-sm">
                    جارٍ تحميل المستخدمين...
                  </span>
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">لا يوجد مستخدمين</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[calc(100vh-280px)]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">الاسم</TableHead>
                        <TableHead className="text-xs">البريد</TableHead>
                        <TableHead className="text-xs">الدور</TableHead>
                        <TableHead className="text-xs text-center">
                          البوتات
                        </TableHead>
                        <TableHead className="text-xs">الحد الأقصى</TableHead>
                        <TableHead className="text-xs">الحالة</TableHead>
                        <TableHead className="text-xs text-left">
                          الإجراءات
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="text-sm font-medium">
                            {u.name || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground" dir="ltr">
                            {u.email}
                          </TableCell>
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
                          <TableCell className="text-center text-sm">
                            {u._count?.bots ?? 0}
                          </TableCell>
                          <TableCell>
                            {editingMaxBots === u.id ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={maxBotsValue}
                                  onChange={(e) =>
                                    setMaxBotsValue(parseInt(e.target.value) || 0)
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
                          <TableCell>
                            {u.isBanned ? (
                              <Badge variant="destructive" className="text-[10px]">
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
                          <TableCell className="text-left">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setBanTarget(u)}
                                className={`h-7 text-xs ${
                                  u.isBanned
                                    ? 'text-emerald-400 hover:text-emerald-300'
                                    : 'text-amber-400 hover:text-amber-300'
                                }`}
                                title={
                                  u.isBanned ? 'تفعيل الحساب' : 'تعطيل الحساب'
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
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bots Tab */}
        <TabsContent value="bots" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                إدارة البوتات
              </CardTitle>
              <CardDescription>
                عرض جميع البوتات النشطة في المنصة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Bot className="h-12 w-12 text-muted-foreground/30" />
                <div className="text-center space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    عرض جميع البوتات النشطة
                  </p>
                  <p className="text-muted-foreground/60 text-xs">
                    يمكنك إدارة البوتات من صفحة إدارة البوتات المتخصصة
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage('admin-bots')}
                  className="text-xs"
                >
                  <Bot className="h-3.5 w-3.5 ml-1" />
                  الانتقال لإدارة البوتات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ban/Unban Dialog */}
      <AlertDialog open={!!banTarget} onOpenChange={() => setBanTarget(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banTarget?.isBanned ? 'تفعيل الحساب' : 'تعطيل الحساب'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget?.isBanned
                ? `هل تريد تفعيل حساب ${banTarget?.email}؟`
                : `هل تريد تعطيل حساب ${banTarget?.email}؟ سيتم إيقاف جميع بوتات المستخدم.`}
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
                  : 'bg-amber-600 text-white hover:bg-amber-700'
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

      {/* Delete User Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              حذف المستخدم
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المستخدم &quot;{deleteTarget?.email}&quot؛؟
              سيتم حذف جميع بوتاته وملفاته وسجلاته نهائياً.
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
