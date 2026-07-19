'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Sparkles, Loader2, ImageIcon } from 'lucide-react';
import { INLINE_AI_ACTIONS, type CmsInlineAiAction } from '@/lib/cms/ai/types';
import { CMS_DEFAULT_MODEL } from '@/lib/cms/ai/cmsModelOptions';
import { InlineAiReview } from '@/components/admin/blog/InlineAiReview';
import { CmsMediaPicker, type CmsMediaItem } from '@/components/admin/blog/CmsMediaPicker';
import { uploadCmsMedia } from '@/lib/cmsAdminApi';
import { trackCmsEvent } from '@/lib/cms/analytics';

export type BlogAiContext = {
  articleId: string;
  title: string;
  excerpt: string;
  primaryKeyword: string;
  contentJson: Record<string, unknown>;
};

type PendingReview = {
  action: CmsInlineAiAction;
  actionLabel: string;
  original: string;
  suggested: string;
  from: number;
  to: number;
  model: string;
  insertAfter?: boolean;
};

type ModelOption = { id: string; label: string };

type Props = {
  content: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
  aiContext: BlogAiContext;
  placeholder?: string;
};

const MODEL_STORAGE_KEY = 'cms_inline_ai_model';

export function BlogTiptapEditor({
  content,
  onChange,
  aiContext,
  placeholder = 'بنویسید… متن را انتخاب کنید و از AI inline کمک بگیرید',
}: Props) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [model, setModel] = useState(CMS_DEFAULT_MODEL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<PendingReview | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(MODEL_STORAGE_KEY) : null;
    if (saved) setModel(saved);
    fetch('/api/admin/blog/ai/models', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setModels(j.models);
      })
      .catch(() => {});
  }, []);

  function persistModel(id: string) {
    setModel(id);
    localStorage.setItem(MODEL_STORAGE_KEY, id);
  }

  const insertImage = useCallback((item: { url: string; alt_text?: string }) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.chain().focus().setImage({ src: item.url, alt: item.alt_text || '' }).run();
  }, []);

  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('فقط تصویر مجاز است');
        return;
      }
      setImageUploading(true);
      setError('');
      const res = await uploadCmsMedia(file);
      setImageUploading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      insertImage({ url: res.data.url, alt_text: res.data.alt_text || file.name.replace(/\.[^.]+$/, '') });
    },
    [insertImage]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image,
      Underline,
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[360px] p-4 focus:outline-none text-right [&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto',
        dir: 'rtl',
      },
      handleDrop: (_view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (file?.type.startsWith('image/')) {
          event.preventDefault();
          void uploadAndInsertImage(file);
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
        if (file) {
          event.preventDefault();
          void uploadAndInsertImage(file);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON() as Record<string, unknown>);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming && Object.keys(content).length > 0) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const runInlineAi = useCallback(
    async (action: CmsInlineAiAction, label: string) => {
      if (!editor) return;
      setError('');
      setPending(null);

      const { from, to, empty } = editor.state.selection;
      const selected = editor.state.doc.textBetween(from, to, ' ').trim();
      const needsSelection = action !== 'continue_writing';

      if (needsSelection && !selected) {
        setError('ابتدا بخشی از متن را انتخاب کنید');
        return;
      }

      setBusy(true);
      trackCmsEvent('cms_ai_action_started', { action, article_id: aiContext.articleId });

      try {
        const res = await fetch(`/api/admin/blog/ai/${action}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            article_id: aiContext.articleId,
            title: aiContext.title,
            excerpt: aiContext.excerpt,
            primary_keyword: aiContext.primaryKeyword,
            content_json: aiContext.contentJson,
            selection: selected || undefined,
            mode: selected ? 'selection' : 'article',
            model,
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error ?? 'خطا');
          trackCmsEvent('cms_ai_action_failed', { action, error: json.error });
          return;
        }

        const suggested =
          typeof json.result?.text === 'string'
            ? json.result.text
            : typeof json.raw_text === 'string'
              ? json.raw_text
              : '';

        if (!suggested.trim()) {
          setError('پاسخ خالی بود');
          return;
        }

        setPending({
          action,
          actionLabel: label,
          original: selected,
          suggested: suggested.trim(),
          from,
          to,
          model: json.model ?? model,
          insertAfter: action === 'continue_writing' && empty,
        });
      } catch {
        setError('network_error');
      } finally {
        setBusy(false);
      }
    },
    [editor, aiContext, model]
  );

  function pushReview() {
    if (!editor || !pending) return;

    if (pending.insertAfter) {
      editor
        .chain()
        .focus()
        .setTextSelection(pending.to)
        .insertContent(` ${pending.suggested}`)
        .run();
    } else if (pending.from === pending.to) {
      editor.chain().focus().insertContent(pending.suggested).run();
    } else {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: pending.from, to: pending.to })
        .deleteSelection()
        .insertContent(pending.suggested)
        .run();
    }

    trackCmsEvent('cms_ai_action_accepted', {
      action: pending.action,
      article_id: aiContext.articleId,
      mode: 'push',
    });
    setPending(null);
  }

  function handleMediaSelect(item: CmsMediaItem) {
    insertImage(item);
  }

  function rejectReview() {
    if (pending) {
      trackCmsEvent('cms_ai_action_rejected', {
        action: pending.action,
        article_id: aiContext.articleId,
      });
    }
    setPending(null);
  }

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden" dir="rtl">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-slate-100 bg-slate-50">
        <div className="flex flex-wrap gap-1">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>B</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>I</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>•</ToolbarBtn>
          <ToolbarBtn
            onClick={() => setMediaPickerOpen(true)}
            active={editor.isActive('image')}
            title="درج تصویر"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </ToolbarBtn>
          {imageUploading && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> آپلود…
            </span>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <div className="flex items-center gap-1.5 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <select
            value={model}
            onChange={(e) => persistModel(e.target.value)}
            className="border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 max-w-[140px]"
            title="مدل AI"
          >
            {(models.length ? models : [{ id: model, label: model }]).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {busy && (
          <span className="flex items-center gap-1 text-xs text-violet-600 mr-auto">
            <Loader2 className="w-3 h-3 animate-spin" /> در حال نوشتن…
          </span>
        )}
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150, placement: 'top' }}
          className="flex flex-wrap gap-1 p-1.5 bg-slate-900 rounded-lg shadow-xl max-w-[90vw]"
        >
          {INLINE_AI_ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              disabled={busy}
              onClick={() => runInlineAi(a.id, a.label)}
              className="px-2.5 py-1 text-xs text-white hover:bg-slate-700 rounded-md disabled:opacity-40 whitespace-nowrap"
            >
              {a.label}
            </button>
          ))}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      {(error || pending) && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {error && <p className="text-xs text-red-600">{error}</p>}
          {pending && (
            <InlineAiReview
              actionLabel={pending.actionLabel}
              original={pending.original}
              suggested={pending.suggested}
              model={pending.model}
              onPush={pushReview}
              onReject={rejectReview}
            />
          )}
        </div>
      )}

      <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 flex justify-between">
        <span>{editor.storage.characterCount?.characters?.() ?? 0} کاراکتر</span>
        <span className="text-slate-300">تصویر: دکمه یا drag & drop</span>
        <span>{editor.storage.characterCount?.words?.() ?? 0} کلمه</span>
      </div>

      <CmsMediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        title="درج تصویر در متن"
      />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded-md border ${
        active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
