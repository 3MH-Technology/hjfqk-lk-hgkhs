'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  File,
  FileCode,
  FileText,
  FileJson,
  Shield,
  FolderOpen,
  Upload,
  Plus,
  Save,
  Trash2,
  Download,
  ArrowRight,
  Loader2,
  X,
  Eye,
  PackageOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { FileViewer } from './file-viewer';

interface BotFile {
  id: string;
  botId: string;
  path: string;
  content: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  const units = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${units[i]}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileIcon(path: string) {
  const ext = path.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'py':
      return <FileCode className="h-5 w-5 text-blue-400" />;
    case 'php':
      return <FileCode className="h-5 w-5 text-blue-400" />;
    case 'txt':
    case 'md':
      return <FileText className="h-5 w-5 text-muted-foreground" />;
    case 'json':
    case 'yml':
    case 'yaml':
      return <FileJson className="h-5 w-5 text-emerald-400" />;
    case 'env':
      return <Shield className="h-5 w-5 text-blue-400" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function FileManager() {
  const { selectedBotId, setCurrentPage } = useAppStore();
  const [files, setFiles] = useState<BotFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<BotFile | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'upload'>('create');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ path: string; content: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!selectedBotId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}/files`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('فشل في جلب الملفات');
      const data = await res.json();
      setFiles(data);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب الملفات');
    } finally {
      setLoading(false);
    }
  }, [selectedBotId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileClick = (file: BotFile) => {
    setSelectedFile(file);
    setEditContent(file.content);
  };

  const handleSave = async () => {
    if (!selectedBotId || !selectedFile) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}/files`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile.path,
          content: editContent,
          size: new TextEncoder().encode(editContent).length,
          existingFileId: selectedFile.id,
        }),
      });
      if (!res.ok) throw new Error('فشل في حفظ الملف');
      toast.success('تم حفظ الملف بنجاح');
      await fetchFiles();
      setSelectedFile((prev) =>
        prev ? { ...prev, content: editContent } : null
      );
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBotId || !selectedFile) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/bots/${selectedBotId}/files/${selectedFile.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('فشل في حذف الملف');
      toast.success('تم حذف الملف بنجاح');
      setSelectedFile(null);
      setDeleteDialogOpen(false);
      await fetchFiles();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل الملف');
  };

  const handleCreateFile = async () => {
    if (!selectedBotId || !newFileName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}/files`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: newFileName.trim(),
          content: newFileContent,
          size: new TextEncoder().encode(newFileContent).length,
        }),
      });
      if (!res.ok) throw new Error('فشل في إنشاء الملف');
      toast.success('تم إنشاء الملف بنجاح');
      setDialogOpen(false);
      setNewFileName('');
      setNewFileContent('');
      await fetchFiles();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الإنشاء');
    } finally {
      setCreating(false);
    }
  };

  const handleViewFile = (file: BotFile) => {
    setViewerFile({ path: file.path, content: file.content });
    setViewerOpen(true);
  };

  const handleExportBot = async () => {
    if (!selectedBotId) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}/bot-export`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('فشل في تصدير البوت');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bot-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('تم تصدير البوت بنجاح');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء التصدير';
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  const openDialog = (mode: 'create' | 'upload') => {
    setDialogMode(mode);
    setNewFileName('');
    setNewFileContent('');
    setDialogOpen(true);
  };

  if (!selectedBotId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <FolderOpen className="h-16 w-16 text-muted-foreground/40" />
        <p className="text-muted-foreground text-lg">لم يتم اختيار بوت</p>
        <p className="text-muted-foreground/70 text-sm">
          اختر بوتاً لعرض وإدارة ملفاته
        </p>
        <Button
          variant="outline"
          onClick={() => setCurrentPage('bots')}
          className="mt-2"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للبوتات
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-full">
      {/* File List Panel */}
      <Card className="flex-1 lg:max-w-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold gradient-text">الملفات</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportBot}
                disabled={exporting}
                className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              >
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <PackageOpen className="h-3.5 w-3.5" />
                )}
                تصدير
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openDialog('upload')}
                className="text-xs"
              >
                <Upload className="h-3.5 w-3.5 ml-1" />
                رفع ملف
              </Button>
              <Button
                size="sm"
                onClick={() => openDialog('create')}
                className="text-xs"
              >
                <Plus className="h-3.5 w-3.5 ml-1" />
                إنشاء ملف
              </Button>
            </div>
          </div>

          <Separator className="mb-3" />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="mr-2 text-muted-foreground text-sm">
                جارٍ التحميل...
              </span>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">لا توجد ملفات</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                أنشئ أو ارفع ملفاً جديداً لبدء العمل
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
              <div className="space-y-1">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors hover:bg-accent/50 group ${
                      selectedFile?.id === file.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'border border-transparent'
                    }`}
                  >
                    {getFileIcon(file.path)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.path}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.updatedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewFile(file);
                      }}
                      className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors shrink-0"
                      title="عرض الملف"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Editor Panel */}
      <Card className="flex-[2] border-border/50">
        <CardContent className="p-4 flex flex-col h-full">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile.path)}
                  <div>
                    <h3 className="font-semibold text-sm">
                      {selectedFile.path}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)} •{' '}
                      {formatDate(selectedFile.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                    className="text-xs"
                  >
                    <Download className="h-3.5 w-3.5 ml-1" />
                    تحميل
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5 ml-1" />
                    حذف
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="text-xs"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 ml-1 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 ml-1" />
                    )}
                    حفظ
                  </Button>
                </div>
              </div>

              <Separator className="mb-3" />

              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="code-editor flex-1 min-h-[400px] resize-none bg-[#0d1117] text-[#c9d1d9] border-border/50 rounded-lg p-4 text-sm leading-relaxed"
                dir="ltr"
                placeholder="محتوى الملف..."
                spellCheck={false}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
              <File className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                اختر ملفاً لعرضه وتحريره
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/50 bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'إنشاء ملف جديد' : 'رفع ملف'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create'
                ? 'أدخل اسم الملف ومحتواه'
                : 'أدخل اسم الملف والمحتوى لرفعه'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="file-name">اسم الملف</Label>
              <Input
                id="file-name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="مثال: main.py"
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-content">المحتوى</Label>
              <Textarea
                id="file-content"
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                placeholder="محتوى الملف..."
                className="code-editor min-h-[200px] bg-[#0d1117] text-[#c9d1d9] border-border/50"
                dir="ltr"
                spellCheck={false}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateFile}
              disabled={!newFileName.trim() || creating}
            >
              {creating && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              {dialogMode === 'create' ? 'إنشاء' : 'رفع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Viewer Dialog */}
      {viewerFile && (
        <FileViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          filePath={viewerFile.path}
          content={viewerFile.content}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الملف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الملف &quot;{selectedFile?.path}&quot؛؟ لا يمكن
              التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
