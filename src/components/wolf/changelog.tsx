'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  GitCommitHorizontal,
  Plus,
  Wrench,
  Bug,
  Shield,
  ChevronDown,
  Sparkles,
  Rocket,
  Eye,
  ThumbsUp,
  Calendar,
  Clock,
  Zap,
  Globe,
  Lock,
  Layers,
  Code2,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ─── Animation Variants ─── */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const timelineVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

/* ─── Types ─── */

type ChangeType = 'feature' | 'improvement' | 'bugfix' | 'security';

interface ChangeItem {
  type: ChangeType;
  title: string;
  detail: string;
}

type ReleaseType = 'major' | 'minor' | 'patch' | 'security';

interface VersionEntry {
  version: string;
  date: string;
  title: string;
  releaseType: ReleaseType;
  changes: ChangeItem[];
}

type UpcomingStatus = 'in-development' | 'planned' | 'in-review';

interface UpcomingFeature {
  name: string;
  description: string;
  status: UpcomingStatus;
  quarter: string;
  icon: React.ElementType;
  votes: number;
}

/* ─── Helpers ─── */

const changeTypeConfig: Record<ChangeType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  feature: {
    label: 'ميزة جديدة',
    icon: Plus,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
  },
  improvement: {
    label: 'تحسين',
    icon: Wrench,
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
  },
  bugfix: {
    label: 'إصلاح',
    icon: Bug,
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
  },
  security: {
    label: 'أمان',
    icon: Shield,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
  },
};

const releaseTypeConfig: Record<ReleaseType, { label: string; color: string; bg: string }> = {
  major: { label: 'إطلاق كبير', color: 'text-primary', bg: 'bg-primary/15' },
  minor: { label: 'ميزات جديدة', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  patch: { label: 'تحسينات وإصلاحات', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  security: { label: 'تحديث أمني', color: 'text-amber-400', bg: 'bg-amber-500/15' },
};

const upcomingStatusConfig: Record<UpcomingStatus, { label: string; color: string; bg: string; border: string }> = {
  'in-development': { label: 'قيد التطوير', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  planned: { label: 'مخطط', color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
  'in-review': { label: 'قيد المراجعة', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
};

/* ─── Data ─── */

const versionHistory: VersionEntry[] = [
  {
    version: 'v0.2.5',
    date: '15 يناير 2025',
    title: 'تحسينات الأداء وإصلاحات',
    releaseType: 'patch',
    changes: [
      { type: 'improvement', title: 'تحسين سرعة تحميل لوحة التحكم بنسبة 40%', detail: 'تم تحسين أداء استعلامات قاعدة البيانات وتقليل وقت التحميل بشكل ملحوظ من خلال التخزين المؤقت وتحسين استعلامات Prisma.' },
      { type: 'feature', title: 'إضافة مراقب صحة البوتات الجديد', detail: 'صفحة جديدة لمراقبة صحة جميع البوتات مع مؤشرات حالة مباشرة وإشعارات ذكية عند اكتشاف مشاكل.' },
      { type: 'bugfix', title: 'إصلاح مشكلة عرض السجلات في الوقت الفعلي', detail: 'تم إصلاح خطأ كان يمنع تحديث السجلات تلقائياً في وضع الوقت الفعلي بسبب مشكلة في اتصال WebSocket.' },
      { type: 'improvement', title: 'تحسين واجهة إدارة الملفات', detail: 'تصميم محسّن لمدير الملفات مع دعم السحب والإفلات وتحسين أداء محرر الكود.' },
      { type: 'feature', title: 'إضافة صفحة توثيق API الكاملة', detail: 'توثيق شامل لجميع نقاط نهاية API مع أمثلة عملية وأدوات تفاعلية للاختبار.' },
    ],
  },
  {
    version: 'v0.2.0',
    date: '1 يناير 2025',
    title: 'الإطلاق الكبير',
    releaseType: 'major',
    changes: [
      { type: 'feature', title: 'واجهة مستخدم جديدة بالكامل', detail: 'إعادة تصميم شاملة للواجهة مع نظام ألوان جديد وتصميم زجاجي متقدم وانيميشن سلسة عبر جميع الصفحات.' },
      { type: 'feature', title: 'نظام إشعارات متقدم', detail: 'نظام إشعارات ذكي مع دعم الإشعارات الفورية والبريد الإلكتروني وإشعارات داخل التطبيق مع تصنيف وأنواع متعددة.' },
      { type: 'feature', title: 'لوحة تحليلات شاملة', detail: 'لوحة تحليلات جديدة مع رسوم بيانية تفاعلية وإحصائيات مفصلة عن أداء البوتات واستخدام الموارد.' },
      { type: 'feature', title: 'دعم الفرق والتعاون', detail: 'نظام فرق كامل مع صلاحيات مرنة ودعوة الأعضاء وإدارة الأدوار والتعاون على إدارة البوتات.' },
      { type: 'feature', title: 'نظام إدارة المفاتيح', detail: 'إدارة مفاتيح API مع إنشاء وتعديل وحذف المفاتيح مع تتبع الاستخدام وتقييد الصلاحيات.' },
    ],
  },
  {
    version: 'v0.1.5',
    date: '15 ديسمبر 2024',
    title: 'إصلاحات الأمان والتحسينات',
    releaseType: 'security',
    changes: [
      { type: 'security', title: 'تحديث صلاحيات المستخدمين', detail: 'مراجعة شاملة لصلاحيات جميع الأدوار مع إصلاح ثغرات التفويض وتحسين آليات الحماية.' },
      { type: 'security', title: 'إضافة تقييد IP للـ admin', detail: 'حماية إضافية للوحة المدير من خلال تقييد الوصول بعناوين IP معينة مع إمكانية إدارة القائمة.' },
      { type: 'security', title: 'تحسين تشفير كلمات المرور', detail: 'ترقية خوارزمية التشفير إلى bcrypt مع تدرج أعلى وإضافة سياسة قوة كلمة المرور.' },
      { type: 'improvement', title: 'تحسين سرعة الاستجابة العامة', detail: 'تحسينات متعددة في طبقة API وطبقة قاعدة البيانات لتقليل زمن الاستجابة بنسبة 30%.' },
    ],
  },
  {
    version: 'v0.1.2',
    date: '1 ديسمبر 2024',
    title: 'تحسينات واجهة الملفات',
    releaseType: 'minor',
    changes: [
      { type: 'feature', title: 'محرر كود مدمج مع تلوين بناء الجملة', detail: 'محرر كود متقدم يدعم لغات Python و PHP مع تلوين بناء الجملة وإكمال تلقائي وأرقام الأسطر.' },
      { type: 'improvement', title: 'تحسين مدير الملفات', detail: 'تصميم محسّن مع عرض مريح للملفات وإمكانية الرفع المتعدد وتحسين سرعة التحميل.' },
      { type: 'bugfix', title: 'إصلاح مشكلة حفظ الملفات الكبيرة', detail: 'تم إصلاح خطأ كان يمنع حفظ الملفات التي تتجاوز 1 ميجابايت.' },
      { type: 'bugfix', title: 'إصلاح مشكلة عرض المسارات العربية', detail: 'معالجة أفضل للمسارات التي تحتوي على أحرف عربية ورموز خاصة.' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '15 نوفمبر 2024',
    title: 'الإصدار الأول',
    releaseType: 'major',
    changes: [
      { type: 'feature', title: 'إدارة البوتات الأساسية', detail: 'إنشاء وتشغيل وإيقاف وحذف البوتات مع دعم Python و PHP وإدارة الملفات والمتغيرات البيئية.' },
      { type: 'feature', title: 'تسجيل الدخول والتسجيل', detail: 'نظام مصادقة كامل مع تسجيل دخول وإنشاء حساب وإدارة الجلسات باستخدام NextAuth.' },
      { type: 'feature', title: 'لوحة تحكم أولية', detail: 'لوحة تحكم مع إحصائيات أساسية عن البوتات والموارد المستخدمة.' },
      { type: 'feature', title: 'عارض السجلات', detail: 'عرض سجلات البوتات مع فلترة حسب المستوى والبحث في السجلات والتحديث التلقائي.' },
    ],
  },
  {
    version: 'v0.0.1',
    date: '1 نوفمبر 2024',
    title: 'النسخة التجريبية',
    releaseType: 'patch',
    changes: [
      { type: 'feature', title: 'إعداد البنية التحتية', detail: 'تهيئة المشروع مع Next.js و Prisma و NextAuth وإعداد قاعدة البيانات ونظام المصادقة.' },
      { type: 'improvement', title: 'تصميم RTL الأساسي', detail: 'إعداد التخطيط RTL مع دعم اللغة العربية وتصميم متجاوب لجميع أحجام الشاشات.' },
    ],
  },
];

const upcomingFeatures: UpcomingFeature[] = [
  {
    name: 'سوق القوالب',
    description: 'سوق مركزي لتبادل قوالب البوتات الجاهزة مع تقييمات ومراجعات من المجتمع.',
    status: 'planned',
    quarter: 'Q2 2025',
    icon: Globe,
    votes: 342,
  },
  {
    name: 'نشر تلقائي عبر CI/CD',
    description: 'تكامل مع GitHub Actions و GitLab CI للنشر التلقائي عند دفع الكود.',
    status: 'in-development',
    quarter: 'Q1 2025',
    icon: Rocket,
    votes: 521,
  },
  {
    name: 'دعم Dockerfile مخصص',
    description: 'إمكانية رفع Dockerfile مخصص لكل بوت مع تحكم كامل في بيئة التشغيل.',
    status: 'in-review',
    quarter: 'Q1 2025',
    icon: Layers,
    votes: 289,
  },
  {
    name: 'شبكة VPN خاصة',
    description: 'شبكة افتراضية خاصة للتواصل الآمن بين البوتات والخدمات الخارجية.',
    status: 'planned',
    quarter: 'Q3 2025',
    icon: Lock,
    votes: 167,
  },
  {
    name: 'محرر مرئي للبوتات',
    description: 'محرر مرئي بالسحب والإفلات لبناء سلوكيات البوت بدون كتابة كود.',
    status: 'planned',
    quarter: 'Q3 2025',
    icon: Code2,
    votes: 456,
  },
  {
    name: 'دعم Webhooks متقدم',
    description: 'نظام webhooks متقدم مع إعادة المحاولة وتسجيل الدخول وتصفية الأحداث.',
    status: 'in-development',
    quarter: 'Q2 2025',
    icon: MessageSquare,
    votes: 198,
  },
];

/* ─── Change Detail Component ─── */

function ChangeItemCard({ change, index }: { change: ChangeItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = changeTypeConfig[change.type];
  const Icon = config.icon;

  return (
    <motion.div
      variants={itemVariants}
      className="group"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-start gap-3 w-full text-right rounded-lg border p-3 transition-all duration-200 hover:shadow-md cursor-pointer ${
          expanded
            ? `${config.bg} ${config.border} shadow-md`
            : 'bg-card/50 border-border/40 hover:border-border/80'
        }`}
      >
        <div className={`mt-0.5 size-6 rounded-md ${config.bg} flex items-center justify-center shrink-0 transition-colors`}>
          <Icon className={`size-3.5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{change.title}</span>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${config.color} ${config.border} ${config.bg} border shrink-0`}>
              {config.label}
            </Badge>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' as const }}
                className="text-xs text-muted-foreground leading-relaxed mt-2 overflow-hidden"
              >
                {change.detail}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 shrink-0"
        >
          <ChevronDown className="size-4 text-muted-foreground/50" />
        </motion.div>
      </button>
    </motion.div>
  );
}

/* ─── Version Timeline Entry ─── */

function VersionTimelineEntry({ entry, isLatest }: { entry: VersionEntry; isLatest: boolean }) {
  const releaseConfig = releaseTypeConfig[entry.releaseType];
  const [isOpen, setIsOpen] = useState(isLatest);

  return (
    <motion.div variants={timelineVariants} className="relative flex gap-4 md:gap-6">
      {/* Timeline line + dot */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <div className="relative z-10">
          {isLatest ? (
            <div className="size-4 rounded-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.5)]">
              <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
            </div>
          ) : (
            <div className="size-3 rounded-full bg-border border-2 border-background" />
          )}
        </div>
        {/* Connecting line */}
        <div className="w-px flex-1 bg-gradient-to-b from-border/60 via-border/30 to-transparent mt-2" />
      </div>

      {/* Content card */}
      <div className="flex-1 pb-8 min-w-0">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm card-hover-lift">
            {/* Version header */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full text-right cursor-pointer"
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Version badge */}
                    <Badge className="font-mono text-sm px-2.5 py-0.5 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20 transition-colors">
                      {entry.version}
                    </Badge>
                    {/* Date */}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      {entry.date}
                    </span>
                    {/* Release type */}
                    <Badge variant="outline" className={`text-[10px] ${releaseConfig.color} ${releaseConfig.bg} border-transparent`}>
                      {releaseConfig.label}
                    </Badge>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </motion.div>
                </div>
                <h3 className="text-base font-bold mt-2 text-foreground">
                  {entry.title}
                </h3>
                {isLatest && (
                  <Badge className="mt-2 text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    <Sparkles className="size-3 ml-1" />
                    أحدث إصدار
                  </Badge>
                )}
              </CardContent>
            </button>

            {/* Changes list */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' as const }}
                  className="overflow-hidden"
                >
                  <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                    <div className="border-t border-border/40 pt-4">
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-2"
                      >
                        {entry.changes.map((change, idx) => (
                          <ChangeItemCard key={idx} change={change} index={idx} />
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Upcoming Feature Card ─── */

function UpcomingFeatureCard({ feature }: { feature: UpcomingFeature }) {
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(feature.votes);
  const statusConfig = upcomingStatusConfig[feature.status];
  const FeatureIcon = feature.icon;

  const handleVote = () => {
    if (voted) {
      setVoted(false);
      setVoteCount((c) => c - 1);
    } else {
      setVoted(true);
      setVoteCount((c) => c + 1);
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden card-hover-lift neon-border-glow">
          <CardContent className="p-4 md:p-5 flex flex-col h-full">
            {/* Icon + Status */}
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FeatureIcon className="size-5 text-primary" />
              </div>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusConfig.color} ${statusConfig.bg} ${statusConfig.border} border shrink-0`}>
                {statusConfig.label}
              </Badge>
            </div>

            {/* Feature info */}
            <h4 className="text-sm font-bold text-foreground mb-1.5">{feature.name}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">{feature.description}</p>

            {/* Quarter + Vote */}
            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                {feature.quarter}
              </span>
              <Button
                variant={voted ? 'default' : 'outline'}
                size="sm"
                onClick={handleVote}
                className={`h-7 gap-1.5 text-[11px] transition-all duration-200 ${
                  voted
                    ? 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/20'
                    : 'border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30'
                }`}
              >
                <ThumbsUp className={`size-3 ${voted ? 'fill-current' : ''}`} />
                <span>{voteCount}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export default function Changelog() {
  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Hero Section ─── */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden rounded-xl border border-border">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-transparent pointer-events-none" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="size-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-4 glow-effect">
                <GitCommitHorizontal className="size-8 text-primary" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                  سجل التغييرات
                </h1>
                <Badge className="font-mono text-sm px-2.5 py-0.5 bg-primary/15 text-primary border-primary/30">
                  v0.2.5
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                تتبع آخر التحديثات والميزات الجديدة
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Version Timeline Section ─── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-5">
          <Zap className="size-5 text-primary" />
          <h2 className="text-lg font-bold">تاريخ الإصدارات</h2>
          <Badge variant="outline" className="text-[10px] text-muted-foreground mr-auto">
            {versionHistory.length} إصدار
          </Badge>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Vertical timeline line (background) */}
          <div className="absolute right-[7px] md:right-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border/30 to-transparent" />

          <div className="space-y-0">
            {versionHistory.map((entry, idx) => (
              <VersionTimelineEntry
                key={entry.version}
                entry={entry}
                isLatest={idx === 0}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Upcoming Features Section ─── */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden rounded-xl border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardContent className="relative p-6 md:p-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Eye className="size-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold gradient-text-animated">قادم قريباً</h2>
                  <p className="text-xs text-muted-foreground">ميزات نخطط لإضافتها قريباً — صوّت للميزة التي تهمك</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                <Rocket className="size-3 ml-1" />
                {upcomingFeatures.length} ميزة قادمة
              </Badge>
            </div>

            {/* Features Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {upcomingFeatures.map((feature) => (
                <UpcomingFeatureCard key={feature.name} feature={feature} />
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
