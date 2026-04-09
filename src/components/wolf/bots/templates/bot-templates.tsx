'use client';

import { useState, useMemo } from 'react';
import {
  Bot,
  Code,
  Star,
  Clock,
  Users,
  Zap,
  Shield,
  Search,
  MessageSquare,
  Megaphone,
  Reply,
  FileUp,
  BarChart3,
  Bell,
  ChevronLeft,
  Sparkles,
  Package,
  ArrowLeft,
  LayoutGrid,
  Filter,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { CreateBotDialog } from '../create-bot-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* ─── Types ──────────────────────────────────────────────── */

type Difficulty = 1 | 2 | 3 | 4 | 5;
type Language = 'python' | 'php';
type Category = 'beginner' | 'advanced';

interface BotTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  language: Language;
  difficulty: Difficulty;
  category: Category;
  features: string[];
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  accentColor: string;
}

/* ─── Templates Data ─────────────────────────────────────── */

const templates: BotTemplate[] = [
  {
    id: 'echo-bot',
    name: 'بوت الصدى الأساسي',
    description:
      'بوت بسيط يعيد إرسال الرسائل المستلمة. مثالي للمبتدئين لفهم كيفية عمل بوتات تيليجرام والتعلم على أساسيات المعالجة.',
    icon: <MessageSquare className="h-6 w-6" />,
    language: 'python',
    difficulty: 1,
    category: 'beginner',
    features: ['أوامر أساسية', 'رد الرسائل', 'ترحيب مخصص', 'سجل بسيط'],
    gradientFrom: 'from-emerald-600/20',
    gradientTo: 'to-teal-700/5',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-400',
  },
  {
    id: 'channel-manager',
    name: 'مدير القنوات',
    description:
      'بوت متقدم لإدارة قنوات تيليجرام. يدعم جدولة المنشورات، تحليل المشاهدات، وإدارة الصلاحيات والأعضاء.',
    icon: <Megaphone className="h-6 w-6" />,
    language: 'python',
    difficulty: 4,
    category: 'advanced',
    features: ['جدولة المنشورات', 'تحليل المشاهدات', 'إدارة الصلاحيات', 'إحصائيات متقدمة', 'تصفية المحتوى'],
    gradientFrom: 'from-violet-600/20',
    gradientTo: 'to-purple-700/5',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    accentColor: 'text-violet-400',
  },
  {
    id: 'auto-responder',
    name: 'بوت الردود التلقائية',
    description:
      'بوت ذكي يرد تلقائياً على الرسائل حسب الكلمات المفتاحية. يدعم أنماط متعددة وردود عشوائية مخصصة.',
    icon: <Reply className="h-6 w-6" />,
    language: 'python',
    difficulty: 2,
    category: 'beginner',
    features: ['ردود تلقائية', 'كلمات مفتاحية', 'أنماط متعددة', 'ردود عشوائية'],
    gradientFrom: 'from-sky-600/20',
    gradientTo: 'to-cyan-700/5',
    iconBg: 'bg-gradient-to-br from-sky-500 to-cyan-600',
    accentColor: 'text-sky-400',
  },
  {
    id: 'file-sharing',
    name: 'بوت مشاركة الملفات',
    description:
      'بوت لرفع وتخزين ومشاركة الملفات مع إمكانية البحث المتقدم. يدعم إنشاء مجلدات وتنظيم المحتوى.',
    icon: <FileUp className="h-6 w-6" />,
    language: 'python',
    difficulty: 3,
    category: 'beginner',
    features: ['رفع الملفات', 'تنظيم المجلدات', 'بحث متقدم', 'روابط مشاركة', 'حد التخزين'],
    gradientFrom: 'from-rose-600/20',
    gradientTo: 'to-pink-700/5',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    accentColor: 'text-rose-400',
  },
  {
    id: 'poll-bot',
    name: 'بوت التصويتات والاستطلاعات',
    description:
      'بوت لإنشاء تصويتات واستطلاعات تفاعلية متعددة الخيارات. يدعم التصويت المجهول وعرض النتائج الفورية.',
    icon: <BarChart3 className="h-6 w-6" />,
    language: 'php',
    difficulty: 3,
    category: 'advanced',
    features: ['تصويتات متعددة', 'خيارات مخصصة', 'نتائج فورية', 'تصويت مجهول', 'تصدير البيانات'],
    gradientFrom: 'from-amber-600/20',
    gradientTo: 'to-orange-700/5',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    accentColor: 'text-amber-400',
  },
  {
    id: 'reminder-bot',
    name: 'بوت التذكيرات',
    description:
      'بوت لجدولة التذكيرات والمهام. يدعم التكرار الدوري والإشعارات المخصصة مع إدارة المهام اليومية.',
    icon: <Bell className="h-6 w-6" />,
    language: 'php',
    difficulty: 2,
    category: 'beginner',
    features: ['تذكيرات مجدولة', 'تكرار دوري', 'إشعارات مخصصة', 'قوائم المهام', 'مناطق زمنية'],
    gradientFrom: 'from-teal-600/20',
    gradientTo: 'to-emerald-700/5',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    accentColor: 'text-teal-400',
  },
  {
    id: 'welcome-bot',
    name: 'بوت الترحيب والحماية',
    description:
      'بوت شامل للترحيب بالأعضاء الجدد وحماية المجموعات من السبام. يتضمن نظام تحقق ورسائل ترحيب مخصصة.',
    icon: <Shield className="h-6 w-6" />,
    language: 'python',
    difficulty: 5,
    category: 'advanced',
    features: ['ترحيب مخصص', 'حماية من السبام', 'نظام تحقق', 'تحذيرات وطرد', 'رسائل مغادرة'],
    gradientFrom: 'from-red-600/20',
    gradientTo: 'to-rose-700/5',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    accentColor: 'text-red-400',
  },
  {
    id: 'store-bot',
    name: 'بوت المتجر الإلكتروني',
    description:
      'بوت لعرض المنتجات وإدارة الطلبات مع سلة تسوق مبسطة. يدعم عرض المنتجات وإنشاء الطلبات.',
    icon: <Package className="h-6 w-6" />,
    language: 'php',
    difficulty: 4,
    category: 'advanced',
    features: ['عرض المنتجات', 'سلة تسوق', 'إدارة الطلبات', 'إشعارات حالة الطلب'],
    gradientFrom: 'from-orange-600/20',
    gradientTo: 'to-amber-700/5',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    accentColor: 'text-orange-400',
  },
];

/* ─── Sub-components ─────────────────────────────────────── */

function DifficultyStars({ level }: { level: Difficulty }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < level
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function DifficultyLabel({ level }: { level: Difficulty }) {
  const labels: Record<Difficulty, string> = {
    1: 'مبتدئ',
    2: 'سهل',
    3: 'متوسط',
    4: 'متقدم',
    5: 'خبير',
  };
  const colors: Record<Difficulty, string> = {
    1: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    2: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    3: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    4: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    5: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 h-5 font-medium ${colors[level]}`}
    >
      {labels[level]}
    </Badge>
  );
}

function LanguageBadge({ language }: { language: Language }) {
  if (language === 'python') {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-[10px] px-1.5 py-0 h-5 bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
      >
        <Code className="h-2.5 w-2.5" />
        Python
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] px-1.5 py-0 h-5 bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
    >
      <Code className="h-2.5 w-2.5" />
      PHP
    </Badge>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  return category === 'beginner' ? (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] px-1.5 py-0 h-5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    >
      <Sparkles className="h-2.5 w-2.5" />
      للمبتدئين
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] px-1.5 py-0 h-5 bg-orange-500/10 text-orange-400 border-orange-500/30"
    >
      <Zap className="h-2.5 w-2.5" />
      متقدم
    </Badge>
  );
}

/* ─── Animation Variants ─────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 20,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

/* ─── Filter Tabs Config ─────────────────────────────────── */

type FilterTab = 'all' | 'python' | 'php' | 'beginner' | 'advanced';

const filterTabs: { value: FilterTab; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'الكل', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: 'python', label: 'Python', icon: <Code className="h-3.5 w-3.5" /> },
  { value: 'php', label: 'PHP', icon: <Code className="h-3.5 w-3.5" /> },
  { value: 'beginner', label: 'للمبتدئين', icon: <Star className="h-3.5 w-3.5" /> },
  { value: 'advanced', label: 'متقدم', icon: <Zap className="h-3.5 w-3.5" /> },
];

/* ─── Main Component ─────────────────────────────────────── */

export default function BotTemplates() {
  const { setCurrentPage } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);

  /* ── Filtering Logic ── */

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Filter by search query
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        template.name.toLowerCase().includes(q) ||
        template.description.toLowerCase().includes(q) ||
        template.features.some((f) => f.toLowerCase().includes(q));

      // Filter by active tab
      let matchesFilter = true;
      switch (activeFilter) {
        case 'python':
          matchesFilter = template.language === 'python';
          break;
        case 'php':
          matchesFilter = template.language === 'php';
          break;
        case 'beginner':
          matchesFilter = template.category === 'beginner';
          break;
        case 'advanced':
          matchesFilter = template.category === 'advanced';
          break;
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  /* ── Handlers ── */

  const handleUseTemplate = (template: BotTemplate) => {
    toast.success(`تم اختيار قالب "${template.name}"`, {
      description: 'جاري فتح نافذة إنشاء البوت...',
    });
    setSelectedTemplate(template);
    setCreateDialogOpen(true);
  };

  const handleCreated = () => {
    setCreateDialogOpen(false);
    setSelectedTemplate(null);
    setCurrentPage('bots');
    toast.success('تم إنشاء البوت بنجاح! يمكنك الآن إدارته.');
  };

  const stats = useMemo(() => {
    const total = templates.length;
    const pythonCount = templates.filter((t) => t.language === 'python').length;
    const phpCount = templates.filter((t) => t.language === 'php').length;
    const beginnerCount = templates.filter((t) => t.category === 'beginner').length;
    const advancedCount = templates.filter((t) => t.category === 'advanced').length;
    return { total, pythonCount, phpCount, beginnerCount, advancedCount };
  }, []);

  /* ── Render ── */

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border/50"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-transparent to-orange-600/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-8">
          {/* Back button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage('bots')}
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للبوتات
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Hero icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-l from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  قوالب البوتات
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
                  اختر قالباً جاهزاً وابدأ بناء بوتك بسرعة
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border/30">
                <Package className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium">{stats.total}</span>
                <span className="text-xs text-muted-foreground">قالب</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border/30">
                <Code className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">{stats.pythonCount + stats.phpCount}</span>
                <span className="text-xs text-muted-foreground">لغة</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Search & Filters ── */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="ابحث في القوالب... بالاسم، الوصف، أو الميزة"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/60 border-border/50 focus:border-amber-500/50 pr-10 pl-10 h-11 text-sm rounded-xl backdrop-blur-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <Tabs
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as FilterTab)}
        >
          <TabsList className="bg-muted/40 border border-border/30 rounded-xl p-1 gap-1 overflow-x-auto w-full sm:w-auto">
            {filterTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-gradient-to-l data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/10 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/20 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:shadow-amber-500/5 whitespace-nowrap"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* ── Templates Grid ── */}
      <AnimatePresence mode="wait">
        {filteredTemplates.length > 0 ? (
          <motion.div
            key={`${activeFilter}-${searchQuery}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {filteredTemplates.map((template) => (
              <motion.div key={template.id} variants={cardVariants} layout>
                <Card className="group relative overflow-hidden border-border/50 bg-card/40 hover:border-border/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/10 h-full flex flex-col">
                  {/* Card gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${template.gradientFrom} ${template.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />

                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent" />
                  </div>

                  <CardContent className="relative p-5 sm:p-6 flex flex-col flex-1 gap-4">
                    {/* Top row: icon + badges */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Gradient icon container */}
                      <div
                        className={`w-12 h-12 rounded-xl ${template.iconBg} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                      >
                        {template.icon}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <LanguageBadge language={template.language} />
                        <CategoryBadge category={template.category} />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-lg leading-tight">
                          {template.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    {/* Difficulty */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DifficultyStars level={template.difficulty} />
                        <DifficultyLabel level={template.difficulty} />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                        <Clock className="h-3 w-3" />
                        {template.difficulty <= 2
                          ? 'أقل من ساعة'
                          : template.difficulty <= 4
                          ? '2-4 ساعات'
                          : 'يوم كامل'}
                      </div>
                    </div>

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {template.features.map((feature) => (
                        <span
                          key={feature}
                          className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border ${template.accentColor.replace('text-', 'text-').replace('-400', '-400/80')} bg-muted/30 border-border/30`}
                        >
                          <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full gap-2 h-10 rounded-xl font-medium bg-gradient-to-l from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 group-hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Sparkles className="h-4 w-4" />
                      استخدام القالب
                      <ChevronLeft className="h-3.5 w-3.5 mr-auto opacity-60 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* ── Empty State ── */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted/30 border border-border/30 flex items-center justify-center mb-5">
              <Filter className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا توجد قوالب مطابقة</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              {searchQuery
                ? `لم يتم العثور على نتائج لـ "${searchQuery}". جرب كلمات بحث مختلفة.`
                : 'لا توجد قوالب في هذا التصنيف حالياً. جرب تصنيفاً آخر.'}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="gap-2 rounded-xl border-border/50 hover:bg-accent"
            >
              <Sparkles className="h-4 w-4" />
              عرض جميع القوالب
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Info Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="rounded-xl border border-border/30 bg-gradient-to-br from-muted/20 to-muted/5 p-4 sm:p-5"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Heart className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-0.5">نصيحة سريعة</h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              عند اختيار قالب، سيتم فتح نافذة إنشاء البوت مع إعدادات القالب. يمكنك تعديل الاسم
              والوصف ولغة البرمجة حسب حاجتك قبل الإنشاء النهائي.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 shrink-0">
            <Users className="h-3.5 w-3.5" />
            <span>{stats.total} قالب متاح</span>
          </div>
        </div>
      </motion.div>

      {/* ── Create Bot Dialog (opened when using a template) ── */}
      <CreateBotDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setSelectedTemplate(null);
        }}
        onCreated={handleCreated}
      />
    </div>
  );
}
