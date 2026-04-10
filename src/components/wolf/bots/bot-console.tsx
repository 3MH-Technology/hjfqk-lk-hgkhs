'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Wifi, MemoryStick, Clock, Terminal } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


interface LogLine {
  id: number;
  text: string;
  type: 'info' | 'ok' | 'warn' | 'error' | 'cmd' | 'response';
  timestamp: string;
}


const BOOT_SEQUENCE: LogLine[] = [
  { id: 1, text: '[INFO] جاري تحضير البيئة...', type: 'info', timestamp: '' },
  { id: 2, text: '[INFO] تم تحميل التبعيات بنجاح (42 حزمة)', type: 'ok', timestamp: '' },
  { id: 3, text: '[INFO] جاري فحص المنافذ المتاحة...', type: 'info', timestamp: '' },
  { id: 4, text: '[INFO] المنفذ 8080 متاح ✓', type: 'ok', timestamp: '' },
  { id: 5, text: '[INFO] جاري تشغيل البوت...', type: 'info', timestamp: '' },
  { id: 6, text: '[OK] البوت يعمل بنجاح ✓', type: 'ok', timestamp: '' },
  { id: 7, text: '[OK] جاهز لاستقبال الأوامر', type: 'ok', timestamp: '' },
];

const RANDOM_LOGS = [
  { text: '[INFO] استجابة API: 200 OK — took 45ms', type: 'info' as const },
  { text: '[INFO] تم معالجة 12 طلب خلال آخر دقيقة', type: 'info' as const },
  { text: '[INFO] ذاكرة التخزين المؤقت نظيفة', type: 'ok' as const },
  { text: '[WARN] استخدام الذاكرة تجاوز 60%', type: 'warn' as const },
  { text: '[INFO] اتصال قاعدة البيانات مستقر', type: 'ok' as const },
  { text: '[INFO] ping: db-master.example.com — 2ms', type: 'info' as const },
  { text: '[INFO] تم تسجيل دخول مستخدم جديد', type: 'info' as const },
  { text: '[OK] فحص صحة النظام — جميع الخدمات تعمل', type: 'ok' as const },
  { text: '[INFO] عدد العملاء النشطين: 3', type: 'info' as const },
  { text: '[INFO] heartbeat — النظام يعمل بشكل طبيعي', type: 'ok' as const },
  { text: '[WARN] عدد الطلبات في الثانية مرتفع: 850 req/s', type: 'warn' as const },
  { text: '[INFO] تم تحديث الإعدادات من الكاش', type: 'info' as const },
];

const COMMAND_RESPONSES: Record<string, (botName: string, uptime: string, mem: number) => string[]> = {
  '/status': (botName, uptime, mem) => [
    `┌─────────────────────────────────────┐`,
    `│  حالة البوت: ${botName}`,
    `│  الحالة: يعمل بنجاح`,
    `│  وقت التشغيل: ${uptime}`,
    `│  استخدام الذاكرة: ${mem.toFixed(1)}%`,
    `│  اتصال الشبكة: مستقر`,
    `│  العملاء النشطين: ${Math.floor(Math.random() * 10) + 1}`,
    `└─────────────────────────────────────┘`,
  ],
  '/help': () => [
    `الأوامر المتاحة:`,
    `  /status   — عرض حالة البوت`,
    `  /help     — عرض قائمة الأوامر`,
    `  /restart  — إعادة تشغيل البوت`,
    `  /logs     — عرض آخر السجلات`,
    `  /clear    — مسح الطرفية`,
  ],
  '/restart': () => [
    `[WARN] جاري إعادة التشغيل...`,
    `[INFO] إيقاف العمليات الحالية...`,
    `[INFO] تحرير الموارد...`,
    `[INFO] جاري التحضير لإعادة التشغيل...`,
    `[INFO] بدء التشغيل...`,
    `[OK] تم إعادة التشغيل بنجاح ✓`,
    `[OK] جاهز لاستقبال الأوامر`,
  ],
  '/logs': () => {
    return RANDOM_LOGS.slice(0, 5).map((l) => l.text);
  },
  '/clear': () => ['__CLEAR__'],
};

function getTimestamp(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}


export function BotConsole() {
  const { selectedBotId, setCurrentPage } = useAppStore();
  const [botName, setBotName] = useState<string>('البوت');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [input, setInput] = useState('');
  const [uptime, setUptime] = useState(0);
  const [memory, setMemory] = useState(45.2);
  const [connected, setConnected] = useState(true);
  const [booting, setBooting] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const logIdRef = useRef(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uptimeRef = useRef(0);


  useEffect(() => {
    if (selectedBotId) {
      fetch(`/api/bots/${selectedBotId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.name) setBotName(data.name);
        })
        .catch(() => { });
    }

    let isMounted = true;
    const fetchLogs = async () => {
      if (!selectedBotId || !isMounted) return;
      try {
        const res = await fetch(`/api/bots/${selectedBotId}/logs?limit=50`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const mappedLogs: LogLine[] = data.reverse().map((l: any, i: number) => ({
              id: l.id,
              text: l.message,
              type: l.level === 'error' ? 'error' : 'info',
              timestamp: new Date(l.createdAt).toLocaleTimeString('ar-EG', { hour12: false }),
            }));
            setLogs(mappedLogs);
            setBooting(false);
          }
        }
      } catch (err) {
        console.error("Log fetch error:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedBotId]);


  useEffect(() => {
    const blink = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(blink);
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      uptimeRef.current += 1;
      setUptime(uptimeRef.current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setMemory((prev) => {
        const delta = (Math.random() - 0.48) * 2.5;
        const next = Math.max(30, Math.min(85, prev + delta));
        return parseFloat(next.toFixed(1));
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    if (booting) return;

    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 3000;
      return setTimeout(() => {
        const log = RANDOM_LOGS[Math.floor(Math.random() * RANDOM_LOGS.length)];
        setLogs((prev) => [
          ...prev,
          {
            id: ++logIdRef.current,
            text: log.text,
            type: log.type,
            timestamp: getTimestamp(),
          },
        ]);
        timerRef.current = scheduleNext();
      }, delay);
    };

    const timerRef = { current: scheduleNext() };
    return () => clearTimeout(timerRef.current);
  }, [booting]);


  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);


  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);


  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = input.trim();
      if (!cmd) return;


      setLogs((prev) => [
        ...prev,
        { id: ++logIdRef.current, text: `$ ${cmd}`, type: 'cmd', timestamp: getTimestamp() },
      ]);


      setCommandHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);


      const handler = COMMAND_RESPONSES[cmd];
      if (handler) {
        const responses = handler(botName, formatUptime(uptime), memory);
        if (responses[0] === '__CLEAR__') {
          setLogs([]);
        } else {
          responses.forEach((line, i) => {
            setTimeout(() => {
              setLogs((prev) => [
                ...prev,
                {
                  id: ++logIdRef.current,
                  text: line,
                  type: cmd === '/restart' ? (i < 2 ? 'warn' : 'ok') : 'response',
                  timestamp: getTimestamp(),
                },
              ]);
            }, i * 300);
          });
        }
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: ++logIdRef.current,
            text: `أمر غير معروف: ${cmd} — اكتب /help لعرض الأوامر`,
            type: 'warn',
            timestamp: getTimestamp(),
          },
        ]);
      }

      setInput('');
    },
    [input, botName, uptime, memory]
  );


  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length === 0) return;
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex === -1) return;
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    },
    [commandHistory, historyIndex]
  );


  function getLogColor(type: LogLine['type']): string {
    switch (type) {
      case 'info':
        return 'text-slate-300';
      case 'ok':
        return 'text-emerald-400';
      case 'warn':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      case 'cmd':
        return 'text-blue-300';
      case 'response':
        return 'text-sky-300';
      default:
        return 'text-slate-300';
    }
  }

  const memoryColor =
    memory < 60 ? 'bg-emerald-500' : memory < 75 ? 'bg-blue-500' : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setCurrentPage('bot-detail')}
          >
            <ArrowRight className="h-4 w-4" />
            العودة لتفاصيل البوت
          </Button>
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">{botName}</h1>
            <Badge
              variant="outline"
              className={
                booting
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${booting ? 'bg-blue-400' : 'bg-emerald-400'} animate-pulse`}
              />
              {booting ? 'جاري التحميل' : 'يعمل'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-black/30">
        {/* Terminal Title Bar */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-blue-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-zinc-400 font-mono" dir="ltr">
            wolf-console — {botName}
          </span>
        </div>

        {/* Terminal Content */}
        <div
          ref={terminalRef}
          onClick={focusInput}
          className="bg-zinc-950 h-[55vh] min-h-[300px] overflow-y-auto p-4 font-mono text-sm leading-relaxed scroll-smooth relative"
          dir="ltr"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />

          {/* Log lines */}
          <div className="relative z-10 space-y-0.5">
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-2 ${getLogColor(log.type)}`}
                >
                  <span className="text-zinc-600 select-none shrink-0">{log.timestamp}</span>
                  <span className="whitespace-pre-wrap break-all">{log.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Blinking cursor line */}
            <div className="flex gap-2 text-slate-300 mt-1">
              <span className="text-zinc-600 select-none shrink-0">{getTimestamp()}</span>
              <span>
                <span className="text-blue-400">$</span>{' '}
                {input || (
                  <span
                    className={`inline-block w-2 h-4 bg-blue-400 align-middle transition-opacity ${cursorVisible ? 'opacity-100' : 'opacity-0'
                      }`}
                  />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Command Input Bar */}
        <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span className="text-blue-400 font-mono text-sm font-bold select-none">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب أمراً... (مثال: /help)"
              className="flex-1 bg-transparent text-slate-200 font-mono text-sm outline-none placeholder:text-zinc-600"
              disabled={booting}
              autoComplete="off"
              spellCheck={false}
              dir="auto"
            />
            {input && (
              <span
                className={`inline-block w-2 h-4 bg-blue-400 transition-opacity ${cursorVisible ? 'opacity-100' : 'opacity-0'
                  }`}
              />
            )}
          </form>
        </div>

        {/* Status Bar */}
        <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          {/* Connection */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                  }`}
              />
              <span className="text-zinc-400">{connected ? 'متصل' : 'غير متصل'}</span>
            </div>

            {/* Uptime */}
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3 h-3" />
              <span>{formatUptime(uptime)}</span>
            </div>
          </div>

          {/* Memory */}
          <div className="flex items-center gap-2">
            <MemoryStick className="w-3 h-3 text-zinc-400" />
            <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${memoryColor}`}
                animate={{ width: `${memory}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-zinc-400">{memory.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
