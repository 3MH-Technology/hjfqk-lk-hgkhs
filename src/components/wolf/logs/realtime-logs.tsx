'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Pause,
  Play,
  Trash2,
  Wifi,
  WifiOff,
  Info,
  AlertTriangle,
  AlertCircle,
  Bug,
  Filter,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface LogEntry {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  timestamp: string;
  botId: string;
  event?: string;
}

type LevelFilter = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const levelConfig: Record<string, { color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  INFO: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: <Info className="size-3.5" />,
  },
  WARN: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: <AlertTriangle className="size-3.5" />,
  },
  ERROR: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: <AlertCircle className="size-3.5" />,
  },
  DEBUG: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: <Bug className="size-3.5" />,
  },
};

const botList = [
  { id: 'all', name: 'جميع البوتات' },
  { id: 'bot-001', name: 'بوت المساعد' },
  { id: 'bot-002', name: 'بوت الإشعارات' },
  { id: 'bot-003', name: 'بوت المدير' },
  { id: 'bot-004', name: 'بوت الدعم الفني' },
  { id: 'bot-005', name: 'بوت التحليلات' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
} as const;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return ts;
  }
}

export function RealtimeLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [botFilter, setBotFilter] = useState<string>('all');
  const [totalReceived, setTotalReceived] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  
  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (botFilter !== 'all' && log.botId !== botFilter) return false;
    return true;
  });

  
  useEffect(() => {
    if (!paused) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, paused]);

  
  useEffect(() => {
    const socket = io('/?XTransformPort=3004', {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connected', () => {
      setConnected(true);
    });

    socket.on('log', (entry: LogEntry) => {
      if (!paused) {
        setLogs((prev) => [...prev.slice(-499), entry]); 
        setTotalReceived((prev) => prev + 1);
      }
    });

    socket.on('subscribed', () => {
      
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [paused]);

  
  const handleBotFilterChange = useCallback((value: string) => {
    setBotFilter(value);
    if (socketRef.current) {
      if (value === 'all') {
        socketRef.current.emit('unsubscribe');
      } else {
        socketRef.current.emit('subscribe', { botId: value });
      }
    }
  }, []);

  
  const handleTogglePause = useCallback(() => {
    const newPaused = !paused;
    setPaused(newPaused);
    if (socketRef.current) {
      if (newPaused) {
        socketRef.current.emit('pause');
      } else {
        socketRef.current.emit('resume');
      }
    }
  }, [paused]);

  
  const handleClear = useCallback(() => {
    setLogs([]);
    setTotalReceived(0);
  }, []);

  const levelCounts = {
    INFO: logs.filter((l) => l.level === 'INFO').length,
    WARN: logs.filter((l) => l.level === 'WARN').length,
    ERROR: logs.filter((l) => l.level === 'ERROR').length,
    DEBUG: logs.filter((l) => l.level === 'DEBUG').length,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Page Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Radio className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">السجلات المباشرة</h2>
            <p className="text-sm text-muted-foreground">بث مباشر لسجلات البوتات عبر WebSocket</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card/40 px-3 py-1.5 backdrop-blur-sm">
            <span className={`relative flex size-2.5`}>
              {connected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex size-2.5 rounded-full ${
                  connected ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {connected ? 'متصل' : 'غير متصل'}
            </span>
            {connected ? (
              <Wifi className="size-3 text-emerald-400" />
            ) : (
              <WifiOff className="size-3 text-red-400" />
            )}
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs">
            {totalReceived.toLocaleString('ar-SA')} رسالة
          </Badge>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card/30 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Level Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as LevelFilter[]).map((level) => {
            const isActive = levelFilter === level;
            const config = level !== 'ALL' ? levelConfig[level] : null;
            const count =
              level === 'ALL'
                ? logs.length
                : levelCounts[level as keyof typeof levelCounts] || 0;

            return (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`
                  flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200
                  ${
                    isActive
                      ? level === 'ALL'
                        ? 'border-primary/50 bg-primary/15 text-primary shadow-sm shadow-primary/10'
                        : `${config!.borderColor} ${config!.bgColor} ${config!.color}`
                      : 'border-border/30 bg-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }
                `}
              >
                {config?.icon}
                <span>{level === 'ALL' ? 'الكل' : level}</span>
                <span className="ml-1 text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Bot Filter */}
        <div className="flex items-center gap-2">
          <Select value={botFilter} onValueChange={handleBotFilterChange}>
            <SelectTrigger className="w-[180px] border-border/40 bg-card/50 text-xs backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <Hash className="size-3 text-muted-foreground" />
                <SelectValue placeholder="تصفية بالبوت" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {botList.map((bot) => (
                <SelectItem key={bot.id} value={bot.id} className="text-xs">
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="border-border/40 bg-card/50 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 backdrop-blur-sm"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline mr-1">مسح</span>
          </Button>

          {/* Pause/Resume Button */}
          <Button
            variant={paused ? 'default' : 'outline'}
            size="sm"
            onClick={handleTogglePause}
            className={`
              text-xs backdrop-blur-sm
              ${paused
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'border-border/40 bg-card/50 text-muted-foreground hover:bg-accent/50'
              }
            `}
          >
            {paused ? (
              <>
                <Play className="size-3.5" />
                <span className="hidden sm:inline mr-1">استئناف</span>
              </>
            ) : (
              <>
                <Pause className="size-3.5" />
                <span className="hidden sm:inline mr-1">إيقاف مؤقت</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Paused Indicator */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
              <Pause className="size-4 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">
                البث متوقف مؤقتاً — السجلات الجديدة لن تظهر حتى الاستئناف
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Stream Container */}
      <motion.div
        variants={fadeInUp}
        className="rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm overflow-hidden"
      >
        {/* Log Header */}
        <div className="flex items-center justify-between border-b border-border/30 bg-card/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Radio className="size-3.5 text-primary animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">بث مباشر</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
            <span>الأحدث أولاً</span>
            <span>•</span>
            <span>الحد الأقصى 500 رسالة</span>
          </div>
        </div>

        {/* Logs List */}
        <div
          ref={logContainerRef}
          className="h-[500px] overflow-y-auto custom-scrollbar"
        >
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <div className="flex size-16 items-center justify-center rounded-full bg-card/50 border border-border/30">
                <Filter className="size-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm">لا توجد سجلات للعرض</p>
              <p className="text-xs text-muted-foreground/60">
                {logs.length > 0
                  ? 'لا توجد سجلات تطابق الفلتر المحدد'
                  : 'في انتظار السجلات الواردة...'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {filteredLogs.map((entry, index) => {
                const config = levelConfig[entry.level] || levelConfig.INFO;
                const isEvent = !!entry.event;

                return (
                  <motion.div
                    key={`${entry.timestamp}-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' as const }}
                    className={`
                      flex items-start gap-2 px-4 py-2 transition-colors duration-150
                      hover:bg-accent/20
                      ${isEvent ? 'bg-primary/5 border-l-2 border-l-primary/30' : ''}
                    `}
                  >
                    {/* Level Badge */}
                    <div
                      className={`mt-0.5 flex shrink-0 items-center justify-center rounded-md border px-1.5 py-0.5 ${config.bgColor} ${config.borderColor}`}
                    >
                      <span className={config.color}>{config.icon}</span>
                    </div>

                    {/* Timestamp */}
                    <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground/50 leading-5">
                      {formatTimestamp(entry.timestamp)}
                    </span>

                    {/* Bot ID Badge */}
                    <span className="mt-0.5 shrink-0 rounded px-1 py-0.5 font-mono text-[10px] text-muted-foreground/40 bg-card/50 border border-border/20">
                      {entry.botId}
                    </span>

                    {/* Event Badge */}
                    {isEvent && (
                      <span className="mt-0.5 shrink-0 rounded px-1 py-0.5 text-[9px] font-bold text-primary bg-primary/10 border border-primary/20">
                        حدث
                      </span>
                    )}

                    {/* Message */}
                    <span className="flex-1 font-mono text-xs text-foreground/80 leading-5 break-all">
                      {entry.message}
                    </span>

                    {/* Level Text */}
                    <span
                      className={`mt-0.5 shrink-0 text-[10px] font-bold ${config.color}`}
                    >
                      {entry.level}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Log Footer */}
        <div className="flex items-center justify-between border-t border-border/30 bg-card/30 px-4 py-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            <span>{filteredLogs.length.toLocaleString('ar-SA')} سجل معروض</span>
            <span>•</span>
            <span>{totalReceived.toLocaleString('ar-SA')} إجمالي الرسائل</span>
          </div>
          <div className="flex items-center gap-2">
            {levelFilter !== 'ALL' && (
              <button
                onClick={() => setLevelFilter('ALL')}
                className="text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                مسح فلتر المستوى
              </button>
            )}
            {botFilter !== 'all' && (
              <button
                onClick={() => handleBotFilterChange('all')}
                className="text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                مسح فلتر البوت
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
