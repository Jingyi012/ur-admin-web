// components/QuillEditor.tsx
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Quill.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isEditMode?: boolean;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, placeholder, isEditMode }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ color: [] }, { background: [] }], // Text color and background color
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'color',
    'background',
    'align',
    'list',
    'bullet',
    'link',
    'image',
  ];

  return (
    <div className={`quill-container ${!isEditMode ? 'quill-readonly' : ''}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write something...'}
        readOnly={!isEditMode}
      />
    </div>
  );
};

export default QuillEditor;
