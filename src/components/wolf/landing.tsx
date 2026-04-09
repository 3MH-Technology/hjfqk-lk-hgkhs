'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  FolderOpen,
  BarChart3,
  RefreshCw,
  Lock,
  ArrowLeft,
  Code,
  FileCode,
  Bot,
  Server,
  Headphones,
  UserPlus,
  Upload,
  PlayCircle,
  Star,
  Quote,
  Send,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  Activity,
  Clock,
  Check,
  Crown,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState, useCallback } from 'react';

/* ─── Data ────────────────────────────────────────────── */

const features = [
  {
    icon: Shield,
    emoji: '🔐',
    title: 'عزل كامل',
    description: 'كل بوت يعمل في حاوية مستقلة تماماً لضمان الأمان والاستقرار',
  },
  {
    icon: Zap,
    emoji: '⚡',
    title: 'تشغيل فوري',
    description: 'تشغيل وإيقاف البوت بنقرة واحدة بدون أي تأخير',
  },
  {
    icon: FolderOpen,
    emoji: '📂',
    title: 'إدارة ملفات',
    description: 'رفع وتعديل ملفات البوت بسهولة عبر واجهة متكاملة',
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'مراقبة مستمرة',
    description: 'سجلات مباشرة وإحصائيات تفصيلية لأداء البوت',
  },
  {
    icon: RefreshCw,
    emoji: '🔄',
    title: 'إعادة تشغيل تلقائية',
    description: 'استرداد تلقائي عند التعطل لضمان استمرارية الخدمة',
  },
  {
    icon: Lock,
    emoji: '🛡️',
    title: 'أمان متقدم',
    description: 'حماية متعددة الطبقات لتأمين بوتاتك وبياناتك',
  },
];

const supportedLanguages = [
  {
    icon: Code,
    name: 'Python',
    description: 'Python 3.11+ مع مكتبات شائعة',
    color: 'from-yellow-500/20 to-blue-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    icon: FileCode,
    name: 'PHP',
    description: 'PHP 8.2+ مع إضافات متقدمة',
    color: 'from-indigo-500/20 to-purple-500/20',
    iconColor: 'text-indigo-400',
  },
];

const stats = [
  {
    icon: Bot,
    value: '+1000',
    label: 'بوت مستضاف',
    suffix: '',
  },
  {
    icon: Activity,
    value: '99.9%',
    label: 'وقت التشغيل',
    suffix: '',
  },
  {
    icon: Headphones,
    value: '24/7',
    label: 'دعم فني',
    suffix: '',
  },
];

const howItWorksSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: 'إنشاء حساب',
    description: 'سجّل حساباً مجانياً في أقل من دقيقة وابدأ رحلتك معنا',
  },
  {
    step: 2,
    icon: Upload,
    title: 'رفع البوت',
    description: 'ارفع ملفات البوت الخاص بك وأعدّ متغيرات البيئة بسهولة',
  },
  {
    step: 3,
    icon: PlayCircle,
    title: 'تشغيل فوري',
    description: 'شغّل بوتك بنقرة واحدة واستمتع بأداء عالٍ ومستقر',
  },
];

const testimonials = [
  {
    quote: 'أفضل منصة استضافة بوتات تيليجرام استخدمتها. السرعة والأمان لا مثيل لهما، والدعم الفني يستجيب فوراً.',
    name: 'مستخدم مجهول',
    role: 'مطور بوتات',
    stars: 5,
  },
  {
    quote: 'استضافة الذئب وفّرت عليّ الكثير من الوقت والجهد. الواجهة سهلة جداً والبوت يعمل بدون انقطاع منذ أشهر.',
    name: 'مستخدم مجهول',
    role: 'صاحب مشروع',
    stars: 5,
  },
  {
    quote: 'الميزات المتقدمة مثل السجلات المباشرة وإعادة التشغيل التلقائي جعلت إدارة البوتات تجربة ممتعة.',
    name: 'مستخدم مجهول',
    role: 'مبرمج مستقل',
    stars: 5,
  },
];

const trustBadges = [
  { emoji: '🔒', text: 'آمن 100%' },
  { emoji: '⚡', text: 'بدون تأخير' },
  { emoji: '🛡️', text: 'حماية متقدمة' },
];

const pricingPlans = [
  {
    name: 'مجاني',
    icon: Sparkles,
    price: '0',
    currency: 'ر.س',
    period: '/شهرياً',
    description: 'مثالي للمبتدئين والمشاريع الصغيرة',
    badge: null,
    highlighted: false,
    features: [
      { text: '3 بوتات', included: true },
      { text: '512MB ذاكرة RAM', included: true },
      { text: 'دعم أساسي', included: true },
      { text: '1GB مساحة تخزين', included: true },
      { text: 'مراقبة متقدمة', included: false },
      { text: 'نطاقات مخصصة', included: false },
      { text: 'ضمان SLA', included: false },
    ],
    ctaLabel: 'ابدأ مجاناً',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'احترافي',
    icon: Crown,
    price: '29',
    currency: 'ر.س',
    period: '/شهرياً',
    description: 'الأفضل للمطورين المحترفين',
    badge: 'الأكثر شعبية',
    highlighted: true,
    features: [
      { text: '15 بوت', included: true },
      { text: '2GB ذاكرة RAM', included: true },
      { text: 'دعم ذو أولوية', included: true },
      { text: '10GB مساحة تخزين', included: true },
      { text: 'مراقبة متقدمة', included: true },
      { text: 'نطاقات مخصصة', included: false },
      { text: 'ضمان SLA', included: false },
    ],
    ctaLabel: 'اشترك الآن',
    ctaVariant: 'default' as const,
  },
  {
    name: 'مؤسسات',
    icon: Building2,
    price: '99',
    currency: 'ر.س',
    period: '/شهرياً',
    description: 'للشركات والمشاريع الكبيرة',
    badge: null,
    highlighted: false,
    features: [
      { text: 'بوتات غير محدودة', included: true },
      { text: '8GB ذاكرة RAM', included: true },
      { text: 'دعم مخصص 24/7', included: true },
      { text: '100GB مساحة تخزين', included: true },
      { text: 'مراقبة متقدمة', included: true },
      { text: 'نطاقات مخصصة', included: true },
      { text: 'ضمان SLA', included: true },
    ],
    ctaLabel: 'تواصل معنا',
    ctaVariant: 'outline' as const,
  },
];

const faqItems = [
  {
    question: 'كيف أبدأ باستضافة بوت على المنصة؟',
    answer: 'يمكنك البدء بإنشاء حساب مجاني في أقل من دقيقة، ثم رفع ملفات البوت الخاص بك وإعداد متغيرات البيئة. بعد ذلك، شغّل بوتك بنقرة واحدة وسيبدأ العمل فوراً على خوادمنا الآمنة والمستقرة.',
  },
  {
    question: 'ما اللغات البرمجية المدعومة؟',
    answer: 'ندعم حالياً Python 3.11+ مع المكتبات الشائعة و PHP 8.2+ مع إضافات متقدمة. نعمل باستمرار على إضافة لغات جديدة مثل JavaScript/Node.js و Rust لتلبية احتياجات جميع المطورين.',
  },
  {
    question: 'هل بيانات بوتاتي آمنة على المنصة؟',
    answer: 'نعم، نستخدم عزل حاويات كامل (Container Isolation) لكل بوت مع حماية متعددة الطبقات. بياناتك مشفرة ومحمية بأحدث تقنيات الأمان، ولا يمكن لأي بوت آخر الوصول إلى بيانات بوتك.',
  },
  {
    question: 'ما الفرق بين الخطط المدفوعة والمجانية؟',
    answer: 'الخطة المجانية توفر 3 بوتات مع 512MB RAM و 1GB تخزين. الخطة الاحترافية توفر 15 بوتاً مع 2GB RAM و 10GB تخزين ودعم ذو أولوية ومراقبة متقدمة. خطة المؤسسات توفر بوتات غير محدودة مع 8GB RAM و 100GB تخزين ودعم مخصص 24/7 ونطاقات مخصصة وضمان SLA.',
  },
  {
    question: 'كيف يمكنني التواصل مع فريق الدعم؟',
    answer: 'يمكنك التواصل معنا عبر قنوات تيليجرام المخصصة للدعم الفني. نوفر دعماً فنياً متواصلاً على مدار الساعة للمستخدمين المدفوعين، ودعماً أساسياً خلال ساعات العمل للمستخدمين المجانيين.',
  },
  {
    question: 'هل يوجد حد أقصى لعدد البوتات؟',
    answer: 'يعتمد ذلك على خطتك. الخطة المجانية تسمح بـ 3 بوتات، والخطة الاحترافية تسمح بـ 15 بوتاً. أما خطة المؤسسات فلا يوجد بها حد أقصى لعدد البوتات. يمكنك الترقية في أي وقت لزيادة عدد البوتات.',
  },
];

/* ─── Animation Variants ──────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  }),
};

/* ─── Component ───────────────────────────────────────── */

export default function Landing() {
  const { setCurrentPage } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ═══════════ STICKY NAVBAR ═══════════ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 navbar-glass"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand — right side (RTL) */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐺</span>
            <span className="font-bold gradient-text text-base md:text-lg">
              استضافة الذئب
            </span>
          </div>

          {/* Center Nav Links — desktop */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              المميزات
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              الأسعار
            </button>
            <button
              onClick={() => scrollToSection('languages')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              اللغات
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              الأسئلة الشائعة
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              تواصل
            </button>
          </div>

          {/* Buttons — left side (RTL) */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setCurrentPage('login')}
            >
              تسجيل الدخول
            </Button>
            <Button
              size="sm"
              className="text-sm shadow-md shadow-primary/10"
              onClick={() => setCurrentPage('register')}
            >
              إنشاء حساب
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/30 navbar-glass"
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                المميزات
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                الأسعار
              </button>
              <button
                onClick={() => scrollToSection('languages')}
                className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                اللغات
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                الأسئلة الشائعة
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                تواصل
              </button>
              <Separator />
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-sm"
                  onClick={() => { setMobileMenuOpen(false); setCurrentPage('login'); }}
                >
                  تسجيل الدخول
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-sm"
                  onClick={() => { setMobileMenuOpen(false); setCurrentPage('register'); }}
                >
                  إنشاء حساب
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="flex-1">
        {/* ──────── HERO SECTION ──────── */}
        <section className="relative overflow-hidden">
          {/* Animated gradient mesh / particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-particle-1 absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="mesh-particle-2 absolute bottom-[5%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[80px]" />
            <div className="mesh-particle-3 absolute top-[40%] left-[50%] w-[350px] h-[350px] rounded-full bg-primary/4 blur-[90px]" />

            {/* Subtle grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(oklch(0.78 0.15 75) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.15 75) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center space-y-6"
            >
              {/* Logo & Brand — with floating + glow */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative float-animation">
                  {/* Glow behind logo */}
                  <div className="absolute inset-0 rounded-3xl glow-effect" />
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-4xl md:text-5xl shadow-lg shadow-primary/10">
                    🐺
                  </div>
                  <div className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-full pulse-dot" />
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary/60 rounded-full pulse-dot"
                    style={{ animationDelay: '1s' }}
                  />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold gradient-text"
              >
                استضافة الذئب
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl md:text-2xl text-primary/80 font-medium"
              >
                منصة استضافة احترافية لبوتات تيليجرام
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                استضف بوتاتك على بيئة آمنة ومستقرة مع دعم كامل للغات البرمجة
                الشائعة. تحكم كامل في بوتاتك مع واجهة سهلة الاستخدام وإدارة متقدمة.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
              >
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/20"
                  onClick={() => setCurrentPage('login')}
                >
                  تسجيل الدخول
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-medium border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => setCurrentPage('register')}
                >
                  إنشاء حساب
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
                className="flex flex-wrap justify-center gap-3 pt-4"
              >
                {trustBadges.map((badge) => (
                  <div
                    key={badge.text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs text-muted-foreground"
                  >
                    <span>{badge.emoji}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="flex justify-center pt-12"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ──────── STATS COUNTER SECTION ──────── */}
        <section className="stats-gradient-bg border-y border-border/30">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl md:text-4xl font-bold gradient-text">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ──────── FEATURES SECTION ──────── */}
        <section id="features" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            {/* Section header decoration */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-primary/30 to-transparent" />
              <div className="h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">مميزات المنصة</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              كل ما تحتاجه لاستضافة وإدارة بوتات تيليجرام الخاص بك
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-all duration-300 gradient-border-hover"
              >
                <div className="flex items-start gap-4 relative">
                  {/* Icon with glow effect */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                      {feature.emoji}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ──────── HOW IT WORKS SECTION ──────── */}
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-primary/30 to-transparent" />
              <div className="h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">كيف تبدأ؟</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              ثلاث خطوات بسيطة فقط وتكون بوتك جاهزاً للعمل
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative"
          >
            {/* Connector arrows — desktop only */}
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-[33%] w-[34%] h-px bg-gradient-to-l from-primary/30 via-primary/15 to-primary/30" />
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-[66%] w-[34%] h-px bg-gradient-to-l from-primary/30 via-primary/15 to-primary/30" />

            {howItWorksSteps.map((step) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="relative flex flex-col items-center text-center gap-4 p-6"
              >
                {/* Step number badge */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative z-10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md shadow-primary/30 z-20">
                    {step.step}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
                {/* Arrow for mobile */}
                {step.step < 3 && (
                  <div className="md:hidden text-primary/30">
                    <ArrowLeft className="h-5 w-5 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ──────── SUPPORTED LANGUAGES SECTION ──────── */}
        <section id="languages" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-primary/30 to-transparent" />
              <div className="h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">اللغات المدعومة</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              ندعم أحدث إصدارات اللغات الأكثر استخداماً في تطوير بوتات تيليجرام
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto"
          >
            {supportedLanguages.map((lang) => (
              <motion.div
                key={lang.name}
                variants={itemVariants}
                className={`group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 hover:border-primary/20 transition-all duration-300 overflow-hidden gradient-border-hover`}
              >
                {/* Subtle gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative flex flex-col items-center text-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <lang.icon className={`relative h-7 w-7 ${lang.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{lang.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lang.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ──────── TESTIMONIALS SECTION ──────── */}
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-primary/30 to-transparent" />
              <div className="h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">ماذا يقول مستخدمونا؟</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              آراء حقيقية من مطورين يستخدمون استضافة الذئب يومياً
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/70 transition-all duration-300 gradient-border-hover"
              >
                {/* Quote icon */}
                <div className="mb-4">
                  <Quote className="h-6 w-6 text-primary/30 rotate-180" />
                </div>

                {/* Quote text */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Star rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-3.5 w-3.5 fill-primary text-primary"
                    />
                  ))}
                </div>

                <Separator className="mb-4" />

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ──────── PRICING SECTION ──────── */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            {/* Section header decoration */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-primary/30 to-transparent" />
              <div className="h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">خطط الأسعار</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              اختر الخطة المناسبة لك وابدأ استضافة بوتاتك بأسعار تنافسية
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto"
          >
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={`relative rounded-xl border p-6 flex flex-col backdrop-blur-sm transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-card/80 border-primary/40 shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                    : 'bg-card/50 border-border/50 hover:border-border hover:bg-card/70'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md shadow-primary/20 text-xs px-3">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center space-y-3 mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                      plan.highlighted
                        ? 'bg-primary/15 border border-primary/30'
                        : 'bg-primary/10 border border-primary/20'
                    }`}
                  >
                    <plan.icon
                      className={`h-7 w-7 ${
                        plan.highlighted ? 'text-primary' : 'text-primary/70'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold gradient-text">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.currency}{plan.period}
                    </span>
                  </div>
                </div>

                <Separator className="mb-5" />

                {/* Feature list */}
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted/50 text-muted-foreground/40'
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span
                        className={
                          feature.included
                            ? 'text-foreground/80'
                            : 'text-muted-foreground/40'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full ${
                    plan.highlighted
                      ? 'shadow-lg shadow-primary/20'
                      : 'border-primary/30 hover:bg-primary/10 hover:border-primary/50'
                  }`}
                  onClick={() =>
                    plan.name === 'مؤسسات'
                      ? scrollToSection('contact')
                      : setCurrentPage('register')
                  }
                >
                  {plan.ctaLabel}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ──────── FAQ SECTION ──────── */}
        <section id="faq" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            {/* Section header decoration */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-primary/30 to-transparent" />
              <div className="h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">الأسئلة الشائعة</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              إجابات على أكثر الأسئلة شيوعاً حول استضافة الذئب
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-0">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border-border/40 bg-card/30 rounded-lg px-4 mb-2 data-[state=open]:bg-card/60 transition-colors"
                >
                  <AccordionTrigger className="text-right font-semibold text-sm md:text-base hover:no-underline hover:text-primary/90 py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </section>

        {/* ──────── CTA SECTION ──────── */}
        <section className="cta-gradient-bg border-y border-border/30">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <h2 className="text-2xl md:text-4xl font-bold">
                ابدأ الآن{' '}
                <span className="gradient-text">مجاناً</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                انضم إلى أكثر من 1000 مطور يثقون في استضافة الذئب لاستضافة بوتاتهم.
                سجّل الآن واحصل على تجربة استضافة احترافية بدون تكلفة.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/20"
                  onClick={() => setCurrentPage('register')}
                >
                  إنشاء حساب مجاني
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-medium border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => scrollToSection('contact')}
                >
                  <Send className="h-4 w-4 ml-2" />
                  تواصل معنا
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border/50 bg-card/30">
        <div id="contact" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {/* Column 1 — Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🐺</span>
                <span className="font-bold gradient-text text-base">
                  استضافة الذئب
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                منصة استضافة احترافية متخصصة في بوتات تيليجرام. نوفر لك بيئة آمنة
                ومستقرة مع واجهة سهلة الاستخدام ودعم فني متواصل.
              </p>
            </div>

            {/* Column 2 — Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">روابط سريعة</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'المميزات', action: () => scrollToSection('features') },
                  { label: 'خطط الأسعار', action: () => scrollToSection('pricing') },
                  { label: 'اللغات المدعومة', action: () => scrollToSection('languages') },
                  { label: 'الأسئلة الشائعة', action: () => scrollToSection('faq') },
                  { label: 'كيف تبدأ', action: () => {} },
                  { label: 'تسجيل الدخول', action: () => setCurrentPage('login') },
                  { label: 'إنشاء حساب', action: () => setCurrentPage('register') },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Support */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">الدعم</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Headphones className="h-4 w-4 text-primary/60" />
                  دعم فني متواصل 24/7
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary/60" />
                  وقت استجابة سريع
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 text-primary/60" />
                  قناة المطور 1
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 text-primary/60" />
                  القناة الرسمية لاستضافة الذئب
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/60">
              جميع الحقوق محفوظة © {new Date().getFullYear()} استضافة الذئب
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 text-xs border-border/40 bg-transparent hover:bg-primary/5"
              >
                <Send className="h-3 w-3 text-primary/60" />
                <span className="text-muted-foreground">@j49_c</span>
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
