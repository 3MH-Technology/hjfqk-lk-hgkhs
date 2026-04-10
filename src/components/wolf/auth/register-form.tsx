'use client';

import { useState, useMemo } from 'react';
import { signIn } from 'next-auth/react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  X,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/* ─── Framer Motion Variants ─── */
const formVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const brandingVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const inputGlowVariants: Variants = {
  idle: { boxShadow: '0 0 0 0px transparent' },
  focused: {
    boxShadow: '0 0 0 2px oklch(0.60 0.20 250 / 0.15), 0 0 20px -4px oklch(0.60 0.20 250 / 0.2)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const eyeSwapVariants: Variants = {
  show: { rotate: 0, scale: 1, opacity: 1 },
  hide: { rotate: -90, scale: 0.5, opacity: 0 },
};

const strongCheckVariants: Variants = {
  hidden: { scale: 0, opacity: 0, pathLength: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.5, ease: 'easeOut', type: 'spring', stiffness: 300, damping: 15 },
  },
};

const bounceCheckVariants: Variants = {
  unchecked: { scale: 1 },
  checked: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/* ─── Wolf Logo Component ─── */
function WolfLogo({ size = 48 }: { size?: number }) {
  return (
    <img
      src="https://f.top4top.io/p_37210bgwm1.jpg"
      alt="استضافة الذئب"
      style={{ width: size, height: size }}
      className="rounded-full object-cover wolf-svg-glow"
    />
  );
}

/* ─── Wolf Silhouette Particle ─── */
function WolfSilhouetteParticle({ size = 16, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src="https://f.top4top.io/p_37210bgwm1.jpg"
      alt=""
      style={{ width: size, height: size, ...style }}
      className={`rounded-full object-cover ${className}`}
    />
  );
}

/* ─── Password strength logic ─── */
function usePasswordStrength(password: string) {
  return useMemo(() => {
    const checks = {
      minLength: password.length >= 6,
      hasLetter: /[a-zA-Z\u0600-\u06FF]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const metCount = Object.values(checks).filter(Boolean).length;

    let strength: 'none' | 'weak' | 'medium' | 'strong' = 'none';
    let percent = 0;

    if (password.length === 0) {
      strength = 'none';
      percent = 0;
    } else if (!checks.minLength) {
      strength = 'weak';
      percent = 25;
    } else if (checks.minLength && checks.hasLetter && !checks.hasNumber && !checks.hasSpecial) {
      strength = 'medium';
      percent = 50;
    } else if (checks.minLength && checks.hasLetter && checks.hasNumber && !checks.hasSpecial) {
      strength = 'medium';
      percent = 70;
    } else if (metCount >= 4) {
      strength = 'strong';
      percent = 100;
    } else {
      strength = 'medium';
      percent = 50;
    }

    const labels: Record<string, string> = {
      none: '',
      weak: 'ضعيفة',
      medium: 'متوسطة',
      strong: 'قوية',
    };

    return {
      checks,
      strength,
      percent,
      label: labels[strength],
    };
  }, [password]);
}

/* ─── Requirement item ─── */
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <motion.div
        initial={false}
        animate={met ? { scale: 1, rotate: 0 } : { scale: 0.8, rotate: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {met ? (
          <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
        ) : (
          <X className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
        )}
      </motion.div>
      <span className={met ? 'text-green-400/90' : 'text-muted-foreground/60'}>
        {text}
      </span>
    </div>
  );
}

/* ─── Animated Strong Checkmark ─── */
function StrongCheckmark({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="flex items-center gap-1.5 text-green-400"
          variants={strongCheckVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-green-400/15 border border-green-400/30 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
          </motion.div>
          <span className="text-xs font-medium">كلمة مرور قوية!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Enhanced Input Wrapper with Focus Glow ─── */
function GlowInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled,
  dir,
  autoComplete,
  children,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  dir?: string;
  autoComplete: string;
  children?: React.ReactNode;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div variants={itemVariants} className="space-y-2">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <motion.div
        variants={inputGlowVariants}
        animate={isFocused ? 'focused' : 'idle'}
        className="auth-input-wrapper relative rounded-lg"
      >
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`bg-background/50 h-11 ${children ? 'pe-11' : ''} transition-all duration-200 focus:ring-0 focus:ring-offset-0`}
          autoComplete={autoComplete}
          dir={dir}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {children && (
          <div className="absolute left-1 top-1/2 -translate-y-1/2">
            {children}
          </div>
        )}
      </motion.div>
      {/* Gradient underline effect */}
      <motion.div
        className="h-0.5 rounded-full bg-gradient-to-l from-transparent via-primary/60 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: isFocused ? 1 : 0,
          opacity: isFocused ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

/* ─── Left branding panel ─── */
function AuthBrandingPanel() {
  return (
    <motion.div
      className="hidden md:flex md:w-1/2 lg:w-[55%] relative wolf-paw-bg flex-col items-center justify-center p-8 lg:p-12 overflow-hidden"
      variants={brandingVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Subtle background texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, oklch(0.60 0.20 250) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="auth-particle"
          style={{
            top: `${10 + (i * 7) % 80}%`,
            left: `${5 + (i * 11) % 90}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${5 + (i % 3)}s`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Wolf SVG Logo */}
        <div className="relative mb-6 wolf-logo-container">
          <div className="wolf-logo-glow" />
          <div className="w-28 h-28 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
            <WolfLogo size={56} />
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full pulse-dot shadow-lg shadow-primary/50" />
        </div>

        {/* Title */}
        <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-3">
          استضافة الذئب
        </h2>

        {/* Subtitle */}
        <p className="text-muted-foreground text-base lg:text-lg mb-2">
          منصة استضافة احترافية لبوتات تيليجرام
        </p>
        <p className="text-primary/80 text-sm font-medium mt-1">
          انضم إلى مجتمع المطورين
        </p>

        {/* Feature bullets */}
        <div className="mt-8 space-y-4 w-full text-start">
          {[
            { text: 'تشغيل فوري لبوتاتك', desc: 'ابدأ بلا تأخير' },
            { text: 'إدارة ملفات متكاملة', desc: 'محرر أكواد مدمج' },
            { text: 'مراقبة وسجلات مباشرة', desc: 'تتبع أداء البوتات' },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">{feature.text}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setCurrentPage } = useAppStore();

  const { checks, strength, percent, label } = usePasswordStrength(password);

  const validateForm = (): string | null => {
    if (!name.trim()) return 'يرجى إدخال الاسم';
    if (!email.trim()) return 'يرجى إدخال البريد الإلكتروني';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'البريد الإلكتروني غير صالح';
    }
    if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (password !== confirmPassword) return 'كلمتا المرور غير متطابقتين';
    if (!agreedToTerms) return 'يجب الموافقة على شروط الاستخدام';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error('تنبيه', { description: error });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error('فشل التسجيل', {
          description: data.error || 'حدث خطأ أثناء التسجيل',
        });
        return;
      }

      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.success('تم التسجيل بنجاح', {
          description: 'يرجى تسجيل الدخول باستخدام بياناتك',
        });
        setCurrentPage('login');
        return;
      }

      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user) {
        setUser({
          id: (session.user as { id?: string }).id,
          email: session.user.email || '',
          name: session.user.name,
          role: (session.user as { role?: string }).role || 'user',
        });
        setCurrentPage('dashboard');
      }
    } catch {
      toast.error('خطأ غير متوقع', {
        description: 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColorClass =
    strength === 'strong'
      ? 'strength-strong'
      : strength === 'medium'
        ? 'strength-medium'
        : strength === 'weak'
          ? 'strength-weak'
          : 'bg-border';

  const strengthLabelColor =
    strength === 'strong'
      ? 'text-green-400'
      : strength === 'medium'
        ? 'text-blue-400'
        : strength === 'weak'
          ? 'text-red-400'
          : 'text-muted-foreground';

  const handleSocialClick = (provider: string) => {
    toast.info('سيتم إضافة هذه الميزة قريباً', {
      description: `التسجيل بـ ${provider} قيد التطوير`,
    });
  };

  return (
    <div className="min-h-screen flex auth-grid-bg">
      {/* Left branding panel */}
      <AuthBrandingPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:px-8 relative auth-gradient-mesh">
        {/* Subtle background texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle, oklch(0.60 0.20 250) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Wolf silhouette floating particles */}
        <WolfSilhouetteParticle size={20} className="auth-wolf-particle auth-wolf-particle-1" style={{ top: '10%', right: '12%' } as React.CSSProperties} />
        <WolfSilhouetteParticle size={14} className="auth-wolf-particle auth-wolf-particle-2" style={{ top: '28%', right: '22%' } as React.CSSProperties} />
        <WolfSilhouetteParticle size={18} className="auth-wolf-particle auth-wolf-particle-3" style={{ top: '55%', right: '8%' } as React.CSSProperties} />
        <WolfSilhouetteParticle size={12} className="auth-wolf-particle auth-wolf-particle-4" style={{ top: '75%', right: '16%' } as React.CSSProperties} />
        <WolfSilhouetteParticle size={16} className="auth-wolf-particle auth-wolf-particle-5" style={{ top: '42%', right: '28%' } as React.CSSProperties} />

        <motion.div
          className="w-full max-w-md relative z-10"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="w-full auth-glass-card auth-card">
            <CardHeader className="text-center space-y-4">
              {/* Mobile-only branding */}
              <div className="flex flex-col items-center gap-3 md:hidden">
                <div className="relative wolf-logo-container">
                  <div className="wolf-logo-glow" />
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <WolfLogo size={32} />
                  </div>
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full pulse-dot" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    استضافة الذئب
                  </h1>
                  <CardDescription className="mt-1 text-sm">
                    منصة استضافة احترافية لبوتات تيليجرام
                  </CardDescription>
                </div>
              </div>

              {/* Desktop title */}
              <div className="hidden md:block">
                <CardTitle className="text-xl">إنشاء حساب جديد</CardTitle>
                <CardDescription className="mt-1">
                  انضم إلى منصة استضافة الذئب
                </CardDescription>
              </div>

              {/* Mobile title */}
              <div className="md:hidden">
                <CardTitle className="text-lg">إنشاء حساب جديد</CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Name */}
                <GlowInput
                  id="register-name"
                  label="الاسم"
                  type="text"
                  placeholder="اسم المستخدم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="name"
                />

                {/* Email */}
                <GlowInput
                  id="register-email"
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  dir="ltr"
                  autoComplete="email"
                />

                {/* Password */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm">كلمة المرور</Label>
                  <motion.div
                    variants={inputGlowVariants}
                    animate="idle"
                    className="auth-input-wrapper relative rounded-lg"
                  >
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="bg-background/50 h-11 pe-11 transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                      autoComplete="new-password"
                      dir="ltr"
                      onFocus={() => {
                        // Focus glow handled via parent state
                      }}
                    />
                    <div className="absolute left-1 top-1/2 -translate-y-1/2">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={showPassword ? 'visible' : 'hidden'}
                          initial="hide"
                          animate="show"
                          exit="hide"
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Password strength bar */}
                  {password.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${strengthColorClass}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${strengthLabelColor}`}>
                          {label}
                        </span>
                      </div>

                      {/* Animated strong checkmark */}
                      <div className="flex items-center justify-between">
                        {/* Requirements checklist */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          <RequirementItem met={checks.minLength} text="6 أحرف على الأقل" />
                          <RequirementItem met={checks.hasLetter} text="يحتوي على أحرف" />
                          <RequirementItem met={checks.hasNumber} text="يحتوي على أرقام" />
                          <RequirementItem met={checks.hasSpecial} text="يحتوي على رموز خاصة" />
                        </div>
                        <StrongCheckmark show={strength === 'strong'} />
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Confirm password */}
                <GlowInput
                  id="register-confirm-password"
                  label="تأكيد كلمة المرور"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  dir="ltr"
                  autoComplete="new-password"
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <motion.p
                    className="text-xs text-red-400"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    كلمتا المرور غير متطابقتين
                  </motion.p>
                )}
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <motion.p
                    className="text-xs text-green-400 flex items-center gap-1"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-3 h-3" />
                    </motion.span>
                    كلمتا المرور متطابقتان
                  </motion.p>
                )}

                {/* Terms checkbox with bounce animation */}
                <motion.div className="flex items-start gap-2 pt-1" variants={itemVariants}>
                  <motion.div
                    animate={agreedToTerms ? 'checked' : 'unchecked'}
                    variants={bounceCheckVariants}
                  >
                    <Checkbox
                      id="agree-terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                      className="border-border mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </motion.div>
                  <Label
                    htmlFor="agree-terms"
                    className="text-sm text-muted-foreground cursor-pointer select-none leading-relaxed"
                  >
                    أوافق على{' '}
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors relative group"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info('سيتم إضافة الشروط قريباً', {
                          description: 'صفحة شروط الاستخدام وسياسة الخصوصية قيد التطوير',
                        });
                      }}
                    >
                      شروط الاستخدام
                      <span className="absolute bottom-0 right-0 h-px w-0 bg-primary/40 group-hover:w-full transition-all duration-300" />
                    </button>
                    {' '}و{' '}
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors relative group"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info('سيتم إضافة الشروط قريباً', {
                          description: 'صفحة شروط الاستخدام وسياسة الخصوصية قيد التطوير',
                        });
                      }}
                    >
                      سياسة الخصوصية
                      <span className="absolute bottom-0 right-0 h-px w-0 bg-primary/40 group-hover:w-full transition-all duration-300" />
                    </button>
                  </Label>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 transition-shadow"
                      disabled={
                        isLoading ||
                        !name.trim() ||
                        !email.trim() ||
                        !password ||
                        !confirmPassword
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>جارٍ إنشاء الحساب...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>إنشاء حساب</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>

              {/* Divider */}
              <div className="relative my-6">
                <Separator className="bg-border/60" />
                <span className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  أو تابع باستخدام
                </span>
              </div>

              {/* Social login buttons with enhanced hover */}
              <div className="flex gap-3">
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 bg-background/50 border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                    onClick={() => handleSocialClick('GitHub')}
                  >
                    <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </Button>
                </motion.div>
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 bg-background/50 border-border/60 hover:border-[#2AABEE]/40 hover:bg-[#2AABEE]/5 hover:text-[#2AABEE] transition-all duration-300"
                    onClick={() => handleSocialClick('Telegram')}
                  >
                    <Send className="h-4 w-4 ml-2" />
                    <span>Telegram</span>
                  </Button>
                </motion.div>
              </div>
            </CardContent>

            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                لديك حساب؟{' '}
                <motion.button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium transition-colors relative inline-block group"
                  onClick={() => setCurrentPage('login')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  سجل دخول
                  <span className="absolute bottom-0 right-0 h-px w-0 bg-primary/40 group-hover:w-full transition-all duration-300" />
                </motion.button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
