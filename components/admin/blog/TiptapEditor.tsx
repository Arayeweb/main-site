'use client';

import { useEditor, EditorContent } from '@tiptap/react';
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
import { useEffect } from 'react';

type Props = {
  content: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
  placeholder?: string;
};

export function TiptapEditor({ content, onChange, placeholder = 'شروع به نوشتن کنید…' }: Props) {
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
        class:
          'prose prose-slate max-w-none min-h-[320px] p-4 focus:outline-none text-right',
        dir: 'rtl',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON() as Record<string, unknown>);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming && Object.keys(content).length > 0) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden" dir="rtl">
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-100 bg-slate-50">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>B</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>I</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>U</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>•</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>1.</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>❝</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarBtn>
        <ToolbarBtn
          onClick={() => {
            const url = window.prompt('آدرس لینک:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive('link')}
        >
          🔗
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
      <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 flex justify-between">
        <span>{editor.storage.characterCount?.characters?.() ?? 0} کاراکتر</span>
        <span>{editor.storage.characterCount?.words?.() ?? 0} کلمه</span>
      </div>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded-md border ${
        active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
