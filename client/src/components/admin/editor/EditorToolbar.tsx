import React from 'react';
import { type Editor } from '@tiptap/react';
import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Heading1, Heading2, Undo, Redo, Image as ImageIcon 
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export const EditorToolbar = ({ editor }: Props) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Nhập đường dẫn ảnh (URL):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Helper để style nút active
  const btnClass = (isActive: boolean) => 
    `p-2 rounded hover:bg-gray-200 transition-colors ${isActive ? 'bg-gray-200 text-black font-bold' : 'text-gray-600'}`;

  return (
    <div className="border-b p-2 bg-gray-50 flex flex-wrap gap-1 sticky top-0 z-10">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title="Tiêu đề lớn"
        type="button"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive('heading', { level: 3 }))}
        title="Tiêu đề nhỏ"
        type="button"
      >
        <Heading2 size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        type="button"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        type="button"
      >
        <Italic size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        type="button"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        type="button"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        type="button"
      >
        <Quote size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      <button onClick={addImage} className={btnClass(false)} type="button">
        <ImageIcon size={18} />
      </button>

      <div className="flex-1"></div>

      <button onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)} type="button">
        <Undo size={18} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)} type="button">
        <Redo size={18} />
      </button>
    </div>
  );
};