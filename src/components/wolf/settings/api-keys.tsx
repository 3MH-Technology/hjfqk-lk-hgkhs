'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Clock,
  Shield,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

type Expiration = '30' | '90' | '365' | 'never';

interface Permission {
  id: string;
  label: string;
}

const PERMISSIONS: Permission[] = [
  { id: 'read', label: 'قراءة' },
  { id: 'write', label: 'كتابة' },
  { id: 'delete', label: 'حذف' },
  { id: 'admin', label: 'إدارة' },
];

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
  lastUsed: string;
  permissions: string[];
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'بوت الدعم الفني',
    prefix: 'sk-wolf-a1b2c3d4...e5f6',
    createdAt: '2025-01-15',
    expiresAt: '2026-01-15',
    status: 'active',
    lastUsed: 'منذ ساعتين',
    permissions: ['read', 'write'],
  },
  {
    id: '2',
    name: 'الواجهة البرمجية العامة',
    prefix: 'sk-wolf-g7h8i9j0...k1l2',
    createdAt: '2024-10-01',
    expiresAt: '2025-04-01',
    status: 'expired',
    lastUsed: 'منذ 45 يوماً',
    permissions: ['read'],
  },
  {
    id: '3',
    name: 'نظام الإشعارات',
    prefix: 'sk-wolf-m3n4o5p6...q7r8',
    createdAt: '2025-02-20',
    expiresAt: '2026-02-20',
    status: 'active',
    lastUsed: 'منذ 5 دقائق',
    permissions: ['read', 'write', 'delete'],
  },
  {
    id: '4',
    name: 'وصول المدير الكامل',
    prefix: 'sk-wolf-s9t0u1v2...w3x4',
    createdAt: '2025-03-10',
    expiresAt: 'لا ينتهي',
    status: 'active',
    lastUsed: 'منذ 10 دقائق',
    permissions: ['read', 'write', 'delete', 'admin'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
} as const;

const fadeInVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' as const } },
} as const;

function getRelativeTime(dateStr: string): string {
  return dateStr;
}

function formatDate(dateStr: string): string {
  if (dateStr === 'لا ينتهي') return dateStr;
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function ApiKeysPage() {
  const { user } = useAppStore();
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  // Create key form state
  const [keyName, setKeyName] = useState('');
  const [expiration, setExpiration] = useState<Expiration>('90');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [copiedNew, setCopiedNew] = useState(false);

  // Copy key prefix state
  const [copiedPrefixId, setCopiedPrefixId] = useState<string | null>(null);

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId]
    );
  };

  const handleCreateKey = () => {
    if (!keyName.trim()) {
      toast.error('يرجى إدخال اسم المفتاح');
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.error('يرجى اختيار صلاحية واحدة على الأقل');
      return;
    }

    const randomStr = Array.from({ length: 32 }, () =>
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    const prefix = `sk-wolf-${randomStr.slice(0, 8)}...${randomStr.slice(-4)}`;

    const now = new Date();
    const expiresAt = expiration === 'never'
      ? 'لا ينتهي'
      : new Date(now.getTime() + parseInt(expiration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newKey: ApiKey = {
      id: String(Date.now()),
      name: keyName.trim(),
      prefix,
      createdAt: now.toISOString().split('T')[0],
      expiresAt,
      status: 'active',
      lastUsed: 'لم يُستخدم بعد',
      permissions: [...selectedPermissions],
    };

    setKeys((prev) => [newKey, ...prev]);
    setNewKeyValue(`sk-wolf-${randomStr}`);
    setShowNewKey(true);

    // Reset form
    setKeyName('');
    setExpiration('90');
    setSelectedPermissions(['read']);

    toast.success('تم إنشاء مفتاح API بنجاح');
  };

  const handleRevokeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setRevokeId(null);
    toast.success('تم إلغاء مفتاح API بنجاح');
  };

  const handleCopyPrefix = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrefixId(id);
      toast.success('تم نسخ البادئة');
      setTimeout(() => setCopiedPrefixId(null), 2000);
    } catch {
      toast.error('فشل في النسخ');
    }
  };

  const handleCopyNewKey = async () => {
    try {
      await navigator.clipboard.writeText(newKeyValue);
      setCopiedNew(true);
      toast.success('تم نسخ المفتاح');
      setTimeout(() => setCopiedNew(false), 2000);
    } catch {
      toast.error('فشل في النسخ');
    }
  };

  const handleCloseDialog = (open: boolean) => {
    setCreateOpen(open);
    if (!open) {
      setShowNewKey(false);
      setNewKeyValue('');
      setCopiedNew(false);
      setKeyName('');
      setExpiration('90');
      setSelectedPermissions(['read']);
    }
  };

  const getPermissionBadge = (permId: string) => {
    const perm = PERMISSIONS.find((p) => p.id === permId);
    if (!perm) return null;

    const colorMap: Record<string, string> = {
      read: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      write: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      delete: 'bg-red-500/15 text-red-400 border-red-500/30',
      admin: 'bg-primary/15 text-primary border-primary/30',
    };

    return (
      <Badge
        key={permId}
        variant="outline"
        className={`text-[10px] px-1.5 py-0 ${colorMap[permId] || ''}`}
      >
        {perm.label}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <Key className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">مفاتيح API</h1>
            <p className="text-sm text-muted-foreground">إدارة مفاتيح الوصول للواجهة البرمجية</p>
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              إنشاء مفتاح جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/50 bg-card max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="size-5 text-primary" />
                إنشاء مفتاح API جديد
              </DialogTitle>
              <DialogDescription>
                أنشئ مفتاح وصول جديد للواجهة البرمجية
              </DialogDescription>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {showNewKey ? (
                <motion.div
                  key="new-key-display"
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  {/* Warning banner */}
                  <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-400">
                        احفظ هذا المفتاح الآن
                      </p>
                      <p className="text-xs text-amber-400/80 mt-1">
                        لن تتمكن من رؤية هذا المفتاح مرة أخرى بعد إغلاق هذه النافذة.
                      </p>
                    </div>
                  </div>

                  {/* Key display */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">المفتاح الجديد</Label>
                    <div className="relative">
                      <Input
                        value={newKeyValue}
                        readOnly
                        dir="ltr"
                        className="font-mono text-sm bg-muted/50 pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-1 top-1/2 -translate-y-1/2 size-8"
                        onClick={handleCopyNewKey}
                      >
                        {copiedNew ? (
                          <Check className="size-4 text-emerald-400" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={() => handleCloseDialog(false)} className="w-full">
                      أكملت الحفظ
                    </Button>
                  </DialogFooter>
                </motion.div>
              ) : (
                <motion.div
                  key="create-form"
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  {/* Key name */}
                  <div className="space-y-2">
                    <Label htmlFor="key-name">اسم المفتاح</Label>
                    <Input
                      id="key-name"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="مثال: بوت الدعم الفني"
                    />
                  </div>

                  {/* Expiration */}
                  <div className="space-y-2">
                    <Label>مدة الصلاحية</Label>
                    <Select value={expiration} onValueChange={(v) => setExpiration(v as Expiration)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 يوماً</SelectItem>
                        <SelectItem value="90">90 يوماً</SelectItem>
                        <SelectItem value="365">سنة واحدة</SelectItem>
                        <SelectItem value="never">بدون انتهاء</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-3">
                    <Label>الصلاحيات</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {PERMISSIONS.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/50 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <span className="text-sm">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCloseDialog(false)}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleCreateKey}
                      disabled={!keyName.trim() || selectedPermissions.length === 0}
                      className="gap-2"
                    >
                      <Key className="size-4" />
                      إنشاء المفتاح
                    </Button>
                  </DialogFooter>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
      >
        <Shield className="size-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-400">
            احتفظ بمفاتيح API بشكل آمن
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            لا تشاركها مع أي شخص ولا تضعها في الكود المصدري. استخدم متغيرات البيئة بدلاً من ذلك.
          </p>
        </div>
      </motion.div>

      {/* Keys List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            المفاتيح ({keys.length})
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {keys.map((key) => (
              <motion.div
                key={key.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              >
                <Card className="border-border/50 hover:border-border/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Key info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Name + Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-sm">{key.name}</h3>
                          <Badge
                            variant="outline"
                            className={
                              key.status === 'active'
                                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]'
                                : 'text-red-400 border-red-500/30 bg-red-500/10 text-[10px]'
                            }
                          >
                            <span className="relative flex size-1.5 ml-1.5">
                              {key.status === 'active' && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              )}
                              <span
                                className={`relative inline-flex size-1.5 rounded-full ${
                                  key.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                            </span>
                            {key.status === 'active' ? 'نشط' : 'منتهي الصلاحية'}
                          </Badge>
                        </div>

                        {/* Prefix + Copy */}
                        <div className="flex items-center gap-2">
                          <code
                            className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded font-mono truncate max-w-[280px]"
                            dir="ltr"
                          >
                            {key.prefix}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopyPrefix(key.id, key.prefix)}
                          >
                            {copiedPrefixId === key.id ? (
                              <Check className="size-3 text-emerald-400" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            أنشئ: {formatDate(key.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            ينتهي: {key.expiresAt === 'لا ينتهي' ? 'لا ينتهي' : formatDate(key.expiresAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="size-3" />
                            آخر استخدام: {key.lastUsed}
                          </span>
                        </div>

                        {/* Permissions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {key.permissions.map((p) => getPermissionBadge(p))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setRevokeId(key.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {keys.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <Key className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-muted-foreground">
              لا توجد مفاتيح API
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
              أنشئ مفتاح API جديد للبدء في استخدام الواجهة البرمجية
            </p>
          </motion.div>
        )}
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={!!revokeId} onOpenChange={(open) => !open && setRevokeId(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              إلغاء مفتاح API
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إلغاء هذا المفتاح؟ لن يتمكن أي تطبيق يستخدم هذا المفتاح من الوصول إلى الواجهة البرمجية بعد الآن. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeId && handleRevokeKey(revokeId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="size-4 ml-2" />
              إلغاء المفتاح
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
