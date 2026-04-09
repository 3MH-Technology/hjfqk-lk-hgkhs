'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Bot,
  Play,
  Square,
  AlertTriangle,
  FileText,
  ScrollText,
  Plus,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { CreateBotDialog } from '@/components/wolf/bots/create-bot-dialog';
import { toast } from 'sonner';

interface Stats {
  totalBots: number;
  runningBots: number;
  stoppedBots: number;
  errorBots: number;
  totalFiles: number;
  totalLogs: number;
}

interface BotItem {
  id: string;
  name: string;
  description: string | null;
  language: string;
  status: string;
  containerId: string | null;
  port: number | null;
  _count: { files: number; logs: number };
}

const statCards = [
  {
    key: 'totalBots' as const,
    label: 'إجمالي البوتات',
    icon: Bot,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
  },
  {
    key: 'runningBots' as const,
    label: 'يعمل الآن',
    icon: Play,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    key: 'stoppedBots' as const,
    label: 'متوقف',
    icon: Square,
    iconBg: 'bg-zinc-500/15',
    iconColor: 'text-zinc-400',
  },
  {
    key: 'errorBots' as const,
    label: 'أخطاء',
    icon: AlertTriangle,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
  },
  {
    key: 'totalFiles' as const,
    label: 'إجمالي الملفات',
    icon: FileText,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
  },
  {
    key: 'totalLogs' as const,
    label: 'إجمالي السجلات',
    icon: ScrollText,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
  },
];

const statusConfig: Record<string, { label: string; className: string; dotClass: string }> = {
  running: {
    label: 'يعمل',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dotClass: 'bg-emerald-400 pulse-dot',
  },
  stopped: {
    label: 'متوقف',
    className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
    dotClass: 'bg-zinc-400',
  },
  building: {
    label: 'جاري البناء',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    dotClass: 'bg-amber-400 pulse-dot',
  },
  error: {
    label: 'خطأ',
    className: 'bg-red-500/15 text-red-400 border-red-500/25',
    dotClass: 'bg-red-400',
  },
};

export function Dashboard() {
  const { setCurrentPage, setSelectedBotId } = useAppStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      toast.error('فشل في تحميل الإحصائيات');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchBots = useCallback(async () => {
    setLoading(true);
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
    fetchStats();
    fetchBots();
  }, [fetchStats, fetchBots]);

  const recentBots = bots.slice(0, 5);

  const handleRefresh = () => {
    fetchStats();
    fetchBots();
    toast.success('تم تحديث البيانات');
  };

  const handleBotCreated = () => {
    fetchStats();
    fetchBots();
  };

  const handleBotClick = (botId: string) => {
    setSelectedBotId(botId);
    setCurrentPage('bot-detail');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-1">
            نظرة عامة على بوتاتك وإحصائياتك
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            تحديث
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            إنشاء بوت جديد
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          : stats &&
            statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.key}
                  className="bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center size-12 rounded-xl ${card.iconBg}`}
                    >
                      <Icon className={`size-6 ${card.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stats[card.key]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {card.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Recent Bots */}
      <Card className="bg-card border border-border rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold">آخر البوتات</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('bots')}
            className="text-primary hover:text-primary/80"
          >
            عرض الكل
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : recentBots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="size-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">لا توجد بوتات بعد</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                ابدأ بإنشاء بوتك الأول
              </p>
              <Button
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="mt-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4" />
                إنشاء بوت جديد
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBots.map((bot) => {
                const status = statusConfig[bot.status] || statusConfig.stopped;
                return (
                  <button
                    key={bot.id}
                    onClick={() => handleBotClick(bot.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-right group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`size-3 rounded-full shrink-0 ${status.dotClass}`}
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {bot.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {bot.description || bot.language}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Bot Dialog */}
      <CreateBotDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleBotCreated}
      />
    </div>
  );
}
