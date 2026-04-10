'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Bot,
  ScrollText,
  MonitorDot,
  FolderOpen,
  Send,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { CreateBotDialog } from './bots/create-bot-dialog';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: {
      duration: 0.15,
      ease: 'easeIn' as const,
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const actionItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 28,
      delay: i * 0.06,
    },
  }),
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.1, ease: 'easeIn' as const },
  },
};

const triggerPulse = {
  scale: [1, 1.08, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

export function QuickActionsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [createBotOpen, setCreateBotOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { setCurrentPage } = useAppStore();

  const closePanel = useCallback(() => setIsOpen(false), []);
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closePanel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closePanel]);

  const handleCreateBot = () => {
    closePanel();
    setCreateBotOpen(true);
  };

  const handleNavigate = (page: Parameters<typeof setCurrentPage>[0]) => {
    closePanel();
    setCurrentPage(page);
  };

  const actions: QuickAction[] = [
    {
      id: 'create-bot',
      label: 'إنشاء بوت جديد',
      description: 'إضافة بوت جديد للاستضافة',
      icon: <Bot className="size-5" />,
      onClick: handleCreateBot,
    },
    {
      id: 'logs',
      label: 'عرض السجلات',
      description: 'مراجعة سجلات البوتات',
      icon: <ScrollText className="size-5" />,
      onClick: () => handleNavigate('logs'),
    },
    {
      id: 'monitoring',
      label: 'مراقبة الأداء',
      description: 'متابعة حالة البوتات',
      icon: <MonitorDot className="size-5" />,
      onClick: () => handleNavigate('bot-monitoring'),
    },
    {
      id: 'files',
      label: 'إدارة الملفات',
      description: 'رفع وتعديل ملفات البوتات',
      icon: <FolderOpen className="size-5" />,
      onClick: () => handleNavigate('files'),
    },
    {
      id: 'support',
      label: 'الدعم عبر تيليجرام',
      description: 'تواصل مع فريق الدعم',
      icon: <Send className="size-5" />,
      onClick: () => {
        closePanel();
        window.open('https:
      },
    },
  ];

  return (
    <>
      {/* Backdrop blur when panel is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 left-5 z-50 w-72 rounded-2xl border border-border/50 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
            role="menu"
            aria-label="إجراءات سريعة"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                  <Zap className="size-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">إجراءات سريعة</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={closePanel}
                aria-label="إغلاق"
              >
                <X className="size-4" />
              </Button>
            </div>

            <Separator className="mx-4 bg-border/50" />

            {/* Action Items */}
            <div className="p-2">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  variants={actionItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  onClick={action.onClick}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  role="menuitem"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Panel Footer */}
            <div className="px-4 py-2.5">
              <p className="text-[10px] text-muted-foreground/50 text-center">
                ⌨️ Esc للإغلاق
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        ref={triggerRef}
        onClick={togglePanel}
        animate={isOpen ? { rotate: 135, scale: 1.1 } : triggerPulse}
        transition={
          isOpen
            ? { duration: 0.2, ease: 'easeOut' as const }
            : undefined
        }
        className="fixed bottom-5 left-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="إجراءات سريعة"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Zap className="size-6" />

        {/* Pulse ring behind the button */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        )}
      </motion.button>

      {/* Create Bot Dialog */}
      <CreateBotDialog
        open={createBotOpen}
        onOpenChange={setCreateBotOpen}
        onCreated={() => {
          setCreateBotOpen(false);
        }}
      />
    </>
  );
}
