'use client';

import { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Search,
  Wrench,
  Bot,
  Code2,
  Wifi,
  HardDrive,
  FolderOpen,
  LogIn,
  Send,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ─── Animation Variants ─── */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/* ─── FAQ Data ─── */

interface FAQItem {
  question: string;
  answer: string;
}

interface TroubleshootCategory {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  faqs: FAQItem[];
}

const categories: TroubleshootCategory[] = [
  {
    icon: Bot,
    title: 'البوت لا يعمل',
    description: 'مشاكل تتعلق بتشغيل وتوقف البوتات',
    color: 'text-primary',
    bg: 'bg-primary/15',
    border: 'border-primary/20',
    faqs: [
      {
        question: 'البوت يتوقف بعد فترة قصيرة من التشغيل',
        answer: 'تأكد من أن كود البوت لا يحتوي على أخطاء تسبب انهياره. تحقق من السجلات في صفحة السجلات لمشاهدة رسالة الخطأ. تأكد أيضاً من أن توكن البوت صالح وأن المتغيرات البيئية مضبوطة بشكل صحيح.',
      },
      {
        question: 'لا أستطيع تشغيل البوت ويظهر خطأ',
        answer: 'تحقق من صحة ملف البوت الرئيسي (main.py أو index.php). تأكد من أن جميع المكتبات المطلوبة موجودة في ملف requirements.txt أو composer.json. جرب إعادة تشغيل البوت بعد التحقق.',
      },
      {
        question: 'البوت يعمل لكن لا يستجيب للرسائل',
        answer: 'تأكد من أن توكن البوت صالح ومفاده من BotFather. تحقق من أن الكود يتعامل مع الرسائل بشكل صحيح. راجع السجلات للتأكد من عدم وجود أخطاء في استقبال الرسائل.',
      },
    ],
  },
  {
    icon: Code2,
    title: 'أخطاء في الكود',
    description: 'مشاكل برمجية وأخطاء في تنفيذ الكود',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/20',
    faqs: [
      {
        question: 'خطأ ModuleNotFoundError في Python',
        answer: 'هذا يعني أن مكتبة غير مثبتة. أضف اسم المكتبة في ملف requirements.txt وارفعه مجدداً. يمكنك أيضاً استخدام pip install داخل البوت إذا كانت المكتبة غير متوفرة في النظام.',
      },
      {
        question: 'خطأ Syntax Error عند تشغيل البوت',
        answer: 'تحقق من الكود الخاص بك بحثاً عن أخطاء إملائية أو قوس مفقود. استخدم محرر الكود المدمج لمراجعة الملفات. خطأ Syntax يعني أن هناك مشكلة في بنية الكود.',
      },
    ],
  },
  {
    icon: Wifi,
    title: 'مشاكل الشبكة',
    description: 'مشاكل في الاتصال بالإنترنت والطلبات الخارجية',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/20',
    faqs: [
      {
        question: 'البوت لا يستطيع الاتصال بـ Telegram API',
        answer: 'تأكد من أن توكن البوت صالح. تحقق من عدم وجود حظر على عنوان IP الخاص بالخادم. يمكنك اختبار الاتصال باستخدام أمر curl في وحدة التحكم.',
      },
      {
        question: 'طلبات API الخارجية تفشل',
        answer: 'تأكد من أن الخدمة الخارجية تعمل. تحقق من صحة مفاتيح API المستخدمة. بعض الخدمات قد تحظر الطلبات من خوادم مشتركة، تأكد من ذلك.',
      },
    ],
  },
  {
    icon: HardDrive,
    title: 'مشاكل الذاكرة',
    description: 'مشاكل استهلاك الموارد والذاكرة',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/20',
    faqs: [
      {
        question: 'البوت يستهلك ذاكرة عالية',
        answer: 'تحقق من وجود تسرب للذاكرة في الكود (memory leak). تأكد من إغلاق الاتصالات والملفات بعد الاستخدام. راجع صفحة مراقبة الأداء لمتابعة استهلاك الموارد.',
      },
      {
        question: 'البوت يستخدم CPU مرتفع بشكل مستمر',
        answer: 'قد يكون هناك حلقة تكرار لا نهائية (infinite loop). تحقق من وجود while True بدون sleep. راجع الكود بحثاً عن عمليات مكثفة لا حاجة لها.',
      },
    ],
  },
  {
    icon: FolderOpen,
    title: 'مشاكل الملفات',
    description: 'مشاكل في رفع وإدارة ملفات البوت',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/20',
    faqs: [
      {
        question: 'لا أستطيع رفع ملفات كبيرة',
        answer: 'هناك حد أقصى لحجم الملفات. حاول ضغط الملفات قبل رفعها أو تقسيمها. تأكد من أن الملفات ليست أكبر من الحد المسموح في خطتك.',
      },
      {
        question: 'الملفات تختفي بعد إعادة تشغيل البوت',
        answer: 'تأكد من حفظ الملفات في الدليل الصحيح. ملفات البوت مؤقتة وقد يتم حذفها عند إعادة النشر. استخدم مدير الملفات لحفظ الملفات بشكل دائم.',
      },
    ],
  },
  {
    icon: LogIn,
    title: 'مشاكل تسجيل الدخول',
    description: 'مشاكل في الدخول والحساب والمصادقة',
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/20',
    faqs: [
      {
        question: 'لا أستطيع تسجيل الدخول',
        answer: 'تأكد من صحة البريد الإلكتروني وكلمة المرور. إذا نسيت كلمة المرور، استخدم خيار "نسيت كلمة المرور". تأكد من أن حسابك مفعل وليس محظوراً.',
      },
      {
        question: 'تظهر رسالة "الجلسة منتهية" عند تسجيل الدخول',
        answer: 'حاول تسجيل الخروج ثم تسجيل الدخول مجدداً. امسح ملفات تعريف الارتباط (cookies) في المتصفح. إذا استمرت المشكلة، تواصل مع المطور.',
      },
    ],
  },
];

/* ─── FAQ Accordion Component ─── */

function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-lg border border-border/50 bg-muted/30 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors text-right"
            >
              <span className="flex-1">{faq.question}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ChevronDown className="size-4 text-muted-foreground shrink-0" />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                {faq.answer}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.trim().toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (faq) => faq.question.includes(q) || faq.answer.includes(q)
        ),
      }))
      .filter((cat) => cat.faqs.length > 0);
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
                <Wrench className="size-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
                إصلاح مشاكل
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
                حلول سريعة للمشاكل الشائعة
              </p>

              {/* Search Bar */}
              <div className="relative w-full max-w-lg">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث عن مشكلة..."
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

      {/* ─── Troubleshooting Categories ─── */}
      {filteredCategories.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border rounded-xl">
            <CardContent className="p-8 text-center">
              <Search className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                لم يتم العثور على نتائج تطابق بحثك
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
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.title} variants={itemVariants}>
                <Card
                  className={`bg-card border ${cat.border} rounded-xl overflow-hidden`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-11 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`size-5 ${cat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold">{cat.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {cat.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-muted/50 shrink-0"
                      >
                        {cat.faqs.length} حل
                      </Badge>
                    </div>

                    {/* FAQ Items */}
                    <FAQAccordion faqs={cat.faqs} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Contact Developer Section ─── */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden rounded-xl border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent pointer-events-none" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="size-14 rounded-2xl bg-[#229ED9]/15 flex items-center justify-center glow-effect">
                  {/* Telegram SVG Logo */}
                  <svg
                    className="size-7 text-[#229ED9]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                {/* Online availability badge */}
                <span className="absolute -top-1 -left-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 متاح
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">
                  تواصل مع المطور عبر تيليجرام
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  للحصول على الدعم الفني والمساعدة، تواصل مع المطور مباشرة عبر تيليجرام @j49_c
                </p>
              </div>
              <Button
                asChild
                className="gap-2 bg-[#229ED9] hover:bg-[#229ED9]/90 text-white shadow-lg shadow-[#229ED9]/20 transition-all duration-200 hover:shadow-[#229ED9]/30"
              >
                <a href="https://t.me/j49_c" target="_blank" rel="noopener noreferrer">
                  <Send className="size-4" />
                  تواصل عبر تيليجرام @j49_c
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
