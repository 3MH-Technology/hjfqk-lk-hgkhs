'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  FolderOpen,
  ScrollText,
  Trash2,
  Plus,
  RefreshCw,
  Bot,
  Loader2,
  AlertTriangle,
  FileText,
  ChevronLeft,
  GitCompareArrows,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { CreateBotDialog } from './create-bot-dialog';
import { toast } from 'sonner';

interface BotItem {
  id: string;
  name: string;
  description?: string | null;
  language: string;
  status: string;
  containerId?: string | null;
  port?: number | null;
  createdAt: string;
  updatedAt: string;
  _count: { files: number; logs: number };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; dotClass: string }> = {
    running: {
      label: 'يعمل',
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400 pulse-dot',
    },
    stopped: {
      label: 'متوقف',
      color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      dotClass: 'bg-slate-400',
    },
    building: {
      label: 'جاري البناء',
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-400 pulse-dot',
    },
    error: {
      label: 'خطأ',
      color: 'bg-red-500/15 text-red-400 border-red-500/30',
      dotClass: 'bg-red-400',
    },
  };

  const cfg = config[status] || config.stopped;

  return (
    <Badge variant="outline" className={`gap-1.5 text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </Badge>
  );
}

function LanguageBadge({ language }: { language: string }) {
  return language === 'python' ? (
    <Badge variant="outline" className="gap-1 text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
      🐍 Python
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
      🐘 PHP
    </Badge>
  );
}

function BotCardSkeleton() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BotList() {
  const { setCurrentPage, setSelectedBotId } = useAppStore();
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchBots = useCallback(async () => {
    try {
      const res = await fetch('/api/bots', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBots(data);
      }
    } catch {
      toast.error('فشل في تحميل البوتات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const handleAction = async (botId: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(botId);
    try {
      const res = await fetch(`/api/bots/${botId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'فشل العملية');

      const messages = {
        start: 'تم تشغيل البوت بنجاح',
        stop: 'تم إيقاف البوت بنجاح',
        restart: 'تم إعادة تشغيل البوت بنجاح',
      };
      toast.success(messages[action]);
      fetchBots();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setActionLoading(deleteDialog);
    try {
      const res = await fetch(`/api/bots/${deleteDialog}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحذف');

      toast.success('تم حذف البوت بنجاح');
      setDeleteDialog(null);
      fetchBots();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة البوتات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة وتحكم في جميع بوتاتك
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('bot-comparison')}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <GitCompareArrows className="h-4 w-4" />
            مقارنة البوتات
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBots}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            إنشاء بوت جديد
          </Button>
        </div>
      </div>

      {/* Bots Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <BotCardSkeleton key={i} />
          ))}
        </div>
      ) : bots.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">لا توجد بوتات</h3>
            <p className="text-muted-foreground text-sm mb-4">
              ابدأ بإنشاء بوتك الأول لاستضافته على المنصة
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              إنشاء بوت جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <Card
              key={bot.id}
              className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{bot.name}</h3>
                    {bot.description && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {bot.description}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={bot.status} />
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <LanguageBadge language={bot.language} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {bot._count.files}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ScrollText className="h-3 w-3" />
                    {bot._count.logs}
                  </span>
                </div>

                {/* Container info */}
                {bot.containerId && (
                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 font-mono" dir="ltr">
                    {bot.containerId} :{bot.port}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {bot.status === 'stopped' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                      onClick={() => handleAction(bot.id, 'start')}
                      disabled={actionLoading === bot.id}
                    >
                      {actionLoading === bot.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      تشغيل
                    </Button>
                  )}

                  {bot.status === 'running' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => handleAction(bot.id, 'stop')}
                        disabled={actionLoading === bot.id}
                      >
                        {actionLoading === bot.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Square className="h-3.5 w-3.5" />
                        )}
                        إيقاف
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                        onClick={() => handleAction(bot.id, 'restart')}
                        disabled={actionLoading === bot.id}
                      >
                        {actionLoading === bot.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        إعادة تشغيل
                      </Button>
                    </>
                  )}

                  {bot.status === 'building' && (
                    <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      جاري البناء...
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => {
                      setSelectedBotId(bot.id);
                      setCurrentPage('files');
                    }}
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    الملفات
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => {
                      setSelectedBotId(bot.id);
                      setCurrentPage('logs');
                    }}
                  >
                    <ScrollText className="h-3.5 w-3.5" />
                    السجلات
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                    onClick={() => setDeleteDialog(bot.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Bot Dialog */}
      <CreateBotDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={fetchBots}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              حذف البوت
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا البوت؟ سيتم حذف جميع الملفات والسجلات المرتبطة به بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-border">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف نهائي'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
