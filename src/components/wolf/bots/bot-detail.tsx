'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  Loader2,
  ArrowRight,
  Server,
  Cpu,
  HardDrive,
  Clock,
  Save,
  Plus,
  X,
  Terminal,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BotDetail {
  id: string;
  name: string;
  description?: string | null;
  language: string;
  status: string;
  containerId?: string | null;
  port?: number | null;
  cpuLimit: number;
  ramLimit: number;
  autoRestart: boolean;
  githubUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { files: number; logs: number };
  envVars: { id: string; key: string; value: string; createdAt: string }[];
}

export function BotDetail() {
  const { selectedBotId, setCurrentPage } = useAppStore();
  const [bot, setBot] = useState<BotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [savingEnv, setSavingEnv] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const fetchBot = useCallback(async () => {
    if (!selectedBotId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBot(data);
        setEnvVars(data.envVars.map((e: any) => ({ key: e.key, value: e.value })));
      } else {
        toast.error('فشل في تحميل بيانات البوت');
      }
    } catch {
      toast.error('حدث خطأ أثناء التحميل');
    } finally {
      setLoading(false);
    }
  }, [selectedBotId]);

  useEffect(() => {
    fetchBot();
  }, [fetchBot]);

  if (!selectedBotId) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">لم يتم اختيار بوت</p>
        <Button
          variant="outline"
          className="mt-4 gap-2"
          onClick={() => setCurrentPage('bots')}
        >
          <ArrowRight className="h-4 w-4" />
          العودة للبوتات
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">البوت غير موجود</p>
        <Button variant="outline" className="mt-4 gap-2" onClick={() => setCurrentPage('bots')}>
          <ArrowRight className="h-4 w-4" />
          العودة للبوتات
        </Button>
      </div>
    );
  }

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bots/${bot!.id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const messages = { start: 'تم تشغيل البوت', stop: 'تم إيقاف البوت', restart: 'تم إعادة التشغيل' };
      toast.success(messages[action]);
      fetchBot();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bots/${bot!.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('تم حذف البوت');
      setCurrentPage('bots');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEnv = async () => {
    setSavingEnv(true);
    try {
      const validEnv = envVars.filter((e) => e.key.trim());
      const res = await fetch(`/api/bots/${bot!.id}/env`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envVars: validEnv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('تم حفظ متغيرات البيئة');
      fetchBot();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingEnv(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string; dotClass: string }> = {
    running: { label: 'يعمل', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dotClass: 'bg-emerald-400 pulse-dot' },
    stopped: { label: 'متوقف', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dotClass: 'bg-slate-400' },
    building: { label: 'جاري البناء', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dotClass: 'bg-amber-400 pulse-dot' },
    error: { label: 'خطأ', color: 'bg-red-500/15 text-red-400 border-red-500/30', dotClass: 'bg-red-400' },
  };
  const statusCfg = statusConfig[bot.status] || statusConfig.stopped;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setCurrentPage('bots')}
          >
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{bot.name}</h1>
              <Badge variant="outline" className={`gap-1.5 ${statusCfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                {statusCfg.label}
              </Badge>
            </div>
            {bot.description && (
              <p className="text-muted-foreground text-sm mt-1">{bot.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {bot.status === 'stopped' && (
            <Button size="sm" onClick={() => handleAction('start')} disabled={actionLoading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              تشغيل
            </Button>
          )}
          {bot.status === 'running' && (
            <>
              <Button size="sm" onClick={() => handleAction('stop')} disabled={actionLoading} variant="outline" className="gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
                إيقاف
              </Button>
              <Button size="sm" onClick={() => handleAction('restart')} disabled={actionLoading} variant="outline" className="gap-2 text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                إعادة تشغيل
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
            onClick={() => setCurrentPage('bot-console')}
          >
            <Terminal className="h-4 w-4" />
            وحدة التحكم
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-red-400" onClick={() => setDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Server className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الحاوية</p>
              <p className="text-sm font-mono truncate" dir="ltr">
                {bot.containerId || '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <HardDrive className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">المنفذ</p>
              <p className="text-sm font-mono">{bot.port ? `:${bot.port}` : '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الموارد</p>
              <p className="text-sm">{bot.cpuLimit} CPU / {bot.ramLimit}MB RAM</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
              <p className="text-sm">
                {format(new Date(bot.createdAt), 'dd/MM/yyyy', { locale: ar })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4" dir="rtl">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="env">المتغيرات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">معلومات البوت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">اسم البوت</Label>
                  <p className="font-medium mt-1">{bot.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">اللغة</Label>
                  <p className="font-medium mt-1">
                    {bot.language === 'python' ? '🐍 Python' : '🐘 PHP'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">الحالة</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={statusCfg.color}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">الملفات</Label>
                  <p className="font-medium mt-1">{bot._count.files} ملف</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">السجلات</Label>
                  <p className="font-medium mt-1">{bot._count.logs} سجل</p>
                </div>
                {bot.githubUrl && (
                  <div>
                    <Label className="text-muted-foreground text-xs">رابط GitHub</Label>
                    <p className="font-mono text-sm mt-1 truncate" dir="ltr">{bot.githubUrl}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">متغيرات البيئة</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEnvVars([...envVars, { key: '', value: '' }])}
                className="gap-1 h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                إضافة
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {envVars.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد متغيرات بيئة</p>
              ) : (
                <>
                  {envVars.map((env, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder="المفتاح"
                        value={env.key}
                        onChange={(e) => {
                          const updated = [...envVars];
                          updated[i] = { ...updated[i], key: e.target.value };
                          setEnvVars(updated);
                        }}
                        className="flex-1 h-9 text-sm font-mono"
                        dir="ltr"
                      />
                      <Input
                        placeholder="القيمة"
                        value={env.value}
                        onChange={(e) => {
                          const updated = [...envVars];
                          updated[i] = { ...updated[i], value: e.target.value };
                          setEnvVars(updated);
                        }}
                        className="flex-1 h-9 text-sm font-mono"
                        dir="ltr"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEnvVars(envVars.filter((_, idx) => idx !== i))}
                        className="h-9 w-9 p-0 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button
                      onClick={handleSaveEnv}
                      disabled={savingEnv}
                      className="gap-2 bg-primary text-primary-foreground"
                    >
                      {savingEnv ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      حفظ المتغيرات
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">إعدادات البوت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">إعادة التشغيل التلقائية</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    إعادة تشغيل البوت تلقائياً عند تعطله
                  </p>
                </div>
                <Switch
                  checked={bot.autoRestart}
                  disabled
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">حد CPU</Label>
                  <p className="font-medium mt-1">{bot.cpuLimit} نواة</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">حد RAM</Label>
                  <p className="font-medium mt-1">{bot.ramLimit} MB</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground text-xs">معرف الحاوية</Label>
                <p className="font-mono text-sm mt-1 bg-muted/30 rounded-lg px-3 py-2" dir="ltr">
                  {bot.containerId || 'لا توجد حاوية نشطة'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف البوت &quot;{bot.name}&quot;</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف البوت وجميع ملفاته وسجلاته نهائياً. هل أنت متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-border">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading} className="bg-destructive text-white hover:bg-destructive/90">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حذف نهائي'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
