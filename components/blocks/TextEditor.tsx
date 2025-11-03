'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { sanitizeHtml } from '../../lib/sanitize'
// Text alignment extension
// @ts-ignore
import TextAlign from '@tiptap/extension-text-align'
// TypeScript sometimes complains about missing declaration files for Tiptap table
// extensions. These imports are correct at runtime; ignore TS declaration errors.
// @ts-ignore
import { Table } from '@tiptap/extension-table'
// @ts-ignore
import { TableRow } from '@tiptap/extension-table-row'
// @ts-ignore
import { TableHeader } from '@tiptap/extension-table-header'
// @ts-ignore
import { TableCell } from '@tiptap/extension-table-cell'

interface TextEditorProps {
  content?: any
  settings?: {
    alignment?: 'left' | 'center' | 'right' | 'justify'
    maxWidth?: string
    padding?: {
      top: number
      right: number
      bottom: number
      left: number
    }
    margin?: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#045D5E]">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  if (!editor) {
    return null
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageModal(false)
    }
  }

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setShowLinkModal(false)
      return
    }

    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkModal(false)
    }
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run()
    setTableRows(3)
    setTableCols(3)
    setShowTableModal(false)
  }

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href
    setLinkUrl(previousUrl || '')
    setShowLinkModal(true)
  }

  const getHeadingLevel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1'
    if (editor.isActive('heading', { level: 2 })) return 'h2'
    if (editor.isActive('heading', { level: 3 })) return 'h3'
    return 'normal'
  }

  const handleHeadingChange = (value: string) => {
    if (value === 'normal') {
      editor.chain().focus().setParagraph().run()
    } else if (value === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    } else if (value === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    } else if (value === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    }
  }

  // Determine current alignment for the selection (paragraph or heading)
  const getSelectionAlignment = () => {
    try {
      const p = editor.getAttributes('paragraph')
      if (p && p.textAlign) return p.textAlign
      const h = editor.getAttributes('heading')
      if (h && h.textAlign) return h.textAlign
    } catch (e) {
      // ignore
    }
    return 'left'
  }

  const handleAlignmentChange = (value: string) => {
    // Apply alignment to the blocks currently selected. This won't change the whole document.
    if (!value) return
    editor.chain().focus().setTextAlign(value as any).run()
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b-2 border-gray-200 p-2 mb-4 shadow-sm rounded-t-xl">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text formatting */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('bold')
                  ? 'bg-[#045D5E] text-white'
                  : 'hover:bg-[#F1F4F3] text-[#045D5E]'
              }`}
              title="Bold"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 2A1.5 1.5 0 004 3.5v13A1.5 1.5 0 005.5 18h5.25a3.75 3.75 0 002.006-6.93A3.5 3.5 0 0010.5 4H5.5zm.75 2h4.25a1.5 1.5 0 010 3H6.25V4zm0 5h4.75a2.25 2.25 0 010 4.5H6.25V9z"/>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('italic')
                  ? 'bg-[#045D5E] text-white'
                  : 'hover:bg-[#F1F4F3] text-[#045D5E]'
              }`}
              title="Italic"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.5 4a.5.5 0 01.5-.5h3a.5.5 0 010 1h-1.146l-1.708 7H10.5a.5.5 0 010 1h-3a.5.5 0 010-1h1.146l1.708-7H8.5a.5.5 0 01-.5-.5z"/>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('strike')
                  ? 'bg-[#045D5E] text-white'
                  : 'hover:bg-[#F1F4F3] text-[#045D5E]'
              }`}
              title="Strikethrough"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </div>

          {/* Heading Dropdown */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <select
              value={getHeadingLevel()}
              onChange={(e) => handleHeadingChange(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors border-2 border-[#045D5E] bg-white text-[#045D5E] hover:bg-[#F1F4F3] focus:ring-2 focus:ring-[#FC7300] cursor-pointer"
              title="Text Style"
            >
              <option value="normal">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
          </div>

          {/* Alignment Dropdown - applies only to current selection */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <select
              value={getSelectionAlignment()}
              onChange={(e) => handleAlignmentChange(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors border-2 border-[#045D5E] bg-white text-[#045D5E] hover:bg-[#F1F4F3] focus:ring-2 focus:ring-[#FC7300] cursor-pointer"
              title="Text Alignment"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('bulletList')
                  ? 'bg-[#045D5E] text-white'
                  : 'hover:bg-[#F1F4F3] text-[#045D5E]'
              }`}
              title="Bullet List"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H4zM4 9a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H4zM4 14a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H4zM8 5a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zM9 9a1 1 0 100 2h6a1 1 0 100-2H9zM8 15a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1z"/>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('orderedList')
                  ? 'bg-[#045D5E] text-white'
                  : 'hover:bg-[#F1F4F3] text-[#045D5E]'
              }`}
              title="Numbered List"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
              </svg>
            </button>
          </div>

          {/* Special elements */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('blockquote')
                  ? 'bg-[#045D5E] text-white'
                  : 'hover:bg-[#F1F4F3] text-[#045D5E]'
              }`}
              title="Quote"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.691 6.292C5.094 4.771 7.217 4 10 4s4.906.771 6.309 2.292c1.402 1.521 1.402 3.895 0 5.416C15.906 13.229 13.783 14 11 14s-4.906-.771-6.309-2.292c-1.402-1.521-1.402-3.895 0-5.416zM11 7a1 1 0 012 0v3a1 1 0 11-2 0V7zM7 7a1 1 0 012 0v3a1 1 0 11-2 0V7z"/>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('codeBlock')
                  ? 'bg-[#045D5E] text-white'
                  : 'hover:bg-[#F1F4F3] text-[#045D5E]'
              }`}
              title="Code Block"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </div>

          {/* Link and Image */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              onClick={openLinkModal}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('link')
                  ? 'bg-[#045D5E] text-white'
                  : 'hover:bg-[#F1F4F3] text-[#045D5E]'
              }`}
              title="Add Link"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
              </svg>
            </button>
            <button
              onClick={() => setShowImageModal(true)}
              className="p-2 rounded-lg transition-colors hover:bg-[#F1F4F3] text-[#045D5E]"
              title="Add Image"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              onClick={() => setShowTableModal(true)}
              className="p-2 rounded-lg transition-colors hover:bg-[#F1F4F3] text-[#045D5E]"
              title="Insert Table"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h2V5H5zm4 0v2h2V5H9zm4 0v2h2V5h-2zM5 9v2h2V9H5zm4 0v2h2V9H9zm4 0v2h2V9h-2zM5 13v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="p-2 rounded-lg transition-colors hover:bg-[#F1F4F3] text-[#045D5E] disabled:opacity-50"
              title="Undo"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 110 14H4a1 1 0 110-2h7a5 5 0 100-10H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="p-2 rounded-lg transition-colors hover:bg-[#F1F4F3] text-[#045D5E] disabled:opacity-50"
              title="Redo"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 100 10h7a1 1 0 110 2H9A7 7 0 119 7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)} title="Insert Image">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
              onKeyPress={(e) => e.key === 'Enter' && addImage()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowImageModal(false)}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addImage}
              className="px-4 py-2 rounded-lg bg-[#045D5E] text-white hover:bg-[#034546] transition-colors"
            >
              Insert
            </button>
          </div>
        </div>
      </Modal>

      {/* Link Modal */}
      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Insert Link">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
              onKeyPress={(e) => e.key === 'Enter' && setLink()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowLinkModal(false)}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={setLink}
              className="px-4 py-2 rounded-lg bg-[#045D5E] text-white hover:bg-[#034546] transition-colors"
            >
              {linkUrl ? 'Update Link' : 'Remove Link'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Table Modal */}
      <Modal isOpen={showTableModal} onClose={() => setShowTableModal(false)} title="Insert Table">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rows</label>
            <input
              type="number"
              value={tableRows}
              onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
              aria-label="Number of rows"
              placeholder="3"
              min="1"
              max="20"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Columns</label>
            <input
              type="number"
              value={tableCols}
              onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
              aria-label="Number of columns"
              placeholder="3"
              min="1"
              max="10"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowTableModal(false)}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={insertTable}
              className="px-4 py-2 rounded-lg bg-[#045D5E] text-white hover:bg-[#034546] transition-colors"
            >
              Insert Table
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default function TextEditor({ 
  content = { json: null, html: '' }, 
  settings = {}, 
  isEditor = false, 
  onUpdate 
}: TextEditorProps) {
  const {
    alignment = 'left',
    maxWidth = '100%',
    padding = { top: 0, right: 0, bottom: 0, left: 0 },
    margin = { top: 0, right: 0, bottom: 16, left: 0 }
  } = settings
  

  const editor = useEditor({
    // Avoid SSR hydration mismatch: explicitly disable immediate render on server
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#FC7300] hover:text-[#e66800] underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-gray-300',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-gray-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-[#F1F4F3] font-semibold text-[#045D5E]',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
    ],
  content: content.json || content.html || '<p>Start writing...</p>',
    onUpdate: ({ editor }) => {
      if (onUpdate && isEditor) {
        const json = editor.getJSON()
        const html = editor.getHTML()
        onUpdate({ json, html }, settings)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none prose-headings:text-[#045D5E] prose-a:text-[#FC7300] prose-strong:text-[#045D5E] prose-blockquote:border-l-[#FC7300] prose-code:text-[#045D5E] prose-code:bg-[#F1F4F3]',
      },
    },
  })

  useEffect(() => {
    if (editor && content.json && JSON.stringify(editor.getJSON()) !== JSON.stringify(content.json)) {
      editor.commands.setContent(content.json)
    }
  }, [editor, content.json])

  const getAlignmentClass = (align: string) => {
    const alignMap: Record<string, string> = {
      'left': 'text-left',
      'center': 'text-center',
      'right': 'text-right',
      'justify': 'text-justify'
    }
    return alignMap[align] || 'text-left'
  }

  // Convert dynamic settings (maxWidth, margin, padding) into Tailwind utility classes
  const widthClass = maxWidth === '100%' ? 'max-w-full' : `max-w-[${maxWidth}]`
  const marginClass = `mt-[${margin.top}px] mr-[${margin.right}px] mb-[${margin.bottom}px] ml-[${margin.left}px]`
  const paddingClass = `pt-[${padding.top}px] pr-[${padding.right}px] pb-[${padding.bottom}px] pl-[${padding.left}px]`

  if (isEditor) {
    // eslint-disable-next-line
    return (
      <div className="space-y-4">
        {/* Settings Panel */}
        <div className="p-4 bg-[#F1F4F3] rounded-xl border border-gray-200 space-y-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Max Width</label>
              <select
                value={maxWidth}
                onChange={(e) => onUpdate && onUpdate(content, { ...settings, maxWidth: e.target.value })}
                className="px-3 py-2 border-2 border-[#045D5E] rounded-lg text-sm bg-white text-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
                aria-label="Maximum width"
              >
                <option value="100%">Full Width</option>
                <option value="800px">800px</option>
                <option value="700px">700px</option>
                <option value="600px">600px</option>
                <option value="500px">500px</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Alignment</label>
              <select
                value={alignment}
                onChange={(e) => onUpdate && onUpdate(content, { ...settings, alignment: e.target.value })}
                className="px-3 py-2 border-2 border-[#045D5E] rounded-lg text-sm bg-white text-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
                aria-label="Text alignment"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
          </div>
        </div>

        {/* Editor */}
        {/* eslint-disable-next-line */}
        <div 
          className={`border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#045D5E] transition-colors ${getAlignmentClass(alignment)} ${widthClass} ${marginClass}`}
        >
          <MenuBar editor={editor} />
          <div className={`min-h-32 ${paddingClass}`}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    )
  }

  // Read-only mode
  // eslint-disable-next-line
  return (
    <div 
      className={`prose prose-slate max-w-none prose-headings:text-[#045D5E] prose-a:text-[#FC7300] prose-strong:text-[#045D5E] prose-blockquote:border-l-[#FC7300] prose-code:text-[#045D5E] prose-code:bg-[#F1F4F3] ${getAlignmentClass(alignment)} ${widthClass} ${marginClass} ${paddingClass}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.html || content.json || '<p>No content</p>') }}
    />
  )
}

// Read-only component for displaying published content
export function ReadOnlyTextRenderer({ content }: { content: any }) {
  const editor = useEditor({
    // Avoid SSR hydration mismatch in read-only renderer
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        HTMLAttributes: {
          class: 'text-[#FC7300] hover:text-[#e66800] underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-gray-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-[#F1F4F3] font-semibold text-[#045D5E]',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
    ],
    content: content.json || content.html || '',
    editable: false,
  })

  return (
    <div className="prose prose-slate max-w-none prose-headings:text-[#045D5E] prose-a:text-[#FC7300] prose-strong:text-[#045D5E] prose-blockquote:border-l-[#FC7300] prose-code:text-[#045D5E] prose-code:bg-[#F1F4F3]">
      <EditorContent editor={editor} />
    </div>
  )
}