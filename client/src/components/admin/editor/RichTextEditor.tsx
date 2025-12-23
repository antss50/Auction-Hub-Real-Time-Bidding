import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { EditorToolbar } from './EditorToolbar';
import { UploadService } from '../../../services/upload.service';

interface Props {
  value: string;
  onChange: (html: string) => void;
  className?: string; // Allow custom height/styling from parent
}

const RichTextEditor = ({ value, onChange, className }: Props) => {
  // Use a ref to track if the update came from the editor itself to prevent loops
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4 shadow-sm border',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px] max-w-none',
      },
      // --- THÊM PHẦN XỬ LÝ KÉO THẢ (DRAG & DROP) ---
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];

          // Kiểm tra xem có phải là file ảnh không
          if (file.type.startsWith('image/')) {
            event.preventDefault(); // Ngăn trình duyệt mở ảnh trong tab mới

           UploadService.uploadFiles([file]).then((uploadedFiles) => {
                if (uploadedFiles && uploadedFiles.length > 0) {
                    const { schema } = view.state;
                    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    
                    if (coordinates) {
                        const node = schema.nodes.image.create({ src: uploadedFiles[0].url });
                        const transaction = view.state.tr.insert(coordinates.pos, node);
                        view.dispatch(transaction);
                    }
                }
            });

            return true; 
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      onChange(html);
      setTimeout(() => { isInternalUpdate.current = false }, 0);
    },
    immediatelyRender: false,
  });

  // Sync external value changes to editor
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isInternalUpdate.current) {
        const { from, to } = editor.state.selection;
        editor.commands.setContent(value, { emitUpdate: false });
        editor.commands.setTextSelection({ from, to });
    }
  }, [value, editor]);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col ${className || 'h-[400px]'}`}>
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto bg-white cursor-text" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;