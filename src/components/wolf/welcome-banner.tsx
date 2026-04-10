'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Animation Variants ─── */

const bannerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -80,
    height: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
      height: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  },
  exit: {
    opacity: 0,
    y: -80,
    height: 0,
    transition: {
      duration: 0.35,
      ease: 'easeIn' as const,
      height: {
        duration: 0.3,
        ease: 'easeIn' as const,
      },
    },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
      delay: 0.15,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};

const sparkleVariants: Variants = {
  animate: {
    rotate: [0, 15, -10, 15, 0],
    scale: [1, 1.15, 1, 1.1, 1],
    transition: {
      duration: 3,
      ease: 'easeInOut' as const,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

/* ─── Constants ─── */

const DISMISS_KEY = 'wolf-welcome-dismissed';

/* ─── Main Component ─── */

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(DISMISS_KEY) === 'true';
  });

  useEffect(() => {
    if (!dismissed) {
      
      const timer = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    
    setTimeout(() => {
      setDismissed(true);
      localStorage.setItem(DISMISS_KEY, 'true');
    }, 400);
  };

  if (dismissed && !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="welcome-banner relative z-40 overflow-hidden"
        >
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative px-4 py-3 md:px-6"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-screen-xl mx-auto">
              {/* Content */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  variants={sparkleVariants}
                  animate="animate"
                  className="flex items-center justify-center size-9 rounded-xl bg-primary/20 shrink-0"
                >
                  <Sparkles className="size-5 text-primary" />
                </motion.div>
                <p className="text-sm text-foreground/90 leading-relaxed text-center sm:text-right">
                  مرحباً بك في استضافة الذئب! 🐺 استضف بوتات تيليجرام بأقوى منصة — للحصول على الدعم تواصل معنا عبر تيليجرام
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  asChild
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-lg shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30"
                >
                  <a href="https:
                    <Send className="size-3.5" />
                    <span className="hidden xs:inline">تواصل عبر تيليجرام</span>
                    <span className="xs:hidden">تيليجرام</span>
                  </a>
                </Button>

                <button
                  onClick={handleDismiss}
                  className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors duration-200"
                  aria-label="إغلاق"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
