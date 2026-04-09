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
  warn: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  debug: 'bg-muted text-muted-foreground border-border',
};

const logTextColors: Record<string, string> = {
  info: 'text-cyan-300',
  warn: 'text-amber-300',
  error: 'text-red-400',
  debug: 'text-muted-foreground',
};

const levelLabels: Record<string, string> = {
  info: 'معلومات',
  warn: 'تحذير',
  error: 'خطأ',
  debug: 'تصحيح',
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
    } catch (err: any) {
      // Silent error for background refresh
      if (logs.length === 0) {
        toast.error(err.message || 'حدث خطأ أثناء جلب السجلات');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedBotId, isPaused, logs.length]);

  // Initial load
  useEffect(() => {
    if (selectedBotId) {
      setLoading(true);
      fetchLogs();
    }
  }, [selectedBotId]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!selectedBotId || isPaused) return;
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [selectedBotId, isPaused, fetchLogs]);

  // Auto-scroll to bottom
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* Controls */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
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

            {/* Level Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {LOG_LEVELS.map((level) => (
                <Button
                  key={level}
                  size="sm"
                  variant={filter === level ? 'default' : 'outline'}
                  onClick={() => setFilter(level)}
                  className="text-xs h-7 px-2.5"
                >
                  {level === 'الكل' ? 'الكل' : levelLabels[level] || level}
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="hidden sm:block h-6" />

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                className="text-xs"
                title={isPaused ? 'استئناف التحديث' : 'إيقاف التحديث'}
              >
                {isPaused ? (
                  <Play className="h-3.5 w-3.5 ml-1" />
                ) : (
                  <Pause className="h-3.5 w-3.5 ml-1" />
                )}
                {isPaused ? 'استئناف' : 'إيقاف'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setAutoScroll(!autoScroll)}
                className={`text-xs ${autoScroll ? 'text-primary' : ''}`}
                title="التمرير التلقائي"
              >
                <ArrowDown className="h-3.5 w-3.5 ml-1" />
                تمرير
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleClearLogs}
                className="text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 ml-1" />
                مسح
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadLogs}
                className="text-xs"
              >
                <Download className="h-3.5 w-3.5 ml-1" />
                تحميل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Content */}
      <Card className="flex-1 border-border/50 overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              السجلات
              <Badge variant="secondary" className="text-xs mr-2">
                {filteredLogs.length} سجل
              </Badge>
              {isPaused && (
                <Badge variant="destructive" className="text-xs mr-1">
                  متوقف
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-340px)] min-h-[300px]">
            <div className="p-4" ref={scrollRef}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="mr-2 text-muted-foreground text-sm">
                    جارٍ تحميل السجلات...
                  </span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
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
                        لا توجد سجلات
                      </p>
                      <p className="text-muted-foreground/60 text-xs mt-1">
                        ستظهر سجلات البوت هنا تلقائياً
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 py-1.5 px-2 rounded-md hover:bg-accent/30 transition-colors group"
                    >
                      {/* Timestamp */}
                      <span
                        className="text-xs font-mono text-muted-foreground whitespace-nowrap pt-0.5 shrink-0"
                        dir="ltr"
                        title={formatRelativeTime(log.createdAt)}
                      >
                        {formatTimestamp(log.createdAt)}
                      </span>

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
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
