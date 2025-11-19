'use client'

import { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'

interface TinyMCEEditorProps {
  value: string
  onEditorChange: (content: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
}

export function TinyMCEEditor({
  value,
  onEditorChange,
  placeholder = 'Nhập nội dung...',
  height = 400,
  disabled = false,
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null)

  return (
    <Editor
      apiKey="no-api-key" // Sử dụng TinyMCE community version (no API key needed for basic features)
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      onEditorChange={onEditorChange}
      disabled={disabled}
      init={{
        height,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder,
        skin: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide',
        content_css: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
      }}
    />
  )
}
