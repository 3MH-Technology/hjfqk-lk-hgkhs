'use client';

import { motion, type Variants } from 'framer-motion';
import { ScrollText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

export function TermsOfService() {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden rounded-xl border border-border">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-transparent pointer-events-none" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary/15 flex items-center justify-center glow-effect">
                <ScrollText className="size-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">شروط الاستخدام</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  آخر تحديث: يناير 2025
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border rounded-xl">
          <CardContent className="p-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-foreground mb-3">1. القبول بالشروط</h2>
              <p>باستخدامك لمنصة استضافة الذئب، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">2. إنشاء الحساب</h2>
              <p>يجب أن يكون عمرك 13 سنة على الأقل لإنشاء حساب. أنت مسؤول عن الحفاظ على سرية بيانات حسابك. يجب تقديم معلومات صحيحة ودقيقة عند التسجيل.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">3. استخدام المنصة</h2>
              <p>يُسمح باستخدام المنصة لاستضافة بوتات تيليجرام فقط. يُحظر:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 mr-4">
                <li>استخدام المنصة لأغراض غير قانونية أو ضارة</li>
                <li>إنشاء بوتات للتطفل أو الإزعاج</li>
                <li>محاولة اختراق أو إتلاف المنصة أو خوادمها</li>
                <li>استخدام المنصة لإرسال بريد مزعج أو فيروسات</li>
                <li>تجاوز حدود الموارد المخصصة لحسابك</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">4. المحتوى</h2>
              <p>أنت المسؤول الوحيد عن محتوى البوتات التي تنشئها. لا نتحمل أي مسؤولية عن محتوى البوتات أو استخدامها. يحق لنا حذف أي بوت ينتهك هذه الشروط دون إنذار مسبق.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">5. توافر الخدمة</h2>
              <p>نسعى لتوفير خدمة مستقرة، لكن لا نضمن توافر المنصة بشكل مستمر. قد نقوم بإيقاف الخدمة مؤقتاً للصيانة أو التحديثات. لا نتحمل مسؤولية أي خسائر ناتجة عن توقف الخدمة.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">6. إنهاء الحساب</h2>
              <p>يحق لنا تعليق أو إنهاء حسابك في أي وقت إذا انتهكت هذه الشروط. يمكنك حذف حسابك في أي وقت من صفحة الإعدادات.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">7. التعديلات</h2>
              <p>يحق لنا تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تعديلات جوهرية. استمرارك في استخدام المنصة بعد التعديل يعني قبولك للشروط الجديدة.</p>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
