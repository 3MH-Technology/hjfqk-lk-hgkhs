'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Code2,
  Eye,
  Trash2,
  MoreVertical,
  Loader2,
  Mail,
  Crown,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

/* ─── Types ─── */
interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  invitedBy: string | null;
  status: string;
  createdAt: string;
}

/* ─── Animation Variants ─── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const logoFloatVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: [0, -6, 0],
    transition: {
      opacity: { duration: 0.5, ease: 'easeOut' },
      y: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
};

/* ─── Helpers ─── */
const ROLE_CONFIG: Record<string, { label: string; color: string; icon: typeof Crown }> = {
  admin: {
    label: 'مدير',
    color: 'bg-primary/15 text-primary border-primary/30',
    icon: Crown,
  },
  developer: {
    label: 'مطور',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: Code2,
  },
  viewer: {
    label: 'مشاهد',
    color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    icon: Eye,
  },
};

function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    return name.trim().charAt(0).toUpperCase();
  }
  return email.charAt(0).toUpperCase();
}

function formatDate(dateStr: string): string {
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

/* ─── Component ─── */
export default function TeamManagement() {
  const { user } = useAppStore();

  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  
  const [searchQuery, setSearchQuery] = useState('');

  
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);

  
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  
  const [changingRole, setChangingRole] = useState<string | null>(null);

  /* ─── Fetch team members ─── */
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* ─── Filtered members ─── */
  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      m.email.toLowerCase().includes(q)
    );
  });

  /* ─── Invite handler ─── */
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setInviting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim() || null,
          role: inviteRole,
        }),
      });

      if (res.ok) {
        toast.success('تم إرسال الدعوة بنجاح');
        setInviteOpen(false);
        setInviteEmail('');
        setInviteName('');
        setInviteRole('viewer');
        fetchMembers();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في إرسال الدعوة');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || 'حدث خطأ أثناء إرسال الدعوة');
      else toast.error('حدث خطأ أثناء إرسال الدعوة');
    } finally {
      setInviting(false);
    }
  };

  /* ─── Remove handler ─── */
  const handleRemove = async () => {
    if (!removeId) return;

    setRemoving(true);
    try {
      const res = await fetch(`/api/team/${removeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('تم حذف العضو بنجاح');
        setRemoveId(null);
        fetchMembers();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في حذف العضو');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || 'حدث خطأ أثناء حذف العضو');
      else toast.error('حدث خطأ أثناء حذف العضو');
    } finally {
      setRemoving(false);
    }
  };

  /* ─── Role change handler ─── */
  const handleChangeRole = async (memberId: string, newRole: string) => {
    setChangingRole(memberId);
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        const roleLabel = ROLE_CONFIG[newRole]?.label || newRole;
        toast.success(`تم تغيير الصلاحية إلى "${roleLabel}"`);
        fetchMembers();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في تغيير الصلاحية');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || 'حدث خطأ أثناء تغيير الصلاحية');
      else toast.error('حدث خطأ أثناء تغيير الصلاحية');
    } finally {
      setChangingRole(null);
    }
  };

  /* ─── Reset invite dialog ─── */
  const handleInviteDialogChange = (open: boolean) => {
    setInviteOpen(open);
    if (!open) {
      setInviteEmail('');
      setInviteName('');
      setInviteRole('viewer');
    }
  };

  /* ─── Active member count (excl owner from members list, owner shown separately) ─── */
  const isOwner = (m: TeamMember) => m.userId === user?.id;

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header ─── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">إدارة الفريق</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? 'جاري التحميل...' : `${members.length + 1} عضو في الفريق`}
            </p>
          </div>
        </div>

        <Dialog open={inviteOpen} onOpenChange={handleInviteDialogChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="size-4" />
              دعوة عضو جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/50 bg-card max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                دعوة عضو جديد
              </DialogTitle>
              <DialogDescription>
                أرسل دعوة لعضو جديد للانضمام إلى فريقك
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="invite-email">البريد الإلكتروني</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="invite-name">الاسم (اختياري)</Label>
                <Input
                  id="invite-name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="أدخل اسم العضو"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>الصلاحية</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="developer">مطور</SelectItem>
                    <SelectItem value="viewer">مشاهد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleInviteDialogChange(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="gap-2"
              >
                {inviting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                إرسال الدعوة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* ─── Search Bar ─── */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث عن عضو بالاسم أو البريد..."
            className="pr-10 pl-4"
            dir="rtl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* ─── Loading State ─── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-20"
        >
          <Loader2 className="size-8 animate-spin text-primary" />
        </motion.div>
      )}

      {/* ─── Team Owner (always first) ─── */}
      {!loading && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar with gradient border */}
                <div className="relative shrink-0">
                  <motion.div
                    className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary via-blue-500 to-primary"
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <Avatar className="relative border-2 border-background h-11 w-11">
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                      {getInitials(user?.name || null, user?.email || 'م')}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -left-0.5 flex size-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-3 rounded-full border-2 border-background bg-emerald-500" />
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">
                      {user?.name || 'مستخدم'}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`${ROLE_CONFIG.admin.color} text-[10px] gap-1`}
                    >
                      <Crown className="size-3" />
                      {ROLE_CONFIG.admin.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    >
                      مالك الفريق
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1" dir="ltr">
                    <Mail className="size-3" />
                    {user?.email || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Members List ─── */}
      {!loading && filteredMembers.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredMembers.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.viewer;
              const RoleIcon = roleConfig.icon;

              return (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                >
                  <Card className="border-border/50 hover:border-border/80 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <Avatar className="h-11 w-11">
                            <AvatarFallback className="bg-muted/50 font-bold text-sm">
                              {getInitials(member.name, member.email)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Status indicator */}
                          {member.status === 'active' ? (
                            <span className="absolute -bottom-0.5 -left-0.5 flex size-3">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex size-3 rounded-full border-2 border-background bg-emerald-500" />
                            </span>
                          ) : (
                            <span className="absolute -bottom-0.5 -left-0.5 size-3 rounded-full border-2 border-background bg-slate-400" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-sm">
                              {member.name || 'بدون اسم'}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`${roleConfig.color} text-[10px] gap-1`}
                            >
                              <RoleIcon className="size-3" />
                              {roleConfig.label}
                            </Badge>
                            {member.status === 'pending' && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30"
                              >
                                <span className="relative flex size-1.5 ml-1">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                  <span className="relative inline-flex size-1.5 rounded-full bg-blue-500" />
                                </span>
                                معلق
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1" dir="ltr">
                            <Mail className="size-3" />
                            {member.email}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                            انضم في {formatDate(member.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {changingRole === member.id && (
                            <Loader2 className="size-4 animate-spin text-primary" />
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              {/* Role change options */}
                              <div className="px-2 py-1.5">
                                <p className="text-[10px] text-muted-foreground font-medium">تغيير الصلاحية</p>
                              </div>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(member.id, 'admin')}
                                disabled={changingRole === member.id || member.role === 'admin'}
                                className="gap-2 text-xs"
                              >
                                <Crown className="size-3.5 text-primary" />
                                <span>مدير</span>
                                {member.role === 'admin' && <Check className="size-3 mr-auto text-primary" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(member.id, 'developer')}
                                disabled={changingRole === member.id || member.role === 'developer'}
                                className="gap-2 text-xs"
                              >
                                <Code2 className="size-3.5 text-emerald-400" />
                                <span>مطور</span>
                                {member.role === 'developer' && <Check className="size-3 mr-auto text-emerald-400" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(member.id, 'viewer')}
                                disabled={changingRole === member.id || member.role === 'viewer'}
                                className="gap-2 text-xs"
                              >
                                <Eye className="size-3.5 text-slate-400" />
                                <span>مشاهد</span>
                                {member.role === 'viewer' && <Check className="size-3 mr-auto text-slate-400" />}
                              </DropdownMenuItem>
                              <Separator className="my-1" />
                              <DropdownMenuItem
                                onClick={() => setRemoveId(member.id)}
                                className="gap-2 text-xs text-red-400 focus:text-red-400 focus:bg-red-500/10"
                              >
                                <Trash2 className="size-3.5" />
                                <span>إزالة العضو</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── No Results (filtered) ─── */}
      {!loading && members.length > 0 && filteredMembers.length === 0 && (
        <motion.div
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-muted-foreground">
            لا توجد نتائج
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
            لم يتم العثور على أعضاء مطابقين لـ &quot;{searchQuery}&quot;
          </p>
        </motion.div>
      )}

      {/* ─── Empty State (no members) ─── */}
      {!loading && members.length === 0 && (
        <motion.div
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          {/* Wolf Logo with float animation */}
          <motion.div variants={logoFloatVariants} className="mb-6">
            <div className="relative">
              <motion.div
                className="absolute -inset-3 rounded-full bg-primary/10 blur-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <img
                src="https:
                alt="استضافة الذئب"
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/30 relative"
              />
            </div>
          </motion.div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            فريقك جاهز للنمو
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            أنت حالياً العضو الوحيد في الفريق. ادعُ أعضاء جدداً للتعاون وإدارة البوتات معاً.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="size-4 text-primary" />
              <span>1 عضو</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Crown className="size-4 text-primary" />
              <span>1 مدير</span>
            </div>
          </div>

          <Button onClick={() => setInviteOpen(true)} className="gap-2">
            <UserPlus className="size-4" />
            دعوة عضو جديد
          </Button>
        </motion.div>
      )}

      {/* ─── Role Legend ─── */}
      {!loading && members.length > 0 && (
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="mt-2"
        >
          <Card className="border-border/30 bg-muted/20">
            <CardContent className="p-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-3">دليل الصلاحيات</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${ROLE_CONFIG.admin.color} text-[10px] gap-1 shrink-0`}>
                    <Crown className="size-3" />
                    مدير
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">وصول كامل</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${ROLE_CONFIG.developer.color} text-[10px] gap-1 shrink-0`}>
                    <Code2 className="size-3" />
                    مطور
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">إدارة البوتات والملفات</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${ROLE_CONFIG.viewer.color} text-[10px] gap-1 shrink-0`}>
                    <Eye className="size-3" />
                    مشاهد
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">قراءة فقط</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Remove Confirmation Dialog ─── */}
      <AlertDialog open={!!removeId} onOpenChange={(open) => !open && setRemoveId(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              إزالة عضو من الفريق
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إزالة هذا العضو من الفريق؟ لن يتمكن من الوصول إلى البوتات والموارد المشتركة بعد الآن. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={removing}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removing}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {removing ? (
                <Loader2 className="size-4 ml-2 animate-spin" />
              ) : (
                <Trash2 className="size-4 ml-2" />
              )}
              إزالة العضو
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
