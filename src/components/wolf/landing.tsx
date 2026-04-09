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
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Landing() {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center space-y-6"
            >
              {/* Logo & Brand */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-4xl md:text-5xl shadow-lg shadow-primary/5">
                    🐺
                  </div>
                  <div className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-full pulse-dot" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary/60 rounded-full pulse-dot" style={{ animationDelay: '1s' }} />
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
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              مميزات المنصة
            </h2>
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
                className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                    {feature.emoji}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Supported Languages Section */}
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              اللغات المدعومة
            </h2>
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
                className={`group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 hover:border-primary/20 transition-all duration-300 overflow-hidden`}
              >
                {/* Subtle gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <lang.icon className={`h-7 w-7 ${lang.iconColor}`} />
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🐺</span>
              <span className="font-bold gradient-text text-sm">استضافة الذئب</span>
            </div>

            <Separator className="max-w-xs" />

            {/* Info Links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>المطور: @j49_c</span>
              <span>قناة المطور 1</span>
              <span>قناة المطور 2</span>
              <span>القناة الرسمية لاستضافة الذئب</span>
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground/60">
              جميع الحقوق محفوظة © 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
