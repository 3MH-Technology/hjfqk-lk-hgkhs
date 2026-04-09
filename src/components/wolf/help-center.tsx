'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Bot,
  Upload,
  Rocket,
  FolderCog,
  MonitorDot,
  Shield,
  Settings,
  Wrench,
  Clock,
  ArrowLeft,
  MessageCircle,
  Mail,
  FileText,
  HelpCircle,
  Key,
  Zap,
  Terminal,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

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

/* ─── Quick Start Steps ─── */

const quickStartSteps = [
  {
    icon: HelpCircle,
    title: 'سجّل حسابك',
    description: 'أنشئ حساباً مجانياً في أقل من دقيقة واحدة',
    color: 'text-primary',
    bg: 'bg-primary/15',
    step: 1,
  },
  {
    icon: Bot,
    title: 'أنشئ بوتك',
    description: 'اختر قالباً جاهزاً أو أنشئ بوتك من الصفر',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    step: 2,
  },
  {
    icon: Upload,
    title: 'ارفع ملفاتك',
    description: 'ارفع كود البوت وملفاته عبر مدير الملفات',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    step: 3,
  },
  {
    icon: Rocket,
    title: 'أطلق البوت',
    description: 'شغّل بوتك وراقبه من لوحة التحكم',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    step: 4,
  },
];

/* ─── Knowledge Base Categories ─── */

const categories = [
  {
    icon: Bot,
    title: 'إنشاء وإدارة البوتات',
    description: 'تعلم كيفية إنشاء البوتات وإدارتها وإعداداتها المتقدمة',
    articleCount: 12,
    color: 'text-primary',
    bg: 'bg-primary/15',
    border: 'border-primary/20',
  },
  {
    icon: FolderCog,
    title: 'إدارة الملفات',
    description: 'رفع الملفات وتعديلها وحذفها عبر مدير الملفات المتكامل',
    articleCount: 8,
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/20',
  },
  {
    icon: MonitorDot,
    title: 'مراقبة الأداء',
    description: 'متابعة استخدام الموارد والأداء والتنبيهات',
    articleCount: 6,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/20',
  },
  {
    icon: Shield,
    title: 'الأمان والحماية',
    description: 'أفضل ممارسات الأمان وحماية بياناتك وبوتاتك',
    articleCount: 9,
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/20',
  },
  {
    icon: Settings,
    title: 'إعدادات الحساب',
    description: 'إدارة ملفك الشخصي وتغيير كلمة المرور والإعدادات العامة',
    articleCount: 5,
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/20',
  },
  {
    icon: Wrench,
    title: 'استكشاف الأخطاء',
    description: 'حل المشاكل الشائعة والأخطاء المتكررة وأسئلة وأجوبة',
    articleCount: 14,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/20',
  },
];

/* ─── Popular Articles ─── */

const articles = [
  {
    icon: Zap,
    title: 'كيفية تشغيل أول بوت تيليجرام',
    category: 'إنشاء البوتات',
    readTime: '3 دقائق',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
  },
  {
    icon: Key,
    title: 'الحصول على توكن بوت تيليجرام من BotFather',
    category: 'إنشاء البوتات',
    readTime: '2 دقيقة',
    color: 'text-primary',
    bg: 'bg-primary/15',
  },
  {
    icon: Layers,
    title: 'إدارة متغيرات البيئة بشكل آمن',
    category: 'الأمان',
    readTime: '4 دقائق',
    color: 'text-red-400',
    bg: 'bg-red-500/15',
  },
  {
    icon: Upload,
    title: 'رفع ملفات متعددة وبناء مشروع كامل',
    category: 'إدارة الملفات',
    readTime: '5 دقائق',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
  },
  {
    icon: Terminal,
    title: 'قراءة وفهم سجلات البوت',
    category: 'استكشاف الأخطاء',
    readTime: '3 دقائق',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
  {
    icon: MonitorDot,
    title: 'تفسير مؤشرات الأداء وتحسينها',
    category: 'مراقبة الأداء',
    readTime: '6 دقائق',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
  },
  {
    icon: FileText,
    title: 'استخدام محرر الكود المتكامل في مدير الملفات',
    category: 'إدارة الملفات',
    readTime: '4 دقائق',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
  },
  {
    icon: Wrench,
    title: 'حل مشكلة توقف البوت بشكل مفاجئ',
    category: 'استكشاف الأخطاء',
    readTime: '3 دقائق',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
];

/* ─── Main Component ─── */

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.trim().toLowerCase();
    return articles.filter(
      (article) =>
        article.title.includes(q) ||
        article.category.includes(q)
    );
  }, [searchQuery]);

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
                <BookOpen className="size-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
                مركز المساعدة
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
                اكتشف مقالات ودليل شامل لمساعدتك في البدء واستخدام جميع ميزات
                استضافة الذئب. ابحث عن أي سؤال أو تصفح الأقسام أدناه.
              </p>

              {/* Search Bar */}
              <div className="relative w-full max-w-lg">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث في المقالات والأدلة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-4 h-11 bg-muted/50 border-border rounded-xl text-sm focus:ring-primary/30 focus:border-primary/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-xs">✕</span>
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Quick Start Guide ─── */}
      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Rocket className="size-5 text-primary" />
            دليل البدء السريع
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            أربع خطوات بسيطة لبدء استضافة بوتك
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStartSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="relative"
              >
                <Card className="bg-card border-border rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`size-12 rounded-xl ${step.bg} flex items-center justify-center`}
                        >
                          <Icon className={`size-6 ${step.color}`} />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold mb-1">{step.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Connector line between steps on larger screens */}
                {i < quickStartSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -left-3 w-6 border-t border-dashed border-primary/30" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Knowledge Base Categories ─── */}
      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            قاعدة المعرفة
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            تصفح المقالات حسب التصنيف
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.title} variants={itemVariants}>
                <Card
                  className={`bg-card border ${cat.border} rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full group cursor-pointer`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`size-12 rounded-xl ${cat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`size-6 ${cat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-bold">{cat.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {cat.description}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-muted/50"
                        >
                          <FileText className="size-3 ml-1" />
                          {cat.articleCount} مقال
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Popular Articles ─── */}
      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            المقالات الأكثر قراءة
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            مقالات مفيدة يحتاجها معظم المستخدمين
            {searchQuery && (
              <span className="text-primary mr-2">
                — نتائج البحث: &quot;{searchQuery}&quot;
              </span>
            )}
          </p>
        </div>

        {filteredArticles.length === 0 ? (
          <Card className="bg-card border-border rounded-xl">
            <CardContent className="p-8 text-center">
              <Search className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                لم يتم العثور على مقالات تطابق بحثك
              </p>
              <Button
                variant="outline"
                className="mt-3 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => setSearchQuery('')}
              >
                مسح البحث
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredArticles.map((article, i) => {
              const Icon = article.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="bg-card border-border rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-10 rounded-lg ${article.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`size-5 ${article.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-muted/50"
                            >
                              {article.category}
                            </Badge>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                              <Clock className="size-3" />
                              {article.readTime}
                            </span>
                          </div>
                        </div>
                        <ArrowLeft className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ─── Contact Support Section ─── */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden rounded-xl border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent pointer-events-none" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Message Icon */}
              <div className="shrink-0">
                <div className="size-16 rounded-2xl bg-primary/15 flex items-center justify-center glow-effect">
                  <MessageCircle className="size-8 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-lg font-bold mb-2">
                  تحتاج مساعدة إضافية؟
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  لم تجد ما تبحث عنه؟ تواصل مع فريق الدعم الفني وسنساعدك في حل
                  أي مشكلة أو الإجابة على أي سؤال.
                </p>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <MessageCircle className="size-4" />
                  تيليجرام
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Mail className="size-4" />
                  البريد الإلكتروني
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
