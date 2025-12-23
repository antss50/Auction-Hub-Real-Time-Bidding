import React, {useRef} from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold, Italic, List, ListOrdered, Quote,
  Heading1, Heading2, Undo, Redo, Image as ImageIcon, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Underline as UnderlineIcon, Eraser
} from 'lucide-react';
import  { UploadService }  from '../../../services/upload.service';

interface Props {
  editor: Editor | null;
}

export const EditorToolbar = ({ editor }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!editor) return null;

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 2. Hàm xử lý khi người dùng chọn file
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // --- XỬ LÝ UPLOAD TẠI ĐÂY ---
    const uploadedFiles = await UploadService.uploadFiles([file]);

    if (uploadedFiles && uploadedFiles.length > 0) {
      editor.chain().focus().setImage({ src: uploadedFiles[0].url }).run();
    } else {
       alert("Lỗi upload ảnh! Vui lòng thử lại.");
    }
    // Reset input để có thể chọn lại cùng 1 file nếu muốn
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const btnClass = (isActive: boolean) =>
    `p-2 rounded hover:bg-gray-200 transition-colors ${isActive ? 'bg-gray-200 text-black font-bold' : 'text-gray-600'}`;

  return (
    <div className="border-b p-2 bg-gray-50 flex flex-wrap gap-1 sticky top-0 z-10 items-center">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Headings */}
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

      {/* Basic Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="In đậm"
        type="button"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="In nghiêng"
        type="button"
      >
        <Italic size={18} />
      </button>
       <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
        title="Gạch chân"
        type="button"
      >
        <UnderlineIcon size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Alignment - Requires Tiptap TextAlign extension */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={btnClass(editor.isActive({ textAlign: 'left' }))}
        title="Căn trái"
        type="button"
      >
        <AlignLeft size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={btnClass(editor.isActive({ textAlign: 'center' }))}
        title="Căn giữa"
        type="button"
      >
        <AlignCenter size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={btnClass(editor.isActive({ textAlign: 'right' }))}
        title="Căn phải"
        type="button"
      >
        <AlignRight size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={btnClass(editor.isActive({ textAlign: 'justify' }))}
        title="Căn đều"
        type="button"
      >
        <AlignJustify size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Lists & Quote */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="Danh sách"
        type="button"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="Danh sách số"
        type="button"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title="Trích dẫn"
        type="button"
      >
        <Quote size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Extras */}
      <button 
        onClick={handleImageButtonClick} 
        className={btnClass(false)} 
        title="Tải ảnh lên" 
        type="button"
      >
        <ImageIcon size={18} />
      </button>

       <button
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className={btnClass(false)}
        title="Xóa định dạng"
        type="button"
      >
        <Eraser size={18} />
      </button>

      <div className="flex-1"></div>

      {/* History */}
      <button onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)} title="Hoàn tác" type="button">
        <Undo size={18} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)} title="Làm lại" type="button">
        <Redo size={18} />
      </button>
    </div>
  );
};