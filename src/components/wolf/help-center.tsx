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
  Play,
  Clock,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Lightbulb,
  Bug,
  Settings,
  Users,
  FileDown,
  MonitorDot,
  Sparkles,
  Layers,
  Zap,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  KeyRound,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useAppStore } from '@/store/app-store';

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

/* ─── Interactive FAQ Data (Enhancement 1) ─── */

type FAQCategory = 'عام' | 'البوتات' | 'الفواتير' | 'الفريق' | 'تقني';

interface InteractiveFAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
}

const faqItems: InteractiveFAQ[] = [
  {
    id: 'faq-1',
    question: 'كيف أنشئ بوت جديد؟',
    answer: 'انتقل إلى صفحة البوتات من القائمة الجانبية، ثم اضغط على زر "إنشاء بوت جديد". أدخل اسم البوت، اختر لغة البرمجة (Python أو PHP)، وحدد إعدادات الموارد. سيتم إنشاء البوت وبيئة التشغيل تلقائياً.',
    category: 'البوتات',
  },
  {
    id: 'faq-2',
    question: 'كيف أربط بوتي بتيليجرام؟',
    answer: 'احصل على توكن البوت من BotFather عبر تيليجرام. انتقل إلى صفحة تفاصيل البوت، ثم أضف التوكن في قسم المتغيرات البيئية تحت اسم BOT_TOKEN. أعد تشغيل البوت لتفعيل الاتصال.',
    category: 'البوتات',
  },
  {
    id: 'faq-3',
    question: 'ما هي خطط الأسعار؟',
    answer: 'نوفر 3 خطط: مجانية (بوت واحد، موارد محدودة)، احترافية (5 بوتات، موارد أعلى، دعم أولوية)، ومؤسسية (بوتات غير محدودة، موارد مخصصة، دعم مخصص). تحقق من صفحة الأسعار للحصول على التفاصيل الكاملة.',
    category: 'الفواتير',
  },
  {
    id: 'faq-4',
    question: 'كيف أرفع ملفات البوت؟',
    answer: 'انتقل إلى صفحة تفاصيل البوت، ثم افتح علامة التبويب "الملفات". استخدم زر "رفع ملف" أو اسحب وأفلت الملفات مباشرة. يمكنك أيضاً استخدام محرر الكود المدمج لإنشاء وتعديل الملفات.',
    category: 'البوتات',
  },
  {
    id: 'faq-5',
    question: 'كيف أراقب أداء البوت؟',
    answer: 'انتقل إلى صفحة "مراقبة الأداء" من القائمة الجانبية. ستعرض لك لوحة المراقبة مقاييس الأداء في الوقت الفعلي مثل CPU، الذاكرة، الشبكة، ومعدل الطلبات. يمكنك أيضاً مراجعة صفحة "تحليلات البوتات" لمزيد من التفاصيل.',
    category: 'تقني',
  },
  {
    id: 'faq-6',
    question: 'كيف أضيف متغيرات البيئة؟',
    answer: 'افتح صفحة تفاصيل البوت وانتقل إلى علامة التبويب "المتغيرات البيئية". أضف أزواج المفتاح والقيمة المطلوبة (مثل BOT_TOKEN، API_KEY). احفظ التغييرات وأعد تشغيل البوت لتطبيقها.',
    category: 'تقني',
  },
  {
    id: 'faq-7',
    question: 'ما هي حدود الاستضافة المجانية؟',
    answer: 'الخطة المجانية توفر: 3 بوتات، 512MB ذاكرة RAM، 1GB مساحة تخزين. يمكنك الترقية إلى الخطة الاحترافية أو المؤسسية لمزيد من الموارد والميزات المتقدمة.',
    category: 'الفواتير',
  },
  {
    id: 'faq-8',
    question: 'كيف أتواصل مع الدعم؟',
    answer: 'يمكنك التواصل مع فريق الدعم عبر تيليجرام @j49_c مباشرة. نقدم دعم على مدار الساعة. يمكنك أيضاً استخدام قسم "الإبلاغ عن مشكلة" في صفحة المساعدة.',
    category: 'عام',
  },
  {
    id: 'faq-9',
    question: 'هل يمكنني تصدير البوت؟',
    answer: 'نعم، يمكنك تصدير جميع ملفات البوت وبيئته. انتقل إلى صفحة تفاصيل البوت، ثم اختر "تصدير" من قائمة الإعدادات. سيتم تنزيل أرشيف يحتوي على جميع ملفات البوت ومتغيرات البيئة.',
    category: 'البوتات',
  },
  {
    id: 'faq-10',
    question: 'كيف أدير فريق العمل؟',
    answer: 'انتقل إلى صفحة "إدارة الفريق" من القائمة الجانبية. يمكنك إضافة أعضاء جدد، تعيين أدوار (مدير، مطور، مشاهد)، وإدارة صلاحيات الوصول لكل بوت وميزة في المنصة.',
    category: 'الفريق',
  },
  {
    id: 'faq-11',
    question: 'كيف أحمي بوتي؟',
    answer: 'فعّل المصادقة الثنائية (2FA) لحسابك، راجع صلاحيات API وتأكد من استخدامها بشكل صحيح، لا تشارك توكن البوت مع أي شخص، واستخدم متغيرات البيئة لتخزين المفاتيح الحساسة بدلاً من وضعها في الكود مباشرة.',
    category: 'تقني',
  },
  {
    id: 'faq-12',
    question: 'ما هي متطلبات بوت تيليجرام؟',
    answer: 'تحتاج إلى Python 3.9+ أو Node.js 18+ كبيئة تشغيل. مع Python، استخدم مكتبة python-telegram-bot أو aiogram. مع Node.js، استخدم مكتبة telegraf أو grammy. تأكد من وجود ملف requirements.txt أو package.json.',
    category: 'تقني',
  },
];

const faqCategories: { value: FAQCategory; label: string; color: string }[] = [
  { value: 'عام', label: 'عام', color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
  { value: 'البوتات', label: 'البوتات', color: 'bg-primary/15 text-primary border-primary/20' },
  { value: 'الفواتير', label: 'الفواتير', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  { value: 'الفريق', label: 'الفريق', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  { value: 'تقني', label: 'تقني', color: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
];

/* ─── Video Tutorials Data (Enhancement 2) ─── */

interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  gradient: string;
  icon: React.ElementType;
}

const videoTutorials: VideoTutorial[] = [
  {
    id: 'vid-1',
    title: 'إنشاء بوت تيليجرام من الصفر',
    duration: '12:30',
    difficulty: 'مبتدئ',
    gradient: 'from-blue-600/30 to-cyan-600/20',
    icon: Bot,
  },
  {
    id: 'vid-2',
    title: 'ربط البوت بـ BotFather والحصول على التوكن',
    duration: '08:45',
    difficulty: 'مبتدئ',
    gradient: 'from-primary/30 to-blue-600/20',
    icon: KeyRound,
  },
  {
    id: 'vid-3',
    title: 'إدارة المتغيرات البيئية بشكل احترافي',
    duration: '15:20',
    difficulty: 'متوسط',
    gradient: 'from-emerald-600/30 to-teal-600/20',
    icon: Settings,
  },
  {
    id: 'vid-4',
    title: 'مراقبة الأداء وحل المشاكل',
    duration: '18:10',
    difficulty: 'متوسط',
    gradient: 'from-amber-600/30 to-orange-600/20',
    icon: MonitorDot,
  },
  {
    id: 'vid-5',
    title: 'نشر البوت باستخدام Git والتحديث التلقائي',
    duration: '22:00',
    difficulty: 'متقدم',
    gradient: 'from-violet-600/30 to-purple-600/20',
    icon: Code2,
  },
  {
    id: 'vid-6',
    title: 'بناء بوت متقدم مع قاعدة بيانات',
    duration: '28:45',
    difficulty: 'متقدم',
    gradient: 'from-rose-600/30 to-pink-600/20',
    icon: Zap,
  },
];

/* ─── Troubleshooting Guide Data (Enhancement 3) ─── */

interface TroubleshootIssue {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
  steps: string[];
  advancedSolution: string;
}

const troubleshootIssues: TroubleshootIssue[] = [
  {
    id: 'ts-1',
    icon: AlertTriangle,
    title: 'البوت يتوقف بعد بدء التشغيل',
    description: 'يتوقف البوت تلقائياً بعد ثوانٍ قليلة من بدء التشغيل دون رسالة خطأ واضحة.',
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    steps: [
      'افتح صفحة السجلات (Logs) من تفاصيل البوت',
      'ابحث عن رسائل الخطأ الحمراء في آخر 50 سطر',
      'تحقق من صحة ملف requirements.txt أو composer.json',
      'تأكد من أن جميع المتغيرات البيئية مُعرّفة بشكل صحيح',
      'جرب تشغيل البوت محلياً أولاً للتأكد من عمل الكود',
    ],
    advancedSolution: 'إذا لم تحل المشكلة، تحقق من وجود تبعيات دائرية في الكود أو استدعاءات asyncio غير صحيحة. استخدم الأمر `python -c "import main"` في وحدة التحكم لاختبار الاستيرادات.',
  },
  {
    id: 'ts-2',
    icon: Wifi,
    title: 'البوت لا يستجيب للرسائل',
    description: 'البوت يعمل ولكنه لا يرد على الرسائل المرسلة من المستخدمين.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    steps: [
      'تحقق من صحة توكن البوت BOT_TOKEN',
      'تأكد من أن معالج الرسائل (message handler) مفعّل في الكود',
      'تحقق من أن البوت ليس في وضع privacy (إعدادات BotFather)',
      'راجع السجلات للتأكد من استقبال الرسائل',
      'أرسل رسالة اختبار مباشرة للبوت (ليس في مجموعة)',
    ],
    advancedSolution: 'إذا كنت تستخدم webhooks، تأكد من أن عنوان URL صحيح ويمكن الوصول إليه. في وضع polling، تحقق من عدم وجود أخطاء في حلقة التحديث. جرب إعادة تعيين webhook باستخدام `deleteWebhook` قبل التبديل إلى polling.',
  },
  {
    id: 'ts-3',
    icon: Bug,
    title: 'خطأ ModuleNotFoundError عند التشغيل',
    description: 'ظهور خطأ يتعلق بمكتبة غير موجودة عند محاولة تشغيل البوت.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    steps: [
      'حدد اسم المكتبة المفقودة من رسالة الخطأ',
      'أضف اسم المكتبة في ملف requirements.txt',
      'ارفع ملف requirements.txt المحدّث',
      'أعد تشغيل البوت لتثبيت المكتبات الجديدة',
    ],
    advancedSolution: 'تأكد من إصدار المكتبة المطلوب. بعض المكتبات قد تحتاج إصدارات محددة. استخدم `package==version` في requirements.txt. إذا كانت المكتبة ليست في PyPI، قد تحتاج إلى تثبيتها يدوياً عبر وحدة التحكم.',
  },
  {
    id: 'ts-4',
    icon: HardDrive,
    title: 'استهلاك ذاكرة مرتفع',
    description: 'البوت يستهلك كمية كبيرة من الذاكرة مما يؤثر على الأداء.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    steps: [
      'افتح صفحة مراقبة الأداء لمراجعة استهلاك الموارد',
      'تحقق من وجود تسرب للذاكرة (memory leak) في الكود',
      'تأكد من إغلاق الاتصالات والملفات بعد الاستخدام',
      'راجع القوائم والكائنات الكبيرة المُخزّنة في الذاكرة',
      'فعّل جمع القمامة (garbage collection) يدوياً إذا لزم الأمر',
    ],
    advancedSolution: 'استخدم أدوات مثل `tracemalloc` في Python لتتبع تخصيص الذاكرة. أضف `gc.collect()` في نقاط استراتيجية. فكر في استخدام redis أو قاعدة بيانات بدلاً من تخزين البيانات في الذاكرة.',
  },
];

/* ─── Quick Links Data (Enhancement 4) ─── */

interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  external?: boolean;
  color: string;
  bg: string;
}

/* ─── Original FAQ Data ─── */

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

/* ─── Troubleshoot Card Component ─── */

function TroubleshootCard({ issue }: { issue: TroubleshootIssue }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = issue.icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' as const }}
    >
      <Card className="glass-enhanced border-border/50 overflow-hidden card-hover-lift">
        <CardContent className="p-5 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className={`size-10 rounded-xl ${issue.bg} flex items-center justify-center shrink-0 mt-0.5`}
            >
              <Icon className={`size-5 ${issue.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-1">{issue.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {issue.description}
              </p>
            </div>
          </div>

          {/* Steps Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="size-3.5" />
            </motion.div>
            <span>{expanded ? 'إخفاء الخطوات' : `عرض ${issue.steps.length} خطوات`}</span>
          </button>

          {/* Steps Content */}
          <motion.div
            initial={false}
            animate={{
              height: expanded ? 'auto' : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' as const }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2 border-t border-border/30">
              {issue.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span
                    className={`size-5 rounded-full ${issue.bg} flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${issue.color}`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    {step}
                  </span>
                </div>
              ))}
              {issue.advancedSolution && (
                <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/30">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="size-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400">
                      حل متقدم
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {issue.advancedSolution}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
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

  
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState<FAQCategory | 'الكل'>('الكل');

  const filteredFaqs = useMemo(() => {
    let items = faqItems;
    if (activeFaqCategory !== 'الكل') {
      items = items.filter((f) => f.category === activeFaqCategory);
    }
    if (faqSearch.trim()) {
      const q = faqSearch.trim();
      items = items.filter(
        (f) => f.question.includes(q) || f.answer.includes(q)
      );
    }
    return items;
  }, [faqSearch, activeFaqCategory]);

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

      {/* ─── Interactive FAQ Section ─── */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-xl border border-border overflow-hidden neon-border-glow">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardContent className="relative p-5 md:p-6 space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <HelpCircle className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">الأسئلة الشائعة</h2>
                <p className="text-xs text-muted-foreground">
                  ابحث عن إجابات سريعة لأسئلتك
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] bg-primary/10 text-primary border-primary/20 mr-auto"
              >
                {filteredFaqs.length} سؤال
              </Badge>
            </div>

            {/* FAQ Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث في الأسئلة..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="pr-10 pl-4 h-10 bg-muted/50 border-border/50 rounded-lg text-sm focus:ring-primary/30 focus:border-primary/50"
              />
              {faqSearch && (
                <button
                  onClick={() => setFaqSearch('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-xs">✕</span>
                </button>
              )}
            </div>

            {/* Category Filter Tags */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFaqCategory('الكل')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border ${
                  activeFaqCategory === 'الكل'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground'
                }`}
              >
                الكل
              </button>
              {faqCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() =>
                    setActiveFaqCategory(
                      activeFaqCategory === cat.value ? 'الكل' : cat.value
                    )
                  }
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border ${
                    activeFaqCategory === cat.value
                      ? cat.color
                      : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-border hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ Accordion */}
            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center">
                <HelpCircle className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  لا توجد نتائج تطابق بحثك
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-1">
                {filteredFaqs.map((faq) => {
                  const cat = faqCategories.find(
                    (c) => c.value === faq.category
                  );
                  return (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="rounded-lg px-1 bg-muted/20 hover:bg-muted/30 transition-colors border-0"
                    >
                      <AccordionTrigger className="text-right text-sm font-medium hover:no-underline py-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="flex-1 text-right">
                            {faq.question}
                          </span>
                          {cat && (
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 border shrink-0 ${cat.color}`}
                            >
                              {cat.label}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Video Tutorials Section ─── */}
      <motion.div variants={itemVariants}>
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-sky-500/15 flex items-center justify-center shrink-0">
              <Play className="size-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">دروس الفيديو</h2>
              <p className="text-xs text-muted-foreground">
                تعلّم خطوة بخطوة مع فيديوهات تعليمية
              </p>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoTutorials.map((tutorial, idx) => {
              const Icon = tutorial.icon;
              const diffColor =
                tutorial.difficulty === 'مبتدئ'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : tutorial.difficulty === 'متوسط'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                    : 'bg-red-500/15 text-red-400 border-red-500/20';

              return (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut' as const,
                    delay: idx * 0.08,
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="glass-enhanced border-border/50 overflow-hidden card-hover-lift cursor-pointer group">
                    {/* Thumbnail */}
                    <div
                      className={`relative h-40 bg-gradient-to-br ${tutorial.gradient} flex items-center justify-center`}
                    >
                      {/* Background Icon */}
                      <Icon className="size-20 text-white/10 absolute" />

                      {/* Play Button */}
                      <div className="size-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-primary/60 group-hover:border-primary/40 transition-all duration-300">
                        <Play className="size-6 text-white mr-[-2px]" />
                      </div>

                      {/* Difficulty Badge */}
                      <Badge
                        variant="outline"
                        className={`absolute top-3 left-3 text-[9px] ${diffColor}`}
                      >
                        {tutorial.difficulty}
                      </Badge>

                      {/* Duration */}
                      <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-white/90 font-medium">
                        <Clock className="size-3" />
                        {tutorial.duration}
                      </span>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm leading-relaxed group-hover:text-primary transition-colors">
                        {tutorial.title}
                      </h3>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ─── Troubleshooting Guide Section ─── */}
      <motion.div variants={itemVariants}>
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Wrench className="size-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">دليل حل المشاكل</h2>
              <p className="text-xs text-muted-foreground">
                حلول مقترحة للمشاكل الشائعة
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] bg-muted/50 mr-auto"
            >
              {troubleshootIssues.length} مشكلة
            </Badge>
          </div>

          {/* Issues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {troubleshootIssues.map((issue) => (
              <TroubleshootCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      </motion.div>

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
                    xmlns="http:
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
                <a href="https:
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
