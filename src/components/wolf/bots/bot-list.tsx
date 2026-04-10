'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  GitCompareArrows,
  Search,
  LayoutGrid,
  List,
  Copy,
  Check,
  Eye,
  Download,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

// ─── Motion Variants ─────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
} as const;

const filterBarVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
  },
} as const;

const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
} as const;

const wolfFloatVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
} as const;

const wolfEyeGlowVariants: Variants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
} as const;

// ─── Status Config ──────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  {
    label: string;
    dotClass: string;
    badgeColor: string;
    glowClass: string;
    borderPulse: string;
  }
> = {
  running: {
    label: 'يعمل',
    dotClass: 'bg-emerald-400 pulse-dot',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    glowClass:
      'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-emerald-500/[0.06] before:via-transparent before:to-transparent',
    borderPulse:
      'animate-[border-pulse-green_2s_ease-in-out_infinite] shadow-[0_0_12px_rgba(16,185,129,0.15),0_0_24px_rgba(16,185,129,0.08)]',
  },
  stopped: {
    label: 'متوقف',
    dotClass: 'bg-slate-400',
    badgeColor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    glowClass:
      'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-slate-500/[0.04] before:via-transparent before:to-transparent',
    borderPulse: '',
  },
  building: {
    label: 'جاري البناء',
    dotClass: 'bg-blue-400 pulse-dot',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    glowClass:
      'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-blue-500/[0.08] before:via-transparent before:to-transparent',
    borderPulse:
      'animate-[border-pulse-blue_2s_ease-in-out_infinite] shadow-[0_0_12px_rgba(59,130,246,0.12)]',
  },
  error: {
    label: 'خطأ',
    dotClass: 'bg-red-400',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
    glowClass:
      'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-red-500/[0.08] before:via-transparent before:to-transparent',
    borderPulse:
      'animate-[border-pulse-red_1.5s_ease-in-out_infinite] shadow-[0_0_12px_rgba(239,68,68,0.15)]',
  },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.stopped;
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 text-xs font-medium ${cfg.badgeColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </Badge>
  );
}

function LanguageBadge({ language }: { language: string }) {
  return language === 'python' ? (
    <Badge
      variant="outline"
      className="gap-1 text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
    >
      🐍 Python
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
    >
      🐘 PHP
    </Badge>
  );
}

function WolfSilhouette() {
  return (
    <motion.div
      variants={wolfFloatVariants}
      animate="animate"
      className="relative mb-6"
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]"
      >
        {/* Wolf head silhouette */}
        <path
          d="M60 10C55 10 48 18 42 30C36 42 30 55 28 65C26 75 30 85 38 92C46 99 54 102 60 102C66 102 74 99 82 92C90 85 94 75 92 65C90 55 84 42 78 30C72 18 65 10 60 10Z"
          fill="url(#wolfGrad)"
          opacity="0.9"
        />
        {/* Left ear */}
        <path
          d="M42 30L32 8L48 25Z"
          fill="url(#wolfGrad)"
          opacity="0.85"
        />
        {/* Right ear */}
        <path
          d="M78 30L88 8L72 25Z"
          fill="url(#wolfGrad)"
          opacity="0.85"
        />
        {/* Left eye */}
        <motion.ellipse
          variants={wolfEyeGlowVariants}
          animate="animate"
          cx="48"
          cy="58"
          rx="4"
          ry="3.5"
          fill="#f59e0b"
          opacity="0.9"
        />
        {/* Right eye */}
        <motion.ellipse
          variants={wolfEyeGlowVariants}
          animate="animate"
          cx="72"
          cy="58"
          rx="4"
          ry="3.5"
          fill="#f59e0b"
          opacity="0.9"
        />
        {/* Nose */}
        <ellipse cx="60" cy="76" rx="3" ry="2.5" fill="#d97706" opacity="0.8" />
        {/* Mouth line */}
        <path
          d="M56 80Q60 84 64 80"
          stroke="#d97706"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
        />
        <defs>
          <linearGradient
            id="wolfGrad"
            x1="30"
            y1="8"
            x2="90"
            y2="102"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="1" stopColor="#78716c" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
      {/* Ambient glow behind wolf */}
      <div className="absolute inset-0 -z-10 blur-2xl rounded-full bg-blue-500/10 scale-150" />
    </motion.div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('تم نسخ معرف الحاوية');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('فشل في النسخ');
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {copied ? 'تم النسخ!' : 'نسخ المعرف'}
      </TooltipContent>
    </Tooltip>
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

function ListCardSkeleton() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Animated Action Button ─────────────────────────────────────────────────

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  colorClass?: string;
  disabled?: boolean;
  onClick: () => void;
}

function ActionButton({
  icon,
  label,
  tooltip,
  colorClass = '',
  disabled = false,
  onClick,
}: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="outline"
            className={`h-8 gap-1.5 transition-all duration-200 ${colorClass}`}
            onClick={onClick}
            disabled={disabled}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function BotList() {
  const { setCurrentPage, setSelectedBotId } = useAppStore();
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Filtered bots
  const filteredBots = useMemo(() => {
    return bots.filter((bot) => {
      const matchesSearch = bot.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || bot.status === statusFilter;
      const matchesLanguage =
        languageFilter === 'all' || bot.language === languageFilter;
      return matchesSearch && matchesStatus && matchesLanguage;
    });
  }, [bots, searchQuery, statusFilter, languageFilter]);

  const handleAction = async (
    botId: string,
    action: 'start' | 'stop' | 'restart'
  ) => {
    setActionLoading(botId);
    try {
      const res = await fetch(`/api/bots/${botId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'فشل العملية');

      const messages: Record<string, string> = {
        start: 'تم تشغيل البوت بنجاح',
        stop: 'تم إيقاف البوت بنجاح',
        restart: 'تم إعادة تشغيل البوت بنجاح',
      };
      toast.success(messages[action]);
      fetchBots();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'فشل العملية';
      toast.error(message);
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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'فشل الحذف';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportBot = async (botId: string, botName: string) => {
    try {
      const res = await fetch(`/api/bots/${botId}/bot-export`, { credentials: 'include' });
      if (!res.ok) throw new Error('فشل في التصدير');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${botName.replace(/[^a-zA-Z0-9\u0600-\u06FF-_]/g, '_')}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('تم تصدير البوت بنجاح');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء التصدير';
      toast.error(message);
    }
  };

  const handleImportBot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/bots/bot-import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في الاستيراد');
      toast.success('تم استيراد البوت بنجاح');
      fetchBots();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء الاستيراد';
      toast.error(message);
    } finally {
      setImportLoading(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handleViewBot = (botId: string) => {
    setSelectedBotId(botId);
    setCurrentPage('bot-detail');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">إدارة البوتات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة وتحكم في جميع بوتاتك
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('bot-comparison')}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <GitCompareArrows className="h-4 w-4" />
            <span className="hidden sm:inline">مقارنة البوتات</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBots}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            إنشاء بوت جديد
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => importInputRef.current?.click()}
            disabled={importLoading}
            className="gap-2"
          >
            {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="hidden sm:inline">استيراد بوت</span>
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleImportBot}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* Filter Bar */}
      {!loading && bots.length > 0 && (
        <motion.div
          variants={filterBarVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 space-y-3"
        >
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث عن بوت..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 h-9 bg-muted/30 border-border/50 focus:border-primary/40"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                size="sm"
                className="w-full sm:w-[150px] bg-muted/30 border-border/50"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="running">يعمل</SelectItem>
                <SelectItem value="stopped">متوقف</SelectItem>
                <SelectItem value="building">جاري البناء</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
              </SelectContent>
            </Select>

            {/* Language Filter */}
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger
                size="sm"
                className="w-full sm:w-[150px] bg-muted/30 border-border/50"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل اللغات</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-primary/20 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">عرض شبكي</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-primary/20 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">عرض قائمة</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Count summary */}
          <div className="text-xs text-muted-foreground">
            عرض{' '}
            <span className="text-foreground font-medium">{filteredBots.length}</span>{' '}
            من{' '}
            <span className="text-foreground font-medium">{bots.length}</span>{' '}
            بوتات
            {filteredBots.length !== bots.length && (
              <span className="text-primary/70 mr-1">(تم التصفية)</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Bots Grid / List */}
      {loading ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {Array.from({ length: 3 }).map((_, i) =>
            viewMode === 'grid' ? (
              <BotCardSkeleton key={i} />
            ) : (
              <ListCardSkeleton key={i} />
            )
          )}
        </div>
      ) : bots.length === 0 ? (
        <motion.div
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-dashed border-border/50 bg-card/30 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <WolfSilhouette />
            <h3 className="font-semibold text-lg mb-2">لا توجد بوتات</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              ابدأ بإنشاء بوتك الأول لاستضافته على المنصة. يمكنك إنشاء بوتات Python
              أو PHP بسهولة.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                إنشاء بوت جديد
              </Button>
            </motion.div>
          </div>
        </motion.div>
      ) : filteredBots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-dashed border-border/50 bg-card/30 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-base mb-1">لا توجد نتائج</h3>
            <p className="text-muted-foreground text-sm">
              لا توجد بوتات تطابق معايير البحث والتصفية المحددة
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setLanguageFilter('all');
              }}
              className="mt-3 text-primary"
            >
              مسح الفلاتر
            </Button>
          </div>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredBots.map((bot) => {
              const cfg = statusConfig[bot.status] || statusConfig.stopped;
              return (
                <motion.div key={bot.id} variants={cardVariants} layout exit="exit">
                  <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card
                      className={`relative overflow-hidden bg-card/60 border-border/50 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm ${cfg.borderPulse}`}
                    >
                      {/* Gradient overlay based on status */}
                      <div className={`pointer-events-none ${cfg.glowClass}`} />

                      <CardContent className="p-5 space-y-4 relative">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleViewBot(bot.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                <Bot className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                              </div>
                              <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                {bot.name}
                              </h3>
                            </div>
                            {bot.description && (
                              <p className="text-sm text-muted-foreground truncate mt-1 mr-10">
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

                        {/* Container info with copy */}
                        {bot.containerId && (
                          <div
                            className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 font-mono flex items-center justify-between gap-2"
                            dir="ltr"
                          >
                            <span className="truncate">
                              {bot.containerId}
                              {bot.port && ` :${bot.port}`}
                            </span>
                            <CopyButton text={bot.containerId} />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {bot.status === 'stopped' && (
                            <ActionButton
                              icon={
                                actionLoading === bot.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Play className="h-3.5 w-3.5" />
                                )
                              }
                              label="تشغيل"
                              tooltip="تشغيل البوت"
                              colorClass="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                              disabled={actionLoading === bot.id}
                              onClick={() => handleAction(bot.id, 'start')}
                            />
                          )}

                          {bot.status === 'running' && (
                            <>
                              <ActionButton
                                icon={
                                  actionLoading === bot.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Square className="h-3.5 w-3.5" />
                                  )
                                }
                                label="إيقاف"
                                tooltip="إيقاف البوت"
                                colorClass="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                                disabled={actionLoading === bot.id}
                                onClick={() => handleAction(bot.id, 'stop')}
                              />
                              <ActionButton
                                icon={
                                  actionLoading === bot.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  )
                                }
                                label="إعادة تشغيل"
                                tooltip="إعادة تشغيل البوت"
                                colorClass="text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                                disabled={actionLoading === bot.id}
                                onClick={() => handleAction(bot.id, 'restart')}
                              />
                            </>
                          )}

                          {bot.status === 'building' && (
                            <div className="flex items-center gap-1.5 text-blue-400 text-sm">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              جاري البناء...
                            </div>
                          )}

                          <ActionButton
                            icon={<FolderOpen className="h-3.5 w-3.5" />}
                            label="الملفات"
                            tooltip="إدارة الملفات"
                            onClick={() => {
                              setSelectedBotId(bot.id);
                              setCurrentPage('files');
                            }}
                          />

                          <ActionButton
                            icon={<ScrollText className="h-3.5 w-3.5" />}
                            label="السجلات"
                            tooltip="عرض السجلات"
                            onClick={() => {
                              setSelectedBotId(bot.id);
                              setCurrentPage('logs');
                            }}
                          />

                          <ActionButton
                            icon={<Download className="h-3.5 w-3.5" />}
                            label="تصدير"
                            tooltip="تصدير البوت"
                            colorClass="text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                            onClick={() => handleExportBot(bot.id, bot.name)}
                          />

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                                  onClick={() => setDeleteDialog(bot.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top">حذف البوت</TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* List View */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredBots.map((bot) => {
              const cfg = statusConfig[bot.status] || statusConfig.stopped;
              return (
                <motion.div key={bot.id} variants={cardVariants} layout exit="exit">
                  <motion.div whileHover={{ x: 4, transition: { duration: 0.2 } }}>
                    <Card
                      className={`relative overflow-hidden bg-card/60 border-border/50 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm ${cfg.borderPulse}`}
                    >
                      <div className={`pointer-events-none ${cfg.glowClass}`} />
                      <CardContent className="p-4 flex items-center gap-4 relative">
                        {/* Bot icon */}
                        <div
                          className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors cursor-pointer"
                          onClick={() => handleViewBot(bot.id)}
                        >
                          <Bot className="h-5 w-5 text-primary/70 group-hover:text-primary transition-colors" />
                        </div>

                        {/* Bot info */}
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewBot(bot.id)}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {bot.name}
                            </h3>
                            <StatusBadge status={bot.status} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
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
                        </div>

                        {/* Container ID (desktop only) */}
                        {bot.containerId && (
                          <div
                            className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5 font-mono"
                            dir="ltr"
                          >
                            <span className="truncate max-w-[100px]">
                              {bot.containerId.slice(0, 12)}
                            </span>
                            <CopyButton text={bot.containerId} />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {bot.status === 'stopped' && (
                            <ActionButton
                              icon={
                                actionLoading === bot.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Play className="h-3.5 w-3.5" />
                                )
                              }
                              label=""
                              tooltip="تشغيل"
                              colorClass="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              disabled={actionLoading === bot.id}
                              onClick={() => handleAction(bot.id, 'start')}
                            />
                          )}
                          {bot.status === 'running' && (
                            <>
                              <ActionButton
                                icon={
                                  actionLoading === bot.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Square className="h-3.5 w-3.5" />
                                  )
                                }
                                label=""
                                tooltip="إيقاف"
                                colorClass="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                disabled={actionLoading === bot.id}
                                onClick={() => handleAction(bot.id, 'stop')}
                              />
                              <ActionButton
                                icon={
                                  actionLoading === bot.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  )
                                }
                                label=""
                                tooltip="إعادة تشغيل"
                                colorClass="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                                disabled={actionLoading === bot.id}
                                onClick={() => handleAction(bot.id, 'restart')}
                              />
                            </>
                          )}
                          {bot.status === 'building' && (
                            <div className="flex items-center gap-1 text-blue-400 text-xs px-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </div>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedBotId(bot.id);
                                    setCurrentPage('files');
                                  }}
                                >
                                  <FolderOpen className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top">الملفات</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedBotId(bot.id);
                                    setCurrentPage('logs');
                                  }}
                                >
                                  <ScrollText className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top">السجلات</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleViewBot(bot.id)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top">التفاصيل</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                                  onClick={() => setDeleteDialog(bot.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top">حذف</TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Bot Dialog */}
      <CreateBotDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={fetchBots}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              حذف البوت
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا البوت؟ سيتم حذف جميع الملفات والسجلات المرتبطة
              به بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
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
