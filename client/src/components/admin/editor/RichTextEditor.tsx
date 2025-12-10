import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { EditorToolbar } from './EditorToolbar';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const RichTextEditor = ({ value, onChange }: Props) => {
  const valueRef = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4 shadow-sm border', 
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value, // Giá trị khởi tạo
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
      },
    },
    onUpdate: ({ editor }) => {
      // Khi nội dung thay đổi, gửi HTML về form cha
      const html = editor.getHTML();

      if (html !== valueRef.current) {
        onChange(html);
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      queueMicrotask(() => {
          const { from, to } = editor.state.selection;
          editor.commands.setContent(value, { emitUpdate: false });
          editor.commands.setTextSelection({ from, to });
      });
    }
  }, [value, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto bg-white cursor-text" onClick={() => editor?.chain().focus().run()}>
         <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;