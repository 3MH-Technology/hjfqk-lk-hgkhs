'use client';

import { motion, type Variants } from 'framer-motion';
import { Shield } from 'lucide-react';
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

export function PrivacyPolicy() {
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
                <Shield className="size-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">سياسة الخصوصية</h1>
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
              <h2 className="text-base font-bold text-foreground mb-3">1. المعلومات التي نجمعها</h2>
              <p>نجمع المعلومات التالية عند استخدامك للمنصة:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 mr-4">
                <li>عنوان البريد الإلكتروني واسم المستخدم عند التسجيل</li>
                <li>معلومات البوتات التي تنشئها (الاسم، اللغة، الملفات)</li>
                <li>سجلات التشغيل والأخطاء المتعلقة بالبوتات</li>
                <li>بيانات الاستخدام مثل الصفحات التي تزورها</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">2. كيف نستخدم المعلومات</h2>
              <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 mr-4">
                <li>تقديم وتحسين خدمات استضافة البوتات</li>
                <li>إرسال إشعارات مهمة حول حسابك وبوتاتك</li>
                <li>تحليل الاستخدام لتحسين المنصة</li>
                <li>منع الإساءة واستخدام المنصة بشكل غير مصرح</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">3. حماية البيانات</h2>
              <p>نتخذ إجراءات أمنية مناسبة لحماية بياناتك. كلمات المرور يتم تشفيرها قبل تخزينها. الوصول إلى البيانات يقتصر على الموظفين المصرح لهم فقط. نستخدم اتصالات مشفرة (HTTPS) لحماية نقل البيانات.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">4. مشاركة البيانات</h2>
              <p>لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف خارجية. قد نشارك معلومات مجمعة وغير شخصية لأغراض تحليلية.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">5. حذف البيانات</h2>
              <p>يمكنك طلب حذف حسابك وبياناتك في أي وقت عبر صفحة الإعدادات. سيتم حذف جميع البيانات المرتبطة بحسابك بما في ذلك البوتات والملفات.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">6. التواصل</h2>
              <p>لأي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر تيليجرام.</p>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
