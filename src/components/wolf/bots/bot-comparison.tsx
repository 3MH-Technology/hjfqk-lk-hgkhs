'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  GitCompareArrows,
  Info,
  Cpu,
  HardDrive,
  Server,
  FileText,
  ScrollText,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Bot,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ─── */

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
  cpuLimit?: number | null;
  ramLimit?: number | null;
  storageLimit?: number | null;
  autoRestart?: boolean | null;
  _count: { files: number; logs: number };
}

/* ─── Status Config ─── */



/* ─── Comparison Categories ─── */

interface ComparisonCategory {
  id: string;
  title: string;
  icon: typeof Info;
  iconBg: string;
  iconColor: string;
  rows: {
    id: string;
    label: string;
    getValue: (bot: BotItem) => string;
    getColor?: (bot: BotItem) => string;
  }[];
}

const comparisonCategories: ComparisonCategory[] = [
  {
    id: 'basic-info',
    title: 'المعلومات الأساسية',
    icon: Info,
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    rows: [
      {
        id: 'name',
        label: 'الاسم',
        getValue: (bot) => bot.name,
      },
      {
        id: 'description',
        label: 'الوصف',
        getValue: (bot) => bot.description || '—',
      },
      {
        id: 'language',
        label: 'اللغة',
        getValue: (bot) => bot.language === 'python' ? '🐍 Python' : '🐘 PHP',
      },
      {
        id: 'status',
        label: 'الحالة',
        getValue: (bot) => statusConfig[bot.status]?.label || 'غير معروف',
        getColor: (bot) => statusConfig[bot.status]?.color || 'text-slate-400',
      },
    ],
  },
  {
    id: 'resources',
    title: 'الموارد',
    icon: Cpu,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    rows: [
      {
        id: 'cpu',
        label: 'المعالج (CPU)',
        getValue: (bot) => bot.cpuLimit ? `${bot.cpuLimit} نواة` : '—',
        getColor: (bot) => {
          if (!bot.cpuLimit) return 'text-muted-foreground';
          return bot.cpuLimit <= 2 ? 'text-emerald-400' : bot.cpuLimit <= 4 ? 'text-blue-400' : 'text-red-400';
        },
      },
      {
        id: 'ram',
        label: 'الذاكرة (RAM)',
        getValue: (bot) => bot.ramLimit ? `${bot.ramLimit} MB` : '—',
        getColor: (bot) => {
          if (!bot.ramLimit) return 'text-muted-foreground';
          return bot.ramLimit <= 512 ? 'text-emerald-400' : bot.ramLimit <= 1024 ? 'text-blue-400' : 'text-red-400';
        },
      },
      {
        id: 'storage',
        label: 'التخزين',
        getValue: (bot) => bot.storageLimit ? `${bot.storageLimit} MB` : '—',
        getColor: (bot) => {
          if (!bot.storageLimit) return 'text-muted-foreground';
          return bot.storageLimit <= 1024 ? 'text-emerald-400' : bot.storageLimit <= 2048 ? 'text-blue-400' : 'text-red-400';
        },
      },
      {
        id: 'port',
        label: 'المنفذ',
        getValue: (bot) => bot.port ? `${bot.port}` : '—',
        getColor: (bot) => bot.port ? 'text-foreground' : 'text-muted-foreground',
      },
    ],
  },
  {
    id: 'files',
    title: 'الملفات',
    icon: FileText,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    rows: [
      {
        id: 'file-count',
        label: 'عدد الملفات',
        getValue: (bot) => `${bot._count.files}`,
        getColor: (bot) => bot._count.files > 30 ? 'text-blue-400' : 'text-emerald-400',
      },
      {
        id: 'last-update',
        label: 'آخر تحديث',
        getValue: (bot) => {
          if (!bot.updatedAt) return '—';
          try {
            const date = new Date(bot.updatedAt);
            return date.toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          } catch {
            return '—';
          }
        },
      },
    ],
  },
  {
    id: 'logs',
    title: 'السجلات',
    icon: ScrollText,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    rows: [
      {
        id: 'log-count',
        label: 'عدد السجلات',
        getValue: (bot) => `${bot._count.logs.toLocaleString('ar-EG')}`,
        getColor: (bot) => bot._count.logs > 2000 ? 'text-red-400' : bot._count.logs > 1000 ? 'text-blue-400' : 'text-emerald-400',
      },
      {
        id: 'last-error',
        label: 'آخر خطأ',
        getValue: (bot) => {
          if (bot.status === 'error') return 'يوجد خطأ';
          if (bot._count.logs > 1500) return 'يحتاج مراجعة';
          return 'لا توجد أخطاء';
        },
        getColor: (bot) => {
          if (bot.status === 'error') return 'text-red-400';
          if (bot._count.logs > 1500) return 'text-blue-400';
          return 'text-emerald-400';
        },
      },
    ],
  },
  {
    id: 'settings',
    title: 'الإعدادات',
    icon: Settings,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    rows: [
      {
        id: 'auto-restart',
        label: 'إعادة التشغيل التلقائي',
        getValue: (bot) => bot.autoRestart ? 'مفعّل' : 'معطّل',
        getColor: (bot) => bot.autoRestart ? 'text-emerald-400' : 'text-muted-foreground',
      },
      {
        id: 'container',
        label: 'الحاوية',
        getValue: (bot) => bot.containerId ? `${bot.containerId.slice(0, 12)}...` : 'لا توجد',
        getColor: (bot) => bot.containerId ? 'text-foreground' : 'text-muted-foreground',
      },
    ],
  },
];

/* ─── Animation Variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

/* ─── Status Badge Component ─── */

function ComparisonStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.stopped;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      <span className={config.color}>{config.label}</span>
    </span>
  );
}

/* ─── Selection Pill Component ─── */

function SelectionPill({
  bot,
  selected,
  onClick,
  index,
}: {
  bot: BotItem;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  const cfg = statusConfig[bot.status] || statusConfig.stopped;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 cursor-pointer select-none
        ${
          selected
            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
            : 'border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5'
        }`}
    >
      {selected && (
        <motion.div
          layoutId="selected-indicator"
          className="absolute -top-2 -left-2 size-5 rounded-full bg-primary flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <CheckCircle2 className="size-3.5 text-primary-foreground" />
        </motion.div>
      )}

      {/* Bot icon */}
      <div className={`flex items-center justify-center size-9 rounded-lg ${selected ? 'bg-primary/20' : 'bg-muted/50'}`}>
        <Bot className={`size-4 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>

      {/* Bot info */}
      <div className="text-right min-w-0">
        <p className={`text-sm font-semibold truncate ${selected ? 'text-foreground' : 'text-foreground/80'}`}>
          {bot.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
          <span className={`text-[11px] ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Empty Slot Component ─── */

function EmptySlot({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-center px-4 py-3 rounded-xl border-2 border-dashed border-border/30 bg-muted/10 min-w-[160px]"
    >
      <div className="flex items-center gap-2 text-muted-foreground/50">
        <Plus className="size-4" />
        <span className="text-sm">اختر بوتاً</span>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export function BotComparison() {
  const { setCurrentPage } = useAppStore();
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchBots = useCallback(async () => {
    try {
      const res = await fetch('/api/bots', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setBots(data);
        } else {
          setBots([]);
        }
      } else {
        setBots([]);
      }
    } catch {
      setBots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const toggleBot = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const selectedBots = bots.filter((b) => selectedIds.has(b.id));

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-44 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Page Header ─── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
              <GitCompareArrows className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">مقارنة البوتات</h1>
              <p className="text-sm text-muted-foreground">
                قارن بين بوتاتك لمعرفة الفروقات في الموارد والأداء
              </p>
            </div>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/30 px-3 py-1.5">
            <GitCompareArrows className="size-3.5" />
            {selectedIds.size} من 3 بوتات
          </Badge>
        )}
      </motion.div>

      {/* ─── Bot Selection Row ─── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">اختر البوتات للمقارنة</h2>
              <span className="text-xs text-muted-foreground mr-auto">(2-3 بوتات)</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {bots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center w-full">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
                    <Bot className="size-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">لا توجد بوتات للمقارنة</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    أنشئ بوتات أولاً للمقارنة بينها
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                    onClick={() => setCurrentPage('bots')}
                  >
                    <Plus className="size-4" />
                    إنشاء بوت
                  </Button>
                </div>
              ) : (
                bots.map((bot, i) => (
                  <SelectionPill
                    key={bot.id}
                    bot={bot}
                    selected={selectedIds.has(bot.id)}
                    onClick={() => toggleBot(bot.id)}
                    index={i}
                  />
                ))
              )}
            </div>

            {/* Selection summary */}
            {selectedIds.size > 0 && selectedIds.size < 2 && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-blue-400 mt-3 flex items-center gap-1.5"
              >
                <AlertTriangle className="size-3" />
                اختر بوتاً آخر على الأقل (الحد الأدنى 2 بوتات)
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Comparison Content ─── */}
      <AnimatePresence mode="wait">
        {selectedBots.length < 2 ? (
          /* ─── Empty State ─── */
          <motion.div
            key="empty"
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="empty-state"
          >
            <div className="relative mb-6">
              <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center glow-effect">
                <GitCompareArrows className="size-10 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">اختر بوتين على الأقل للمقارنة</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              اختر 2 أو 3 بوتات من القائمة أعلاه لعرض مقارنة تفصيلية بينهم في جميع الجوانب
            </p>
          </motion.div>
        ) : (
          /* ─── Comparison Table ─── */
          <motion.div
            key="comparison"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Bot Header Row */}
            <motion.div variants={itemVariants}>
              <div className="grid gap-4" style={{ gridTemplateColumns: `minmax(140px, 1fr) repeat(${selectedBots.length}, 1fr)` }}>
                {/* Empty header cell */}
                <div />

                {/* Bot column headers */}
                {selectedBots.map((bot) => (
                  <motion.div
                    key={bot.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center gap-2"
                  >
                    <div className={`size-12 rounded-xl flex items-center justify-center ${
                      bot.status === 'running' ? 'bg-emerald-500/15' :
                      bot.status === 'error' ? 'bg-red-500/15' :
                      bot.status === 'building' ? 'bg-blue-500/15' :
                      'bg-slate-500/15'
                    }`}>
                      <Bot className={`size-6 ${
                        bot.status === 'running' ? 'text-emerald-400' :
                        bot.status === 'error' ? 'text-red-400' :
                        bot.status === 'building' ? 'text-blue-400' :
                        'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{bot.name}</p>
                      <ComparisonStatusBadge status={bot.status} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                      onClick={() => toggleBot(bot.id)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Comparison Categories */}
            {comparisonCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <motion.div key={category.id} variants={itemVariants}>
                  <Card className="bg-card/50 border-border/50 overflow-hidden">
                    {/* Category Header */}
                    <CardHeader className="pb-3 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <div className={`size-7 rounded-lg flex items-center justify-center ${category.iconBg}`}>
                          <CategoryIcon className={`size-3.5 ${category.iconColor}`} />
                        </div>
                        {category.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4 pb-4">
                      {/* Rows */}
                      {category.rows.map((row, rowIdx) => (
                        <div
                          key={row.id}
                          className={`grid gap-4 items-center py-3 ${
                            rowIdx < category.rows.length - 1 ? 'border-b border-border/30' : ''
                          } ${rowIdx % 2 === 1 ? 'bg-muted/20 -mx-4 px-4' : ''}`}
                          style={{ gridTemplateColumns: `minmax(140px, 1fr) repeat(${selectedBots.length}, 1fr)` }}
                        >
                          {/* Row Label */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground font-medium">
                              {row.label}
                            </span>
                          </div>

                          {/* Values for each bot */}
                          {selectedBots.map((bot) => {
                            const value = row.getValue(bot);
                            const colorClass = row.getColor?.(bot);
                            const isEmpty = value === '—';
                            const isError = row.id === 'last-error' && bot.status === 'error';
                            const isGood = row.id === 'last-error' && bot.status !== 'error' && bot._count.logs <= 1500;

                            return (
                              <div key={bot.id} className="flex items-center justify-center">
                                {isEmpty ? (
                                  <span className="text-muted-foreground/40 text-sm">—</span>
                                ) : isError ? (
                                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400">
                                    <XCircle className="size-3.5" />
                                    {value}
                                  </span>
                                ) : isGood ? (
                                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                                    <CheckCircle2 className="size-3.5" />
                                    {value}
                                  </span>
                                ) : (
                                  <span className={`text-sm font-medium ${colorClass || 'text-foreground'}`}>
                                    {value}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
