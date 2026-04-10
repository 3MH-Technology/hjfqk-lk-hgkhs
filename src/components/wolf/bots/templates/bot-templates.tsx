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
  ChevronDown,
  Sparkles,
  Package,
  ArrowLeft,
  LayoutGrid,
  Filter,
  Heart,
  FolderTree,
  Eye,
  Rocket,
  Crown,
  Check,
  FileCode2,
  Database,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { CreateBotDialog } from '../create-bot-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

/* ─── Types ──────────────────────────────────────────────── */

type Difficulty = 1 | 2 | 3 | 4 | 5;
type Language = 'python' | 'php';
type Category = 'beginner' | 'advanced' | 'admin' | 'ecommerce' | 'games' | 'utilities';

interface BotTemplate {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  language: Language;
  difficulty: Difficulty;
  category: Category;
  features: string[];
  requirements: string[];
  fileStructure: string[];
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  accentColor: string;
  deployCount: number;
  isFeatured?: boolean;
}

/* ─── Templates Data ─────────────────────────────────────── */

const templates: BotTemplate[] = [
  {
    id: 'echo-bot',
    name: 'بوت الصدى الأساسي',
    description:
      'بوت بسيط يعيد إرسال الرسائل المستلمة. مثالي للمبتدئين لفهم كيفية عمل بوتات تيليجرام والتعلم على أساسيات المعالجة.',
    longDescription:
      'بوت الصدى الأساسي هو نقطة البداية المثالية للمبتدئين في عالم بوتات تيليجرام. يقوم بإعادة إرسال الرسائل المستلمة مع إمكانية تخصيص الردود. يتضمن نظام أوامر أساسي وسجل تفصيلي للعمليات.',
    icon: <MessageSquare className="h-6 w-6" />,
    language: 'python',
    difficulty: 1,
    category: 'utilities',
    features: ['أوامر أساسية', 'رد الرسائل', 'ترحيب مخصص', 'سجل بسيط'],
    requirements: ['Python 3.8+', 'python-telegram-bot', 'SQLite'],
    fileStructure: ['main.py', 'config.py', 'handlers/', 'utils/', 'requirements.txt'],
    gradientFrom: 'from-emerald-600/20',
    gradientTo: 'to-teal-700/5',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-400',
    deployCount: 2840,
  },
  {
    id: 'channel-manager',
    name: 'مدير القنوات',
    description:
      'بوت متقدم لإدارة قنوات تيليجرام. يدعم جدولة المنشورات، تحليل المشاهدات، وإدارة الصلاحيات والأعضاء.',
    longDescription:
      'بوت مدير القنوات هو أداة شاملة لإدارة قنوات تيليجرام بكل سهولة. يدعم جدولة المنشورات وتحليل المشاهدات وإدارة الصلاحيات. يحتوي على لوحة تحكم متقدمة وإحصائيات تفصيلية.',
    icon: <Megaphone className="h-6 w-6" />,
    language: 'python',
    difficulty: 4,
    category: 'admin',
    features: ['جدولة المنشورات', 'تحليل المشاهدات', 'إدارة الصلاحيات', 'إحصائيات متقدمة', 'تصفية المحتوى'],
    requirements: ['Python 3.9+', 'python-telegram-bot', 'APScheduler', 'SQLite'],
    fileStructure: ['main.py', 'config.py', 'scheduler/', 'analytics/', 'models/', 'requirements.txt'],
    gradientFrom: 'from-violet-600/20',
    gradientTo: 'to-purple-700/5',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    accentColor: 'text-violet-400',
    deployCount: 1560,
  },
  {
    id: 'auto-responder',
    name: 'بوت الردود التلقائية',
    description:
      'بوت ذكي يرد تلقائياً على الرسائل حسب الكلمات المفتاحية. يدعم أنماط متعددة وردود عشوائية مخصصة.',
    longDescription:
      'بوت الردود التلقائية يعمل بنظام ذكي للتعرف على الكلمات المفتاحية والرد عليها. يدعم أنماط متعددة من الردود ويمكن تخصيصه بالكامل من خلال واجهة إدارة سهلة.',
    icon: <Reply className="h-6 w-6" />,
    language: 'python',
    difficulty: 2,
    category: 'utilities',
    features: ['ردود تلقائية', 'كلمات مفتاحية', 'أنماط متعددة', 'ردود عشوائية'],
    requirements: ['Python 3.8+', 'python-telegram-bot', 'SQLite'],
    fileStructure: ['main.py', 'config.py', 'responses.json', 'handlers/', 'requirements.txt'],
    gradientFrom: 'from-sky-600/20',
    gradientTo: 'to-cyan-700/5',
    iconBg: 'bg-gradient-to-br from-sky-500 to-cyan-600',
    accentColor: 'text-sky-400',
    deployCount: 3200,
    isFeatured: true,
  },
  {
    id: 'file-sharing',
    name: 'بوت مشاركة الملفات',
    description:
      'بوت لرفع وتخزين ومشاركة الملفات مع إمكانية البحث المتقدم. يدعم إنشاء مجلدات وتنظيم المحتوى.',
    longDescription:
      'بوت مشاركة الملفات يوفر نظام تخزين سحابي مبسط داخل تيليجرام. يدعم رفع وتخزين و مشاركة الملفات مع إمكانية البحث المتقدم والتنظيم عبر المجلدات.',
    icon: <FileUp className="h-6 w-6" />,
    language: 'python',
    difficulty: 3,
    category: 'utilities',
    features: ['رفع الملفات', 'تنظيم المجلدات', 'بحث متقدم', 'روابط مشاركة', 'حد التخزين'],
    requirements: ['Python 3.9+', 'python-telegram-bot', 'SQLite', 'aiofiles'],
    fileStructure: ['main.py', 'config.py', 'storage/', 'handlers/', 'utils/', 'requirements.txt'],
    gradientFrom: 'from-rose-600/20',
    gradientTo: 'to-pink-700/5',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    accentColor: 'text-rose-400',
    deployCount: 1890,
  },
  {
    id: 'poll-bot',
    name: 'بوت التصويتات والاستطلاعات',
    description:
      'بوت لإنشاء تصويتات واستطلاعات تفاعلية متعددة الخيارات. يدعم التصويت المجهول وعرض النتائج الفورية.',
    longDescription:
      'بوت التصويتات يتيح إنشاء استطلاعات رأي تفاعلية بسهولة. يدعم خيارات متعددة والتصويت المجهول مع عرض النتائج في الوقت الفوري مع رسوم بيانية.',
    icon: <BarChart3 className="h-6 w-6" />,
    language: 'php',
    difficulty: 3,
    category: 'utilities',
    features: ['تصويتات متعددة', 'خيارات مخصصة', 'نتائج فورية', 'تصويت مجهول', 'تصدير البيانات'],
    requirements: ['PHP 8.0+', 'Telegram Bot API SDK', 'MySQL/SQLite'],
    fileStructure: ['index.php', 'config.php', 'models/', 'controllers/', 'views/', 'composer.json'],
    gradientFrom: 'from-blue-600/20',
    gradientTo: 'to-sky-700/5',
    iconBg: 'bg-gradient-to-br from-blue-500 to-sky-600',
    accentColor: 'text-blue-400',
    deployCount: 980,
  },
  {
    id: 'reminder-bot',
    name: 'بوت التذكيرات',
    description:
      'بوت لجدولة التذكيرات والمهام. يدعم التكرار الدوري والإشعارات المخصصة مع إدارة المهام اليومية.',
    longDescription:
      'بوت التذكيرات يساعد في تنظيم المهام اليومية عبر جدولة تذكيرات ذكية. يدعم التكرار الدوري والإشعارات المخصصة مع دعم المناطق الزمنية المختلفة.',
    icon: <Bell className="h-6 w-6" />,
    language: 'php',
    difficulty: 2,
    category: 'utilities',
    features: ['تذكيرات مجدولة', 'تكرار دوري', 'إشعارات مخصصة', 'قوائم المهام', 'مناطق زمنية'],
    requirements: ['PHP 8.0+', 'Telegram Bot API SDK', 'SQLite'],
    fileStructure: ['index.php', 'config.php', 'models/', 'scheduler/', 'composer.json'],
    gradientFrom: 'from-teal-600/20',
    gradientTo: 'to-emerald-700/5',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    accentColor: 'text-teal-400',
    deployCount: 1450,
  },
  {
    id: 'welcome-bot',
    name: 'بوت الترحيب والحماية',
    description:
      'بوت شامل للترحيب بالأعضاء الجدد وحماية المجموعات من السبام. يتضمن نظام تحقق ورسائل ترحيب مخصصة.',
    longDescription:
      'بوت الترحيب والحماية هو حارس مجموعاتك. يرحب بالأعضاء الجدد بأساليب مخصصة ويحمي المجموعة من السبام والرسائل غير المرغوبة مع نظام تحقق متقدم.',
    icon: <Shield className="h-6 w-6" />,
    language: 'python',
    difficulty: 5,
    category: 'admin',
    features: ['ترحيب مخصص', 'حماية من السبام', 'نظام تحقق', 'تحذيرات وطرد', 'رسائل مغادرة'],
    requirements: ['Python 3.9+', 'python-telegram-bot', 'SQLite', 'Pillow'],
    fileStructure: ['main.py', 'config.py', 'guards/', 'handlers/', 'templates/', 'requirements.txt'],
    gradientFrom: 'from-red-600/20',
    gradientTo: 'to-rose-700/5',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    accentColor: 'text-red-400',
    deployCount: 2680,
  },
  {
    id: 'store-bot',
    name: 'بوت المتجر الإلكتروني',
    description:
      'بوت لعرض المنتجات وإدارة الطلبات مع سلة تسوق مبسطة. يدعم عرض المنتجات وإنشاء الطلبات.',
    longDescription:
      'بوت المتجر يحول تيليجرام إلى متجر إلكتروني متكامل. يدعم عرض المنتجات وإدارة الطلبات مع سلة تسوق وإشعارات حالة الطلب.',
    icon: <Package className="h-6 w-6" />,
    language: 'php',
    difficulty: 4,
    category: 'ecommerce',
    features: ['عرض المنتجات', 'سلة تسوق', 'إدارة الطلبات', 'إشعارات حالة الطلب'],
    requirements: ['PHP 8.1+', 'Telegram Bot API SDK', 'MySQL/SQLite', 'Stripe SDK'],
    fileStructure: ['index.php', 'config.php', 'models/', 'controllers/', 'views/', 'payments/', 'composer.json'],
    gradientFrom: 'from-sky-600/20',
    gradientTo: 'to-blue-700/5',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    accentColor: 'text-sky-400',
    deployCount: 1120,
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
              ? 'fill-blue-400 text-blue-400'
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
    3: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
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
        className="gap-1 text-[10px] px-1.5 py-0 h-5 bg-blue-500/10 text-blue-400 border-blue-500/30"
      >
        <Code className="h-2.5 w-2.5" />
        Python
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] px-1.5 py-0 h-5 bg-sky-500/10 text-sky-400 border-sky-500/30"
    >
      <Code className="h-2.5 w-2.5" />
      PHP
    </Badge>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const categoryMap: Record<Category, { label: string; className: string; icon: React.ReactNode }> = {
    beginner: {
      label: 'للمبتدئين',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: <Sparkles className="h-2.5 w-2.5" />,
    },
    advanced: {
      label: 'متقدم',
      className: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      icon: <Zap className="h-2.5 w-2.5" />,
    },
    admin: {
      label: 'إدارة',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: <Shield className="h-2.5 w-2.5" />,
    },
    ecommerce: {
      label: 'تجارة إلكترونية',
      className: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      icon: <Globe className="h-2.5 w-2.5" />,
    },
    games: {
      label: 'ألعاب',
      className: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      icon: <Zap className="h-2.5 w-2.5" />,
    },
    utilities: {
      label: 'أدوات',
      className: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      icon: <Sparkles className="h-2.5 w-2.5" />,
    },
  };
  const cfg = categoryMap[category];
  return (
    <Badge
      variant="outline"
      className={`gap-1 text-[10px] px-1.5 py-0 h-5 ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

function DeployCountBadge({ count }: { count: number }) {
  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
      <Rocket className="h-2.5 w-2.5" />
      {formatted} نشر
    </span>
  );
}

/* ─── Animation Variants ─────────────────────────────────── */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const featuredVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const expandVariants: Variants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

const expandItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/* ─── Filter Tabs Config ─────────────────────────────────── */

type FilterTab = 'all' | 'python' | 'php' | 'beginner' | 'advanced' | 'admin' | 'ecommerce' | 'games' | 'utilities';

const languageFilterTabs: { value: FilterTab; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'الكل', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: 'python', label: 'Python', icon: <Code className="h-3.5 w-3.5" /> },
  { value: 'php', label: 'PHP', icon: <Code className="h-3.5 w-3.5" /> },
];

const categoryFilterTabs: { value: FilterTab; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'الكل', icon: <LayoutGrid className="h-3 w-3" /> },
  { value: 'admin', label: 'إدارة', icon: <Shield className="h-3 w-3" /> },
  { value: 'ecommerce', label: 'تجارة', icon: <Globe className="h-3 w-3" /> },
  { value: 'games', label: 'ألعاب', icon: <Zap className="h-3 w-3" /> },
  { value: 'utilities', label: 'أدوات', icon: <Sparkles className="h-3 w-3" /> },
];

/* ─── Template Detail Expansion ──────────────────────────── */

function TemplateDetailExpansion({ template }: { template: BotTemplate }) {
  return (
    <motion.div
      variants={expandVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="overflow-hidden"
    >
      <div className="border-t border-border/30 pt-4 mt-1 space-y-4">
        {/* Long Description */}
        <motion.div variants={expandItemVariants}>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {template.longDescription}
          </p>
        </motion.div>

        {/* Requirements */}
        <motion.div variants={expandItemVariants}>
          <h4 className="text-xs font-semibold text-foreground/80 mb-2 flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-blue-400" />
            المتطلبات
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {template.requirements.map((req) => (
              <Badge
                key={req}
                variant="outline"
                className="text-[10px] px-2 py-0.5 bg-blue-500/5 text-blue-300/80 border-blue-500/20"
              >
                {req}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* File Structure */}
        <motion.div variants={expandItemVariants}>
          <h4 className="text-xs font-semibold text-foreground/80 mb-2 flex items-center gap-2">
            <FolderTree className="h-3.5 w-3.5 text-blue-400" />
            هيكل الملفات
          </h4>
          <div className="bg-black/30 rounded-lg p-3 border border-border/20">
            <div className="space-y-1 font-mono text-xs text-muted-foreground/80">
              {template.fileStructure.map((file, idx) => (
                <div key={file} className="flex items-center gap-2" style={{ animationDelay: `${idx * 50}ms` }}>
                  <span className="text-blue-400/50">{file.includes('/') ? '📁' : '📄'}</span>
                  <span>{file}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div variants={expandItemVariants}>
          <h4 className="text-xs font-semibold text-foreground/80 mb-2 flex items-center gap-2">
            <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
            الميزات
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {template.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={expandItemVariants} className="flex gap-2 pt-1">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button className="w-full gap-2 h-10 rounded-xl font-medium bg-gradient-to-l from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600 shadow-md shadow-blue-500/20">
              <Rocket className="h-4 w-4" />
              نشر القالب
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="gap-2 h-10 rounded-xl border-border/50 hover:bg-accent"
            >
              <Eye className="h-4 w-4" />
              معاينة
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Featured Template Card ─────────────────────────────── */

function FeaturedTemplateCard({
  template,
  onUse,
}: {
  template: BotTemplate;
  onUse: (t: BotTemplate) => void;
}) {
  return (
    <motion.div variants={featuredVariants} className="mb-8">
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card/60 to-card/40 backdrop-blur-sm">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* Featured badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/25 rounded-full px-3 py-1">
                <Crown className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">الأكثر استخداماً</span>
              </div>
              <DeployCountBadge count={template.deployCount} />
            </div>
            <LanguageBadge language={template.language} />
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Template icon */}
            <div className="shrink-0">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${template.iconBg} flex items-center justify-center text-white shadow-lg shadow-blue-500/20`}>
                {template.icon}
              </div>
            </div>

            {/* Template info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {template.name}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                {template.description}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <DifficultyStars level={template.difficulty} />
                  <DifficultyLabel level={template.difficulty} />
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  {template.difficulty <= 2
                    ? 'أقل من ساعة'
                    : template.difficulty <= 4
                    ? '2-4 ساعات'
                    : 'يوم كامل'}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex sm:flex-col items-center justify-center gap-3 shrink-0">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => onUse(template)}
                  className="gap-2 h-11 px-6 rounded-xl font-semibold bg-gradient-to-l from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600 shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="h-4 w-4" />
                  نشر القالب
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {template.features.slice(0, 3).map((f) => (
                  <Badge
                    key={f}
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 bg-muted/30 border-border/30 text-foreground/70"
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export default function BotTemplates() {
  const { setCurrentPage } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<FilterTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterTab>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── Filtering Logic ── */

  const featuredTemplate = useMemo(() => {
    return templates.find((t) => t.isFeatured);
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Filter by search query
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        template.name.toLowerCase().includes(q) ||
        template.description.toLowerCase().includes(q) ||
        template.features.some((f) => f.toLowerCase().includes(q));

      // Filter by language
      let matchesLanguage = true;
      switch (languageFilter) {
        case 'python':
          matchesLanguage = template.language === 'python';
          break;
        case 'php':
          matchesLanguage = template.language === 'php';
          break;
      }

      // Filter by category
      let matchesCategory = true;
      switch (categoryFilter) {
        case 'admin':
          matchesCategory = template.category === 'admin';
          break;
        case 'ecommerce':
          matchesCategory = template.category === 'ecommerce';
          break;
        case 'games':
          matchesCategory = template.category === 'games';
          break;
        case 'utilities':
          matchesCategory = template.category === 'utilities';
          break;
      }

      return matchesSearch && matchesLanguage && matchesCategory;
    });
  }, [searchQuery, languageFilter, categoryFilter]);

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

  const handleCardClick = (template: BotTemplate) => {
    if (expandedId === template.id) {
      setExpandedId(null);
    } else {
      setExpandedId(template.id);
    }
  };

  const stats = useMemo(() => {
    const total = templates.length;
    const pythonCount = templates.filter((t) => t.language === 'python').length;
    const phpCount = templates.filter((t) => t.language === 'php').length;
    const featuredCount = templates.filter((t) => t.isFeatured).length;
    return { total, pythonCount, phpCount, featuredCount };
  }, []);

  const hasActiveFilters = languageFilter !== 'all' || categoryFilter !== 'all' || searchQuery.trim() !== '';

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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-sky-600/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-500/5 rounded-full blur-3xl" />

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
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-l from-blue-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  قوالب البوتات
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
                  اختر قالباً جاهزاً وابدأ بناء بوتك بسرعة
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border/30 backdrop-blur-sm">
                <Package className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">{stats.total}</span>
                <span className="text-xs text-muted-foreground">قالب</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border/30 backdrop-blur-sm">
                <Code className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">{stats.pythonCount + stats.phpCount}</span>
                <span className="text-xs text-muted-foreground">لغة</span>
              </div>
              {filteredTemplates.length !== stats.total && (
                <div className="flex items-center gap-2 bg-blue-500/10 rounded-xl px-3 py-2 border border-blue-500/20 backdrop-blur-sm">
                  <Search className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">{filteredTemplates.length}</span>
                  <span className="text-xs text-blue-400/70">نتيجة</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Featured Template ── */}
      {featuredTemplate && !hasActiveFilters && (
        <FeaturedTemplateCard template={featuredTemplate} onUse={handleUseTemplate} />
      )}

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
            className="w-full bg-card/60 border-border/50 focus:border-blue-500/50 pr-10 pl-10 h-11 text-sm rounded-xl backdrop-blur-sm"
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

        {/* Language filter pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Code className="h-3.5 w-3.5" />
            <span>اللغة</span>
          </div>
          <div className="relative">
            <div className="flex gap-2 flex-wrap">
              {languageFilterTabs.map((tab) => (
                <motion.button
                  key={tab.value}
                  onClick={() => setLanguageFilter(tab.value)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300 border
                    ${
                      languageFilter === tab.value
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/10'
                        : 'bg-card/40 text-muted-foreground border-border/30 hover:border-blue-500/20 hover:text-foreground backdrop-blur-sm'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {languageFilter === tab.value && (
                    <motion.div
                      layoutId="language-active-indicator"
                      className="absolute inset-0 rounded-xl bg-blue-500/10 border border-blue-500/30 -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>التصنيف</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categoryFilterTabs.map((tab) => (
              <motion.button
                key={tab.value}
                onClick={() => setCategoryFilter(tab.value)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300 border
                  ${
                    categoryFilter === tab.value
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/10'
                      : 'bg-card/40 text-muted-foreground border-border/30 hover:border-blue-500/20 hover:text-foreground backdrop-blur-sm'
                  }`}
              >
                {tab.icon}
                {tab.label}
                {categoryFilter === tab.value && (
                  <motion.div
                    layoutId="category-active-indicator"
                    className="absolute inset-0 rounded-xl bg-blue-500/10 border border-blue-500/30 -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Templates Grid ── */}
      <AnimatePresence mode="wait">
        {filteredTemplates.length > 0 ? (
          <motion.div
            key={`${languageFilter}-${categoryFilter}-${searchQuery}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {filteredTemplates.map((template) => (
              <motion.div key={template.id} variants={cardVariants} layout>
                <Card className="group relative overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 h-full flex flex-col cursor-pointer"
                  onClick={() => handleCardClick(template)}
                >
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
                        className={`w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                      >
                        {template.icon}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {template.isFeatured && (
                          <Badge className="gap-1 text-[9px] px-1.5 py-0 h-4 bg-blue-500/15 text-blue-400 border-blue-500/25 border">
                            <Crown className="h-2.5 w-2.5" />
                            مميز
                          </Badge>
                        )}
                        <LanguageBadge language={template.language} />
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

                    {/* Difficulty + Deploy Count */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DifficultyStars level={template.difficulty} />
                        <DifficultyLabel level={template.difficulty} />
                      </div>
                      <DeployCountBadge count={template.deployCount} />
                    </div>

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {template.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border text-muted-foreground/80 bg-muted/30 border-border/30"
                        >
                          <span className="w-1 h-1 rounded-full bg-blue-400/60" />
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 3 && (
                        <span className="text-[10px] text-muted-foreground/50 px-1">
                          +{template.features.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Expand indicator */}
                    <motion.div
                      animate={{ rotate: expandedId === template.id ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="flex justify-center"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
                    </motion.div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {expandedId === template.id && (
                        <TemplateDetailExpansion template={template} />
                      )}
                    </AnimatePresence>

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        onClick={() => handleUseTemplate(template)}
                        className="w-full gap-2 h-10 rounded-xl font-medium bg-gradient-to-l from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group-hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Sparkles className="h-4 w-4" />
                        نشر القالب
                        <ChevronLeft className="h-3.5 w-3.5 mr-auto opacity-60 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* ── Empty State ── */
          <motion.div
            key="empty"
            variants={emptyStateVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6"
            >
              <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                <img
                  src="https://f.top4top.io/p_37210bgwm1.jpg"
                  alt="Wolf Logo"
                  className="w-16 h-16 rounded-xl object-cover"
                />
              </div>
            </motion.div>
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
                setLanguageFilter('all');
                setCategoryFilter('all');
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
        className="rounded-xl border border-border/30 bg-gradient-to-br from-muted/20 to-muted/5 p-4 sm:p-5 backdrop-blur-sm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Heart className="h-5 w-5 text-blue-400" />
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
