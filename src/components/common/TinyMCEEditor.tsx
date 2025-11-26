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
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
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
          'insertdatetime', 'media', 'table', 'help', 'wordcount', 'paste'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder,
        skin: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide',
        content_css: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',

        // Paste configuration - BẮT BUỘC paste as plain text khi có Word binary
        paste_preprocess: (plugin: any, args: any) => {
          // Kiểm tra Word binary data
          const hasWordBinary = args.content && (
            args.content.includes('docData;') ||
            args.content.includes('DOCY;') ||
            args.content.includes('class="docData')
          )

          if (hasWordBinary) {
            console.warn('⚠️ Detected Word binary format - forcing plain text paste')
            // Force paste as plain text - TinyMCE sẽ tự động lấy text version
            args.content = ''
            return
          }

          // Clean HTML paste từ Word (không có binary)
          args.content = args.content.replace(/<(\/)?(o:p|w:|m:|v:)[^>]*>/gi, '')
          args.content = args.content.replace(/<!--\[if [^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '')
          args.content = args.content.replace(/<p[^>]*>\s*(&nbsp;|\s)*<\/p>/gi, '')
        },

        // Valid elements - chỉ cho phép các HTML tags an toàn
        valid_elements: 'p[style],strong,em,u,s,h1,h2,h3,h4,h5,h6,ul,ol,li,a[href|target],br,span[style],div[style],table,thead,tbody,tr,th[scope],td,img[src|alt|width|height]',

        // Extended valid elements cho paste từ Word
        extended_valid_elements: 'p[class|style],span[class|style],div[class|style]',

        // Remove invalid tags
        invalid_elements: 'script,style,meta,link,object,embed,iframe',

        // Force root block
        forced_root_block: 'p',
        forced_root_block_attrs: {},

        // Clean pasted content
        verify_html: true,
      }}
    />
  )
}
