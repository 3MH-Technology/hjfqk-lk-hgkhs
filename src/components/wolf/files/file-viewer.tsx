'use client';

import { useMemo, useCallback } from 'react';
import { Copy, Check, Download, X, FileCode2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ─── Syntax Highlighting ──────────────────────────────────────────────────────

interface HighlightedToken {
  text: string;
  className: string;
}

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for',
  'while', 'try', 'except', 'finally', 'with', 'as', 'async', 'await',
  'lambda', 'yield', 'raise', 'pass', 'break', 'continue', 'and', 'or',
  'not', 'in', 'is', 'True', 'False', 'None', 'self', 'print', 'global',
  'nonlocal', 'assert', 'del',
]);

const JS_TS_KEYWORDS = new Set([
  'function', 'class', 'const', 'let', 'var', 'return', 'if', 'else',
  'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new',
  'this', 'typeof', 'instanceof', 'try', 'catch', 'finally', 'throw',
  'async', 'await', 'import', 'export', 'from', 'default', 'extends',
  'super', 'yield', 'of', 'in', 'delete', 'void', 'null', 'undefined',
  'true', 'false', 'interface', 'type', 'enum', 'implements', 'private',
  'public', 'protected', 'readonly', 'static', 'abstract', 'as',
]);

function tokenize(code: string, language: string): HighlightedToken[][] {
  const lines = code.split('\n');
  const keywords = language === 'python' ? PYTHON_KEYWORDS : JS_TS_KEYWORDS;

  return lines.map((line) => {
    const tokens: HighlightedToken[] = [];
    let i = 0;

    while (i < line.length) {
      // Whitespace
      if (line[i] === ' ' || line[i] === '\t') {
        let start = i;
        while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++;
        tokens.push({ text: line.slice(start, i), className: '' });
        continue;
      }

      // Single-line comment
      if (line[i] === '#' || (line.slice(i, i + 2) === '//')) {
        tokens.push({ text: line.slice(i), className: 'text-muted-foreground/60' });
        break;
      }

      // Strings (double and single quoted)
      if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
        const quote = line[i];
        let start = i;
        i++;
        while (i < line.length && line[i] !== quote) {
          if (line[i] === '\\') i++; // skip escaped char
          i++;
        }
        if (i < line.length) i++; // closing quote
        tokens.push({ text: line.slice(start, i), className: 'text-emerald-400' });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(line[i])) {
        let start = i;
        while (i < line.length && /[0-9.xXa-fA-F_]/.test(line[i])) i++;
        tokens.push({ text: line.slice(start, i), className: 'text-amber-300' });
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_$\u0600-\u06FF]/.test(line[i])) {
        let start = i;
        while (i < line.length && /[a-zA-Z0-9_$\u0600-\u06FF]/.test(line[i])) i++;
        const word = line.slice(start, i);
        if (keywords.has(word)) {
          tokens.push({ text: word, className: 'text-blue-400 font-semibold' });
        } else if (word.startsWith('@') || word === 'decorator') {
          tokens.push({ text: word, className: 'text-yellow-400' });
        } else {
          tokens.push({ text: word, className: '' });
        }
        continue;
      }

      // Operators and punctuation
      const char = line[i];
      if ('()[]{}:;,.<>=!+-*/%&|^~?'.includes(char)) {
        tokens.push({ text: char, className: 'text-foreground/70' });
        i++;
        continue;
      }

      // Anything else
      tokens.push({ text: char, className: '' });
      i++;
    }

    return tokens;
  });
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'py': return 'python';
    case 'js': return 'javascript';
    case 'ts': return 'typescript';
    case 'json': return 'json';
    default: return 'text';
  }
}

function getLanguageLabel(lang: string): string {
  switch (lang) {
    case 'python': return 'Python';
    case 'javascript': return 'JavaScript';
    case 'typescript': return 'TypeScript';
    case 'json': return 'JSON';
    default: return 'نص';
  }
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface FileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string;
  content: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FileViewer({ open, onOpenChange, filePath, content }: FileViewerProps) {
  const language = getLanguageFromPath(filePath);
  const langLabel = getLanguageLabel(language);

  const lines = useMemo(() => content.split('\n'), [content]);
  const lineCount = lines.length;

  const highlightedLines = useMemo(
    () => tokenize(content, language),
    [content, language]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('تم نسخ المحتوى');
    } catch {
      toast.error('فشل في النسخ');
    }
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل الملف');
  }, [content, filePath]);

  const fileName = filePath.split('/').pop() || filePath;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 bg-card sm:max-w-4xl w-[95vw] max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileCode2 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold truncate">
                {fileName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                  {langLabel}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {lineCount} سطر
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">نسخ</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">تحميل</span>
            </Button>
          </div>
        </div>

        {/* Code viewer */}
        <motion.div
          className="overflow-auto flex-1 min-h-0 bg-[#0d1117] rounded-b-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex min-w-fit" dir="ltr">
            {/* Line numbers */}
            <div className="sticky left-0 z-10 bg-[#0d1117] border-l border-border/20 select-none text-right">
              <div className="py-4 pl-3 pr-2">
                {lines.map((_, index) => (
                  <div
                    key={index}
                    className="text-[13px] leading-[1.6] text-muted-foreground/40 font-mono"
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Code content */}
            <div className="flex-1 py-4 pr-4 pl-4 min-w-0">
              {highlightedLines.map((tokens, lineIndex) => (
                <div
                  key={lineIndex}
                  className="text-[13px] leading-[1.6] font-mono whitespace-pre"
                >
                  {tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={token.className}>
                      {token.text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
