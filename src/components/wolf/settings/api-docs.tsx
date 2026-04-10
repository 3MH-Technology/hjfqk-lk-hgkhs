'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Shield,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  AlertTriangle,
  FileText,
  Users,
  BarChart3,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Category = 'all' | 'auth' | 'bots' | 'files' | 'logs' | 'users' | 'stats';

interface Endpoint {
  method: HttpMethod;
  path: string;
  category: Category;
  description: string;
  requestExample: string;
  responseExample: string;
}


const METHOD_CONFIG: Record<HttpMethod, { color: string; bg: string; border: string }> = {
  GET: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
  },
  POST: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
  },
  PUT: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
  },
  DELETE: {
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
  },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  all: { label: 'الكل', icon: <FileText className="size-4" /> },
  auth: { label: 'المصادقة', icon: <Lock className="size-4" /> },
  bots: { label: 'البوتات', icon: <Terminal className="size-4" /> },
  files: { label: 'الملفات', icon: <FileText className="size-4" /> },
  logs: { label: 'السجلات', icon: <FileText className="size-4" /> },
  users: { label: 'المستخدمين', icon: <Users className="size-4" /> },
  stats: { label: 'الإحصائيات', icon: <BarChart3 className="size-4" /> },
};


const endpoints: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/auth/register',
    category: 'auth',
    description: 'تسجيل حساب جديد على المنصة',
    requestExample: `{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "securePassword123"
}`,
    responseExample: `{
  "id": "usr_abc123",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "role": "user",
  "createdAt": "2025-01-15T10:30:00Z"
}`,
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    category: 'auth',
    description: 'تسجيل الدخول باستخدام البريد وكلمة المرور (NextAuth)',
    requestExample: `{
  "email": "ahmed@example.com",
  "password": "securePassword123",
  "callbackUrl": "/dashboard"
}`,
    responseExample: `{
  "user": {
    "id": "usr_abc123",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "user"
  },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "expiresAt": "2025-01-16T10:30:00Z"
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/bots',
    category: 'bots',
    description: 'قائمة جميع البوتات الخاصة بالمستخدم مع حالة كل بوت',
    requestExample: `
GET /api/bots`,
    responseExample: `[
  {
    "id": "bot_001",
    "name": "بوت الدعم",
    "status": "running",
    "language": "python",
    "createdAt": "2025-01-10T08:00:00Z"
  },
  {
    "id": "bot_002",
    "name": "بوت الإشعارات",
    "status": "stopped",
    "language": "python",
    "createdAt": "2025-01-12T14:00:00Z"
  }
]`,
  },
  {
    method: 'POST',
    path: '/api/bots',
    category: 'bots',
    description: 'إنشاء بوت جديد وإعداده مع متغيرات البيئة',
    requestExample: `{
  "name": "بوت الإشعارات",
  "language": "python",
  "envVars": {
    "BOT_TOKEN": "123456:ABC-DEF...",
    "API_URL": "https:
  }
}`,
    responseExample: `{
  "id": "bot_003",
  "name": "بوت الإشعارات",
  "status": "stopped",
  "language": "python",
  "containerId": "container_xyz789",
  "createdAt": "2025-01-15T11:00:00Z"
}`,
  },
  {
    method: 'GET',
    path: '/api/bots/[id]',
    category: 'bots',
    description: 'الحصول على تفاصيل بوت محدد بالمعرف',
    requestExample: `
GET /api/bots/bot_001`,
    responseExample: `{
  "id": "bot_001",
  "name": "بوت الدعم",
  "status": "running",
  "language": "python",
  "containerId": "container_abc123",
  "envVars": [
    { "key": "BOT_TOKEN", "value": "***" },
    { "key": "API_URL", "value": "https:
  ],
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-15T09:00:00Z"
}`,
  },
  {
    method: 'PUT',
    path: '/api/bots/[id]',
    category: 'bots',
    description: 'تحديث بيانات وإعدادات البوت',
    requestExample: `{
  "name": "بوت الدعم v2",
  "envVars": {
    "BOT_TOKEN": "new_token_value",
    "DEBUG_MODE": "true"
  }
}`,
    responseExample: `{
  "id": "bot_001",
  "name": "بوت الدعم v2",
  "status": "running",
  "language": "python",
  "containerId": "container_abc123",
  "updatedAt": "2025-01-15T12:00:00Z"
}`,
  },
  {
    method: 'DELETE',
    path: '/api/bots/[id]',
    category: 'bots',
    description: 'حذف بوت نهائياً مع جميع ملفاته وسجلاته',
    requestExample: `
DELETE /api/bots/bot_001`,
    responseExample: `{
  "message": "تم حذف البوت بنجاح",
  "deletedBotId": "bot_001"
}`,
  },
  {
    method: 'POST',
    path: '/api/bots/[id]/start',
    category: 'bots',
    description: 'تشغيل بوت متوقف',
    requestExample: `
POST /api/bots/bot_001/start`,
    responseExample: `{
  "message": "تم تشغيل البوت بنجاح",
  "status": "running"
}`,
  },
  {
    method: 'POST',
    path: '/api/bots/[id]/stop',
    category: 'bots',
    description: 'إيقاف بوت يعمل حالياً',
    requestExample: `
POST /api/bots/bot_001/stop`,
    responseExample: `{
  "message": "تم إيقاف البوت بنجاح",
  "status": "stopped"
}`,
  },
  {
    method: 'POST',
    path: '/api/bots/[id]/restart',
    category: 'bots',
    description: 'إعادة تشغيل البوت',
    requestExample: `
POST /api/bots/bot_001/restart`,
    responseExample: `{
  "message": "تم إعادة تشغيل البوت بنجاح",
  "status": "running"
}`,
  },
  {
    method: 'GET',
    path: '/api/bots/[id]/logs',
    category: 'logs',
    description: 'سجل أحداث البوت مع تصفية حسب المستوى',
    requestExample: `

GET /api/bots/bot_001/logs?level=error&limit=50`,
    responseExample: `[
  {
    "id": "log_001",
    "level": "error",
    "message": "Connection timeout after 30s",
    "timestamp": "2025-01-15T10:30:00Z"
  },
  {
    "id": "log_002",
    "level": "warn",
    "message": "High memory usage detected: 85%",
    "timestamp": "2025-01-15T10:28:00Z"
  }
]`,
  },
  {
    method: 'GET',
    path: '/api/bots/[id]/files',
    category: 'files',
    description: 'قائمة ملفات البوت مع بنية المجلدات',
    requestExample: `
GET /api/bots/bot_001/files`,
    responseExample: `[
  {
    "name": "main.py",
    "path": "/main.py",
    "type": "file",
    "size": 2048,
    "modifiedAt": "2025-01-15T09:00:00Z"
  },
  {
    "name": "modules",
    "path": "/modules",
    "type": "directory",
    "children": [
      {
        "name": "handlers.py",
        "path": "/modules/handlers.py",
        "type": "file",
        "size": 1024
      }
    ]
  }
]`,
  },
  {
    method: 'POST',
    path: '/api/bots/[id]/files',
    category: 'files',
    description: 'رفع أو إنشاء ملف جديد في مجلد البوت',
    requestExample: `{
  "path": "/modules/new_module.py",
  "content": "# New module\\nprint('Hello World')",
  "encoding": "utf-8"
}`,
    responseExample: `{
  "name": "new_module.py",
  "path": "/modules/new_module.py",
  "size": 35,
  "createdAt": "2025-01-15T12:00:00Z"
}`,
  },
  {
    method: 'GET',
    path: '/api/stats',
    category: 'stats',
    description: 'إحصائيات المنصة العامة (ال CPU, RAM, البوتات النشطة)',
    requestExample: `
GET /api/stats`,
    responseExample: `{
  "totalBots": 156,
  "activeBots": 89,
  "totalUsers": 342,
  "cpu": 45,
  "ram": 62,
  "uptime": 99.9
}`,
  },
  {
    method: 'GET',
    path: '/api/user/profile',
    category: 'users',
    description: 'الحصول على بيانات الملف الشخصي للمستخدم الحالي',
    requestExample: `
GET /api/user/profile`,
    responseExample: `{
  "id": "usr_abc123",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "role": "user",
  "plan": "free",
  "createdAt": "2025-01-15T10:30:00Z"
}`,
  },
  {
    method: 'PUT',
    path: '/api/user/profile',
    category: 'users',
    description: 'تحديث بيانات الملف الشخصي للمستخدم',
    requestExample: `{
  "name": "أحمد محمد علي",
  "email": "ahmed.new@example.com"
}`,
    responseExample: `{
  "id": "usr_abc123",
  "name": "أحمد محمد علي",
  "email": "ahmed.new@example.com",
  "role": "user",
  "plan": "free",
  "updatedAt": "2025-01-15T14:00:00Z"
}`,
  },
];


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

const heroVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};


function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('تم نسخ الكود');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('فشل في النسخ');
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute left-2 top-2 size-7 text-muted-foreground hover:text-foreground opacity-0 group-hover/code:opacity-100 transition-opacity"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-400" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </Button>
  );
}


function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="group/code relative">
      {label && (
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
      <div className="relative rounded-lg border border-border/50 bg-black/40 overflow-hidden">
        <CopyButton text={code} />
        <pre className="p-3 overflow-x-auto text-[13px] leading-relaxed" dir="ltr">
          <code className="font-mono text-emerald-400/90 whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}


function EndpointCard({ endpoint, index }: { endpoint: Endpoint; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const methodCfg = METHOD_CONFIG[endpoint.method];

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group"
    >
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm hover:border-border/80 transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          {/* Card Header */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-start gap-3 p-4 text-right transition-colors hover:bg-accent/20"
          >
            {/* Method Badge */}
            <Badge
              variant="outline"
              className={`shrink-0 font-mono text-xs font-bold px-2.5 py-0.5 ${methodCfg.color} ${methodCfg.bg} ${methodCfg.border} border`}
            >
              {endpoint.method}
            </Badge>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code
                  className="text-sm font-mono text-foreground/90"
                  dir="ltr"
                >
                  {endpoint.path}
                </code>
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted-foreground/60 border-muted-foreground/20 bg-muted/30"
                >
                  {CATEGORY_CONFIG[endpoint.category]?.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {endpoint.description}
              </p>
            </div>

            {/* Expand/Collapse */}
            <div className="shrink-0 flex items-center gap-1 text-muted-foreground">
              <span className="text-[10px] hidden sm:inline">{expanded ? 'طي' : 'توسيع'}</span>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="size-4" />
              </motion.div>
            </div>
          </button>

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                className="overflow-hidden"
              >
                <div className="border-t border-border/30 px-4 py-4 space-y-4 bg-muted/10">
                  {/* Code blocks in 2-column grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CodeBlock code={endpoint.requestExample} label="طلب (Request)" />
                    <CodeBlock code={endpoint.responseExample} label="استجابة (Response)" />
                  </div>

                  {/* Try Now Button */}
                  <div className="flex items-center justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
                      onClick={() => {
                        toast.info(`تم فتح محرر الطلبات لـ ${endpoint.method} ${endpoint.path}`);
                      }}
                    >
                      <Play className="size-3" />
                      جرب الآن
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}


export function ApiDocsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesCategory = activeCategory === 'all' || ep.category === activeCategory;
      const matchesSearch =
        search.trim() === '' ||
        ep.path.toLowerCase().includes(search.toLowerCase()) ||
        ep.description.includes(search) ||
        ep.method.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: endpoints.length };
    for (const ep of endpoints) {
      counts[ep.category] = (counts[ep.category] || 0) + 1;
    }
    return counts;
  }, []);

  const handleExpandAll = useCallback(() => {
    
    setSearch('');
    setActiveCategory('all');
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ─── Hero Section ─────────────────────── */}
      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 via-card/80 to-blue-500/5 backdrop-blur-xl p-6 md:p-8"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 shadow-lg shadow-primary/10">
            <BookOpen className="size-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              توثيق API
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              واجهة برمجة التطبيقات RESTful الخاصة بمنصة استضافة الذئب.
              استخدم هذه الوثائق للتفاعل مع جميع نقاط النهاية المتاحة لإدارة البوتات والملفات والمستخدمين.
            </p>
          </div>

          {/* Endpoint count badge */}
          <div className="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-background/40 border border-white/5">
            <span className="text-2xl font-bold text-primary">{endpoints.length}</span>
            <span className="text-[10px] text-muted-foreground">نقطة نهاية</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Authentication Info ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' as const }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Auth Header */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
                <Shield className="size-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">المصادقة</h3>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                جميع نقاط النهاية المحمية تتطلب إرسال رمز المصادقة في ترويسة الطلب:
              </p>
              <div className="group/code relative">
                <CopyButton text="Authorization: Bearer YOUR_API_KEY" />
                <div className="rounded-lg border border-border/50 bg-black/40 p-2.5 overflow-x-auto">
                  <code className="font-mono text-xs text-blue-400/90" dir="ltr">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15">
                <Zap className="size-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold">حدود الطلبات</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">الحد الأقصى للطلبات</span>
                <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  100 طلب / دقيقة
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">الحد الأقصى للملفات</span>
                <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30 bg-blue-500/10">
                  50 ميجا / طلب
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">الحد الأقصى للسجلات</span>
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30 bg-amber-500/10">
                  1000 سجل / طلب
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">نافذة إعادة التعيين</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  كل 60 ثانية
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Search & Filter Bar ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' as const }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في نقاط النهاية..."
            className="pr-10 bg-card/60 border-border/50 backdrop-blur-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <span>عرض</span>
          <Badge variant="secondary" className="text-xs">
            {filteredEndpoints.length}
          </Badge>
          <span>من {endpoints.length}</span>
        </div>
      </motion.div>

      {/* ─── Category Tabs ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' as const }}
      >
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as Category)}
          className="w-full"
        >
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
            {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent rounded-lg px-3 py-2 text-xs gap-1.5 transition-all"
              >
                {CATEGORY_CONFIG[cat].icon}
                <span>{CATEGORY_CONFIG[cat].label}</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 ml-0.5 opacity-60">
                  {categoryCounts[cat] || 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* ─── Endpoint Cards List ──────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`${activeCategory}-${search}`}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredEndpoints.length > 0 ? (
            filteredEndpoints.map((ep, idx) => (
              <EndpointCard
                key={`${ep.method}-${ep.path}`}
                endpoint={ep}
                index={idx}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                <Search className="size-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                لا توجد نتائج
              </h3>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
                لم يتم العثور على نقاط نهاية تطابق البحث أو الفلتر المحدد
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs gap-1.5"
                onClick={handleExpandAll}
              >
                <AlertTriangle className="size-3" />
                مسح الفلاتر
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Quick Reference Footer ───────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' as const }}
      >
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              مرجع سريع — أكواد الحالات
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[
                { code: '200', label: 'نجاح', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
                { code: '201', label: 'تم الإنشاء', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
                { code: '400', label: 'طلب غير صالح', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
                { code: '401', label: 'غير مصادق', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
                { code: '403', label: 'ممنوع الوصول', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
                { code: '404', label: 'غير موجود', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
                { code: '429', label: 'طلبات كثيرة', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
                { code: '500', label: 'خطأ داخلي', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
              ].map((status) => (
                <div
                  key={status.code}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${status.color}`}
                >
                  <code className="font-mono text-xs font-bold">{status.code}</code>
                  <span className="text-[11px]">{status.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default ApiDocsPage;
