'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  Activity,
  Clock,
  Check,
  Crown,
  Sparkles,
  Box,
  Database,
  Radio,
  Globe,
  Building2,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState, useCallback, useEffect } from 'react';

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
    color: 'from-blue-500/20 to-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: FileCode,
    name: 'PHP',
    description: 'PHP 8.2+ مع إضافات متقدمة',
    color: 'from-sky-500/20 to-sky-500/20',
    iconColor: 'text-sky-400',
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
    quote: 'أفضل منصة استضافة بوتات تيليجرام استخدمتها على الإطلاق. السرعة والأمان لا مثيل لهما، والدعم الفني يستجيب فوراً عند الحاجة.',
    name: 'أحمد الراشد',
    role: 'مطور بوتات',
    stars: 5,
    initials: 'أر',
    avatarColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    quote: 'استضافة الذئب وفّرت عليّ الكثير من الوقت والجهد. الواجهة سهلة جداً والبوت يعمل بدون انقطاع منذ أشهر طويلة.',
    name: 'سارة المنصوري',
    role: 'مديرة مشاريع',
    stars: 5,
    initials: 'سم',
    avatarColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    quote: 'الميزات المتقدمة مثل السجلات المباشرة وإعادة التشغيل التلقائي جعلت إدارة البوتات تجربة ممتعة ومريحة بالفعل.',
    name: 'محمد العتيبي',
    role: 'مبرمج مستقل',
    stars: 4,
    initials: 'مع',
    avatarColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

const techStack = [
  { icon: Box, name: 'Docker', description: 'حاويات معزولة' },
  { icon: Server, name: 'Node.js', description: 'بيئة تشغيل سريعة' },
  { icon: FileCode, name: 'TypeScript', description: 'أنواع آمنة' },
  { icon: Database, name: 'PostgreSQL', description: 'قاعدة بيانات قوية' },
  { icon: Zap, name: 'Redis', description: 'تخزين مؤقت سريع' },
  { icon: Radio, name: 'WebSocket', description: 'اتصال فوري في الوقت الحقيقي' },
  { icon: Globe, name: 'Nginx', description: 'خادم ويب عالي الأداء' },
  { icon: Shield, name: 'SSL/TLS', description: 'تشفير آمن' },
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
    price: '$0',
    currency: '',
    period: '/شهر',
    description: 'مثالي للمبتدئين والمشاريع الصغيرة',
    badge: null,
    highlighted: false,
    features: [
      { text: '2 بوتات', included: true },
      { text: '256MB ذاكرة RAM', included: true },
      { text: 'ملفات (قراءة فقط)', included: true },
      { text: 'API keys', included: false, proOnly: false },
      { text: 'Webhooks', included: false, proOnly: false },
      { text: 'مراقبة متقدمة', included: false, proOnly: true },
      { text: 'دعم أولوي', included: false, proOnly: true },
    ],
    ctaLabel: 'ابدأ مجاناً',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'احترافي',
    icon: Crown,
    price: '$9.99',
    currency: '',
    period: '/شهر',
    description: 'الأفضل للمطورين المحترفين',
    badge: 'الأكثر شعبية',
    highlighted: true,
    features: [
      { text: '10 بوتات', included: true },
      { text: '1GB ذاكرة RAM', included: true },
      { text: 'ملفات كاملة', included: true },
      { text: 'API keys', included: true, proOnly: true },
      { text: 'Webhooks', included: true, proOnly: true },
      { text: 'مراقبة متقدمة', included: true },
      { text: 'دعم أولوي', included: true },
    ],
    ctaLabel: 'تواصل مع المطور',
    ctaVariant: 'default' as const,
  },
  {
    name: 'مؤسسات',
    icon: Building2,
    price: '$29.99',
    currency: '',
    period: '/شهر',
    description: 'للشركات والمشاريع الكبيرة',
    badge: null,
    highlighted: false,
    features: [
      { text: '50 بوت', included: true },
      { text: '4GB ذاكرة RAM', included: true },
      { text: 'ملفات كاملة', included: true },
      { text: 'API متقدم', included: true },
      { text: 'Webhooks', included: true },
      { text: 'كل الميزات', included: true },
      { text: 'دعم مخصص', included: true },
    ],
    ctaLabel: 'تواصل مع المطور',
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  }),
};

const testimonialCardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const pricingCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const backToTopVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const sectionSeparatorVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

/* ─── Section Separator Decoration ────────────────────── */
function SectionSeparator() {
  return (
    <motion.div
      variants={sectionSeparatorVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-6xl mx-auto px-8 py-4"
    >
      <div className="h-px bg-gradient-to-l from-transparent via-primary/20 to-transparent origin-center" />
    </motion.div>
  );
}

/* ─── Loading Skeleton ────────────────────────────────── */
function LandingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav skeleton */}
      <div className="sticky top-0 z-50 h-16 border-b border-border/20 bg-background/80 backdrop-blur-md flex items-center px-4">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="hidden md:flex gap-8">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
      {/* Hero skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center py-32 px-4">
        <Skeleton className="w-32 h-32 rounded-full mb-8" />
        <Skeleton className="h-12 w-72 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <Skeleton className="h-5 w-80 mb-6" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-40 rounded-lg" />
          <Skeleton className="h-12 w-40 rounded-lg" />
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Component ───────────────────────────────────────── */

export default function Landing() {
  const { setCurrentPage } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return <LandingSkeleton />;
  }

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
          <motion.button
            onClick={scrollToTop}
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <img src="https://f.top4top.io/p_37210bgwm1.jpg" alt="استضافة الذئب" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold gradient-text text-base md:text-lg">
              استضافة الذئب
            </span>
          </motion.button>

          {/* Center Nav Links — desktop */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'المميزات', id: 'features' },
              { label: 'الأسعار', id: 'pricing' },
              { label: 'اللغات', id: 'languages' },
              { label: 'التقنيات', id: 'technologies' },
              { label: 'آراء العملاء', id: 'testimonials' },
              { label: 'الأسئلة الشائعة', id: 'faq' },
              { label: 'تواصل', id: 'contact' },
            ].map((link) => (
              <motion.button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group py-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
                <span className="absolute bottom-0 right-0 h-px w-0 bg-primary/50 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </div>

          {/* Buttons — left side (RTL) */}
          <div className="hidden md:flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setCurrentPage('login')}
              >
                تسجيل الدخول
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="text-sm shadow-md shadow-primary/10"
                onClick={() => setCurrentPage('register')}
              >
                إنشاء حساب
              </Button>
            </motion.div>
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
              {[
                { label: 'المميزات', id: 'features' },
                { label: 'الأسعار', id: 'pricing' },
                { label: 'اللغات', id: 'languages' },
                { label: 'التقنيات', id: 'technologies' },
                { label: 'آراء العملاء', id: 'testimonials' },
                { label: 'الأسئلة الشائعة', id: 'faq' },
                { label: 'تواصل', id: 'contact' },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
                >
                  {link.label}
                </button>
              ))}
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
        <section className="relative overflow-hidden min-h-[85vh] md:min-h-[90vh] flex flex-col">
          {/* ── Background Layers ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient mesh blobs */}
            <div className="mesh-particle-1 absolute top-[8%] right-[12%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="mesh-particle-2 absolute bottom-[5%] left-[8%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[80px]" />
            <div className="mesh-particle-3 absolute top-[45%] left-[50%] w-[350px] h-[350px] rounded-full bg-primary/4 blur-[90px]" />

            {/* Subtle grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(oklch(0.60 0.20 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.60 0.20 250) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />

            {/* ── Floating Geometric Particles ── */}
            <div className="hero-particle hero-particle-1 rounded-full bg-primary/20 w-3 h-3 md:w-4 md:h-4" style={{ top: '12%', right: '18%' }} />
            <div className="hero-particle hero-particle-2 particle-hexagon bg-primary/15 w-4 h-4 md:w-5 md:h-5" style={{ top: '18%', left: '12%' }} />
            <div className="hero-particle hero-particle-3 rounded-full bg-primary/25 w-2 h-2 md:w-3 md:h-3" style={{ top: '35%', right: '8%' }} />
            <div className="hero-particle hero-particle-4 particle-diamond bg-primary/20 w-3 h-3 md:w-4 md:h-4" style={{ top: '55%', left: '6%' }} />
            <div className="hero-particle hero-particle-5 particle-hexagon bg-primary/10 w-5 h-5 md:w-6 md:h-6" style={{ top: '8%', left: '45%' }} />
            <div className="hero-particle hero-particle-6 rounded-full bg-primary/18 w-2.5 h-2.5 md:w-3 md:h-3" style={{ top: '70%', right: '14%' }} />
            <div className="hero-particle hero-particle-7 particle-triangle bg-primary/15 w-3 h-3 md:w-4 md:h-4" style={{ top: '42%', left: '18%' }} />
            <div className="hero-particle hero-particle-8 rounded-full bg-primary/12 w-2 h-2 md:w-3 md:h-3" style={{ top: '80%', left: '55%' }} />
            <div className="hero-particle hero-particle-9 particle-diamond bg-primary/10 w-3.5 h-3.5 md:w-4 md:h-4" style={{ top: '22%', right: '38%' }} />
            <div className="hero-particle hero-particle-10 particle-hexagon bg-primary/14 w-2.5 h-2.5 md:w-3 md:h-3" style={{ top: '65%', left: '32%' }} />
            <div className="hero-particle hero-particle-11 rounded-full bg-primary/20 w-1.5 h-1.5 md:w-2 md:h-2" style={{ top: '48%', right: '4%' }} />
            <div className="hero-particle hero-particle-12 particle-triangle bg-primary/12 w-4 h-4 md:w-5 md:h-5" style={{ top: '75%', left: '8%' }} />
          </div>

          {/* ── Main Hero Content ── */}
          <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-28 flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center space-y-6 md:space-y-8"
            >
              {/* ═══ Wolf Logo Centerpiece ═══ */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative float-animation w-[140px] h-[140px] md:w-[180px] md:h-[180px]">
                  {/* Outer orbit ring */}
                  <div className="wolf-orbit-ring absolute inset-0 rounded-full" style={{ border: '1.5px dashed oklch(0.60 0.20 250 / 15%)' }}>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/60" />
                  </div>

                  {/* Inner orbit ring (reverse) */}
                  <div className="wolf-orbit-ring-reverse absolute rounded-full" style={{ inset: '18px', border: '1px solid oklch(0.60 0.20 250 / 10%)' }}>
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/40" />
                  </div>

                  {/* Pulsing glow behind logo */}
                  <div className="wolf-glow-enhanced absolute rounded-full" style={{ inset: '30px' }} />

                  {/* Wolf Head SVG Silhouette */}
                  <div className="wolf-svg-glow absolute inset-0 flex items-center justify-center">
                    <img src="https://f.top4top.io/p_37210bgwm1.jpg" alt="استضافة الذئب" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover" />
                  </div>

                  {/* Corner accent dots */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full pulse-dot" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-primary/60 rounded-full pulse-dot" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 -right-2 w-2 h-2 bg-primary/30 rounded-full pulse-dot" style={{ animationDelay: '1.5s' }} />
                </div>
              </motion.div>

              {/* ═══ Title + Version Badge ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold hero-gradient-text">
                    استضافة الذئب
                  </h1>
                  <Badge
                    variant="outline"
                    className="text-[10px] md:text-xs px-2 py-0 h-5 md:h-6 border-primary/25 bg-primary/5 text-primary/70 font-mono self-start mt-2"
                  >
                    v0.2
                  </Badge>
                </div>

                <p className="typewriter-reveal text-lg md:text-2xl text-primary/80 font-medium">
                  منصة استضافة احترافية لبوتات تيليجرام
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                استضف بوتاتك على بيئة آمنة ومستقرة مع دعم كامل للغات البرمجة
                الشائعة. تحكم كامل في بوتاتك مع واجهة سهلة الاستخدام وإدارة متقدمة.
              </motion.p>

              {/* ═══ Stats Inline Badges ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap justify-center gap-2 md:gap-3"
              >
                {[
                  { icon: Bot, text: '+1000 بوت' },
                  { icon: Activity, text: '99.9% وقت تشغيل' },
                  { icon: Headphones, text: '24/7 دعم' },
                ].map((badge) => (
                  <motion.div
                    key={badge.text}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="stat-badge-inline flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs md:text-sm text-primary/80 font-medium"
                  >
                    <badge.icon className="h-3.5 w-3.5" />
                    <span>{badge.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* ═══ CTA Buttons ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
              >
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    size="lg"
                    className="cta-gradient-border h-12 px-8 text-base font-medium shadow-lg shadow-primary/25"
                    onClick={() => setCurrentPage('login')}
                  >
                    تسجيل الدخول
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </motion.span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="btn-shimmer-effect glass-shimmer h-12 px-8 text-base font-medium border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                    onClick={() => setCurrentPage('register')}
                  >
                    إنشاء حساب
                  </Button>
                </motion.div>
              </motion.div>

              {/* Watch Demo decorative link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.85 }}
                className="pt-1"
              >
                <motion.button
                  className="demo-link-animated inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground/60 hover:text-primary/70 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>مشاهدة العرض التوضيحي</span>
                  <span className="text-[10px]">▶</span>
                </motion.button>
              </motion.div>

              {/* ═══ Trust Indicators ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex flex-wrap justify-center gap-3 pt-4"
              >
                {[
                  { icon: Lock, title: 'حماية SSL', desc: 'تشفير متقدم' },
                  { icon: Clock, title: 'وقت تشغيل عالي', desc: '99.9% ضمان' },
                  { icon: Headphones, title: 'دعم فني متواصل', desc: '24/7 جاهزون' },
                ].map((badge) => (
                  <motion.div
                    key={badge.title}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="trust-badge-animated flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/40 backdrop-blur-sm cursor-default"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                      <badge.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground/80">{badge.title}</p>
                      <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="flex justify-center pt-10 md:pt-14"
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

        <SectionSeparator />

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
                whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' as const } }}
                className="group card-glow-hover fade-scale-in rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-all duration-300 gradient-border-hover cursor-default"
              >
                <div className="flex items-start gap-4 relative">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="glow-pulse-active relative w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
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

        <SectionSeparator />

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
                {step.step < 3 && (
                  <div className="md:hidden text-primary/30">
                    <ArrowLeft className="h-5 w-5 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        <SectionSeparator />

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
                whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' as const } }}
                className={`group card-glow-hover fade-scale-in relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/8 transition-all duration-300 overflow-hidden gradient-border-hover cursor-default`}
              >
                {/* Subtle gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative flex flex-col items-center text-center gap-3">
                  {/* Animated icon container */}
                  <motion.div
                    className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0], transition: { duration: 0.5, ease: 'easeOut' } }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <lang.icon className={`relative h-7 w-7 ${lang.iconColor}`} />
                  </motion.div>
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

        <SectionSeparator />

        {/* ──────── TECHNOLOGIES SECTION ──────── */}
        <section id="technologies" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
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
            <h2 className="text-2xl md:text-3xl font-bold mb-3">التقنيات المستخدمة</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              نبني منصتنا باستخدام أحدث التقنيات لضمان الأداء والاستقرار
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' as const } }}
                className="group card-glow-hover fade-scale-in rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 hover:bg-card/80 transition-all duration-300 gradient-border-hover cursor-default text-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                      <tech.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{tech.name}</h3>
                    <p className="text-xs text-muted-foreground">{tech.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <SectionSeparator />

        {/* ──────── PRICING SECTION ──────── */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
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
                variants={pricingCardVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: 'easeOut' },
                  boxShadow: plan.highlighted
                    ? '0 20px 60px -12px oklch(0.60 0.20 250 / 0.25)'
                    : '0 20px 40px -12px oklch(0.60 0.20 250 / 0.1)',
                }}
                className={`relative rounded-xl border p-6 flex flex-col backdrop-blur-sm transition-all duration-300 ${
                  plan.highlighted
                    ? 'pricing-card-recommended card-glow-hover bg-card/80 border-primary/40 shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                    : 'card-glow-hover bg-card/50 border-border/50 hover:border-border hover:bg-card/70 hover:shadow-lg hover:shadow-primary/5'
                }`}
              >
                {plan.badge && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, type: 'spring' as const, stiffness: 300, damping: 15 }}
                  >
                    <Badge className="bg-primary text-primary-foreground shadow-md shadow-primary/20 text-xs px-3">
                      {plan.badge}
                    </Badge>
                  </motion.div>
                )}

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
                      {'proOnly' in feature && feature.proOnly && !feature.included && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 border-primary/30 text-primary/60 bg-primary/5 mr-auto"
                        >
                          برو
                        </Badge>
                      )}
                      {'proOnly' in feature && feature.proOnly && feature.included && (
                        <Badge
                          className="text-[9px] px-1.5 py-0 bg-primary/15 text-primary border-0 mr-auto"
                        >
                          برو
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant={plan.ctaVariant}
                    className={`btn-shimmer-effect w-full ${
                      plan.highlighted
                        ? 'shadow-lg shadow-primary/20'
                        : 'border-primary/30 hover:bg-primary/10 hover:border-primary/50'
                    }`}
                    onClick={() =>
                      (plan.name === 'احترافي' || plan.name === 'مؤسسات')
                        ? scrollToSection('contact')
                        : setCurrentPage('register')
                    }
                  >
                    {plan.ctaLabel}
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing Note */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
              <MessageSquare className="h-4 w-4 text-primary/60" />
              <span className="text-sm text-muted-foreground">
                لتطوير الخطة يجب التواصل مع المطور عبر تيليجرام
              </span>
            </div>
          </motion.div>
        </section>

        <SectionSeparator />

        {/* ──────── TESTIMONIALS SECTION ──────── */}
        <section id="testimonials" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
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
            <h2 className="text-2xl md:text-3xl font-bold mb-3">ماذا يقول عملاؤنا</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              آراء حقيقية من مطورين يستخدمون استضافة الذئب يومياً
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-2xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: 'easeOut' as const }}
                  className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-8 hover:bg-card/70 hover:border-primary/20 transition-all duration-300 gradient-border-hover"
                >
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-primary/20 rotate-180" />
                  </div>

                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </p>

                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-4 w-4 ${j < testimonials[activeTestimonial].stars ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>

                  <Separator className="mb-5" />

                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${testimonials[activeTestimonial].avatarColor}`}>
                      <span className="text-sm font-bold">
                        {testimonials[activeTestimonial].initials}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{testimonials[activeTestimonial].name}</p>
                      <p className="text-xs text-muted-foreground">{testimonials[activeTestimonial].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-center gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-9 h-9 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-center hover:bg-card/80 hover:border-primary/30 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="w-9 h-9 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-center hover:bg-card/80 hover:border-primary/30 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeTestimonial
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <SectionSeparator />

        {/* ──────── FAQ SECTION ──────── */}
        <section id="faq" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
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
                  className="faq-item border-border/40 bg-card/30 rounded-lg px-4 mb-2 data-[state=open]:bg-card/60 data-[state=open]:border-primary/20 hover:bg-primary/5 hover:border-primary/15 transition-colors"
                >
                  <AccordionTrigger className="text-right font-semibold text-sm md:text-base hover:no-underline hover:text-primary/90 py-4 transition-colors duration-200 [&>svg]:transition-transform [&>svg]:duration-300">
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

        <SectionSeparator />

        {/* ──────── CONTACT/TELEGRAM SECTION ──────── */}
        <section id="contact" className="max-w-6xl mx-auto px-4 py-16 md:py-24 scroll-mt-20">
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
            <h2 className="text-2xl md:text-3xl font-bold mb-3">تواصل معنا</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              طريقة التواصل الوحيدة عبر تيليجرام — نساعدك في أسرع وقت
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-card/50 backdrop-blur-sm p-8 text-center space-y-6"
            >
              {/* Telegram Icon */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="relative w-20 h-20 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold">تواصل عبر تيليجرام</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  للحصول على دعم فني أو الاستفسار عن خطط الأسعار أو أي طلب آخر، تواصل معنا مباشرة عبر تيليجرام
                </p>
              </div>

              {/* Telegram Contact Button */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <a
                  href="https://t.me/j49_c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 h-12 px-8 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium shadow-lg shadow-[#0088cc]/20 transition-all duration-300 text-base"
                >
                  <Send className="h-5 w-5" />
                  تواصل مع المطور عبر تيليجرام
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </a>
              </motion.div>

              {/* Additional Info */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Clock, label: 'ساعات العمل', value: '24/7' },
                  { icon: Zap, label: 'وقت الاستجابة', value: 'سريع' },
                  { icon: Shield, label: 'دعم آمن', value: 'مباشر' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-background/40 border border-border/30">
                    <item.icon className="h-4 w-4 text-primary/70" />
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
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
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/20"
                    onClick={() => setCurrentPage('register')}
                  >
                    إنشاء حساب مجاني
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-base font-medium border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    onClick={() => scrollToSection('contact')}
                  >
                    <Send className="h-4 w-4 ml-2" />
                    تواصل معنا
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative border-t border-border/50 bg-card/30 overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-[20%] w-[400px] h-[200px] rounded-full bg-primary/3 blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-0 left-[10%] w-[300px] h-[150px] rounded-full bg-primary/3 blur-[60px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>

        <div id="contact" className="relative max-w-6xl mx-auto px-4 py-12 scroll-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {/* Column 1 — Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <img src="https://f.top4top.io/p_37210bgwm1.jpg" alt="استضافة الذئب" className="w-8 h-8 rounded-full object-cover" />
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
                  { label: 'التقنيات المستخدمة', action: () => scrollToSection('technologies') },
                  { label: 'آراء العملاء', action: () => scrollToSection('testimonials') },
                  { label: 'الأسئلة الشائعة', action: () => scrollToSection('faq') },
                  { label: 'كيف تبدأ', action: () => {} },
                  { label: 'تسجيل الدخول', action: () => setCurrentPage('login') },
                  { label: 'إنشاء حساب', action: () => setCurrentPage('register') },
                  { label: 'سياسة الخصوصية', action: () => setCurrentPage('privacy') },
                  { label: 'شروط الاستخدام', action: () => setCurrentPage('terms') },
                ].map((link) => (
                  <li key={link.label}>
                    <motion.button
                      onClick={link.action}
                      className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group inline-block"
                      whileHover={{ x: 4 }}
                    >
                      {link.label}
                      <span className="absolute bottom-0 right-0 h-px w-0 bg-primary/40 group-hover:w-full transition-all duration-300" />
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Support / Telegram Only */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">الدعم</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 text-[#0088cc]" />
                  <a href="https://t.me/j49_c" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    @j49_c — المطور
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary/60" />
                  متواصل 24/7 عبر تيليجرام
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Headphones className="h-4 w-4 text-primary/60" />
                  دعم فني مباشر وسريع
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <p className="text-xs text-muted-foreground/60">
                جميع الحقوق محفوظة © {new Date().getFullYear()} استضافة الذئب
              </p>
              <span className="text-xs text-muted-foreground/30">|</span>
              <button
                onClick={() => setCurrentPage('privacy')}
                className="text-xs text-muted-foreground/50 hover:text-primary/70 transition-colors"
              >
                سياسة الخصوصية
              </button>
              <span className="text-xs text-muted-foreground/30">|</span>
              <button
                onClick={() => setCurrentPage('terms')}
                className="text-xs text-muted-foreground/50 hover:text-primary/70 transition-colors"
              >
                شروط الاستخدام
              </button>
            </div>
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

      {/* ═══════════ BACK TO TOP BUTTON ═══════════ */}
      {showBackToTop && (
        <motion.button
          variants={backToTopVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={scrollToTop}
          className="scroll-to-top-btn fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="العودة إلى الأعلى"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
}
