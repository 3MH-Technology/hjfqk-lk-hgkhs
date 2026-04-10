'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal,
  Filter,
  Search,
  Download,
  Trash2,
  Pause,
  Play,
  ArrowDown,
  Loader2,
  X,
  Info,
  AlertTriangle,
  AlertCircle,
  Bug,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface BotLog {
  id: string;
  botId: string;
  level: string;
  message: string;
  createdAt: string;
}

const LOG_LEVELS = ['الكل', 'info', 'warn', 'error', 'debug'] as const;
type LogLevelFilter = (typeof LOG_LEVELS)[number];

const levelColors: Record<string, string> = {
  info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  warn: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  debug: 'bg-muted text-muted-foreground border-border',
};

const logTextColors: Record<string, string> = {
  info: 'text-cyan-300',
  warn: 'text-blue-300',
  error: 'text-red-400',
  debug: 'text-muted-foreground',
};

const levelLabels: Record<string, string> = {
  info: 'معلومات',
  warn: 'تحذير',
  error: 'خطأ',
  debug: 'تصحيح',
};

const levelIcons: Record<string, typeof Info> = {
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
  debug: Bug,
};


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
};

const logEntryVariants: Variants = {
  hidden: { opacity: 0, x: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.15,
    },
  },
};

export default function LogViewer() {
  const { selectedBotId, setCurrentPage } = useAppStore();
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<LogLevelFilter>('الكل');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [cleared, setCleared] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    if (!selectedBotId || isPaused) return;
    try {
      const res = await fetch(
        `/api/bots/${selectedBotId}/logs?limit=200`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('فشل في جلب السجلات');
      const data = await res.json();
      setLogs(data);
      setCleared(false);
    } catch (err: unknown) {
      if (logs.length === 0) {
        const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب السجلات';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedBotId, isPaused, logs.length]);

  
  useEffect(() => {
    if (selectedBotId) {
      setLoading(true);
      fetchLogs();
    }
    }, [selectedBotId]);

  
  useEffect(() => {
    if (!selectedBotId || isPaused) return;
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [selectedBotId, isPaused, fetchLogs]);

  
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filter === 'الكل' || log.level === filter;
    const matchesSearch =
      !search || log.message.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  
  const logCounts = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {});

  const handleClearLogs = () => {
    setLogs([]);
    setCleared(true);
    toast.success('تم مسح السجلات من العرض');
  };

  const handleDownloadLogs = () => {
    const content = logs
      .map(
        (log) =>
          `[${new Date(log.createdAt).toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${selectedBotId || 'bot'}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل السجلات');
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'HH:mm:ss', { locale: ar });
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: ar,
      });
    } catch {
      return '';
    }
  };

  if (!selectedBotId) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
      >
        <Terminal className="h-16 w-16 text-muted-foreground/40" />
        <p className="text-muted-foreground text-lg">لم يتم اختيار بوت</p>
        <p className="text-muted-foreground/70 text-sm">
          اختر بوتاً لعرض سجلاته
        </p>
        <Button
          variant="outline"
          onClick={() => setCurrentPage('bots')}
          className="mt-2"
        >
          العودة للبوتات
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4 p-4 h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Bar - Log Counts by Level */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Terminal className="h-4 w-4 text-primary" />
                إحصائيات السجلات
              </div>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              {[
                { level: 'info', label: 'معلومات', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', icon: Info },
                { level: 'warn', label: 'تحذير', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: AlertTriangle },
                { level: 'error', label: 'خطأ', color: 'bg-red-500/15 text-red-400 border-red-500/30', icon: AlertCircle },
                { level: 'debug', label: 'تصحيح', color: 'bg-muted text-muted-foreground border-border', icon: Bug },
              ].map((stat) => (
                <motion.div
                  key={stat.level}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${stat.color}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(stat.level as LogLevelFilter)}
                  role="button"
                  style={{ cursor: 'pointer' }}
                >
                  <stat.icon className="h-3 w-3" />
                  {stat.label}
                  <Badge variant="secondary" className="text-[10px] h-4 min-w-[20px] flex items-center justify-center">
                    {logCounts[stat.level] || 0}
                  </Badge>
                </motion.div>
              ))}
              <div className="mr-auto text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                المجموع: {logs.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Search within logs */}
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث في السجلات..."
                  className="pr-9 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Animated Level Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {LOG_LEVELS.map((level) => (
                  <motion.div
                    key={level}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant={filter === level ? 'default' : 'outline'}
                      onClick={() => setFilter(level)}
                      className={`text-xs h-7 px-2.5 transition-all ${
                        filter === level
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'hover:border-primary/30'
                      }`}
                    >
                      {level === 'الكل' ? 'الكل' : levelLabels[level] || level}
                    </Button>
                  </motion.div>
                ))}
              </div>

              <Separator orientation="vertical" className="hidden sm:block h-6" />

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPaused(!isPaused)}
                    className={`text-xs ${isPaused ? 'text-blue-400 border-blue-500/30 bg-blue-500/5' : ''}`}
                    title={isPaused ? 'استئناف التحديث' : 'إيقاف التحديث'}
                  >
                    {isPaused ? (
                      <Play className="h-3.5 w-3.5 ml-1" />
                    ) : (
                      <Pause className="h-3.5 w-3.5 ml-1" />
                    )}
                    {isPaused ? 'استئناف' : 'إيقاف'}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`text-xs transition-all ${
                      autoScroll
                        ? 'text-primary border-primary/30 bg-primary/5'
                        : ''
                    }`}
                    title="التمرير التلقائي"
                  >
                    <ArrowDown className={`h-3.5 w-3.5 ml-1 ${autoScroll ? 'animate-bounce' : ''}`} />
                    تمرير
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearLogs}
                    className="text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5 ml-1" />
                    مسح
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadLogs}
                    className="text-xs"
                  >
                    <Download className="h-3.5 w-3.5 ml-1" />
                    تحميل
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Log Content */}
      <motion.div variants={itemVariants} className="flex-1">
        <Card className="h-full border-border/50 overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                السجلات
                <Badge variant="secondary" className="text-xs mr-2">
                  {filteredLogs.length} سجل
                </Badge>
                {search && (
                  <Badge variant="outline" className="text-xs mr-1 bg-primary/5 text-primary border-primary/30">
                    بحث: &quot;{search}&quot;
                    <button onClick={() => setSearch('')} className="mr-1 hover:text-foreground">
                      <X className="h-3 w-3 inline" />
                    </button>
                  </Badge>
                )}
                {filter !== 'الكل' && (
                  <Badge variant="outline" className={`text-xs mr-1 ${levelColors[filter]}`}>
                    {levelLabels[filter] || filter}
                    <button onClick={() => setFilter('الكل')} className="mr-1 hover:text-foreground">
                      <X className="h-3 w-3 inline" />
                    </button>
                  </Badge>
                )}
                {isPaused && (
                  <Badge variant="destructive" className="text-xs mr-1">
                    متوقف
                  </Badge>
                )}
              </CardTitle>
              {!autoScroll && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAutoScroll(true);
                      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs gap-1"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    التمرير للأسفل
                  </Button>
                </motion.div>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-420px)] min-h-[300px]">
              <div className="p-4" ref={scrollRef}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="mr-2 text-muted-foreground text-sm">
                      جارٍ تحميل السجلات...
                    </span>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-12 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
                  >
                    {cleared ? (
                      <>
                        <Trash2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground text-sm">
                          تم مسح السجلات
                        </p>
                        <p className="text-muted-foreground/60 text-xs mt-1">
                          ستظهر السجلات الجديدة تلقائياً
                        </p>
                      </>
                    ) : (
                      <>
                        <Terminal className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground text-sm">
                          {search || filter !== 'الكل' ? 'لا توجد نتائج مطابقة' : 'لا توجد سجلات'}
                        </p>
                        <p className="text-muted-foreground/60 text-xs mt-1">
                          {search || filter !== 'الكل' ? 'جرّب تغيير معايير البحث أو الفلتر' : 'ستظهر سجلات البوت هنا تلقائياً'}
                        </p>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-0.5">
                    <AnimatePresence mode="popLayout">
                      {filteredLogs.map((log, index) => {
                        const LevelIcon = levelIcons[log.level] || Bug;
                        return (
                          <motion.div
                            key={log.id}
                            variants={logEntryVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ delay: Math.min(index * 0.015, 0.5) }}
                            className={`flex items-start gap-3 py-2 px-2.5 rounded-lg hover:bg-accent/40 transition-colors group ${
                              index % 2 === 0 ? 'bg-card/20' : ''
                            }`}
                            layout
                          >
                            {/* Timestamp */}
                            <span
                              className="text-[11px] font-mono text-muted-foreground whitespace-nowrap pt-0.5 shrink-0"
                              dir="ltr"
                              title={formatRelativeTime(log.createdAt)}
                            >
                              {formatTimestamp(log.createdAt)}
                            </span>

                            {/* Level Icon */}
                            <div className={`shrink-0 mt-0.5 ${logTextColors[log.level] || logTextColors.debug}`}>
                              <LevelIcon className="h-3.5 w-3.5" />
                            </div>

                            {/* Level Badge */}
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 h-5 shrink-0 ${
                                levelColors[log.level] || levelColors.debug
                              }`}
                            >
                              {levelLabels[log.level] || log.level}
                            </Badge>

                            {/* Message */}
                            <span
                              className={`text-sm font-mono flex-1 break-all leading-relaxed ${
                                logTextColors[log.level] || logTextColors.debug
                              }`}
                              dir="ltr"
                            >
                              {log.message}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
