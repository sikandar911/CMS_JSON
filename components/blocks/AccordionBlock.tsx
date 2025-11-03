'use client'

import React, { useState } from 'react'

interface AccordionItem {
  id: string
  title: string
  body: string
}

interface AccordionBlockProps {
  content: {
    items: AccordionItem[]
  }
  settings?: {
    multipleOpen?: boolean
    theme?: 'default' | 'bordered' | 'minimal'
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

export default function AccordionBlock({
  content,
  settings = {},
  isEditor = false,
  onUpdate
}: AccordionBlockProps) {
  const { multipleOpen = false, theme = 'default' } = settings
  const { items = [] } = content
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const handleToggle = (itemId: string) => {
    const newOpenItems = new Set(openItems)
    
    if (multipleOpen) {
      if (newOpenItems.has(itemId)) {
        newOpenItems.delete(itemId)
      } else {
        newOpenItems.add(itemId)
      }
    } else {
      newOpenItems.clear()
      if (!openItems.has(itemId)) {
        newOpenItems.add(itemId)
      }
    }
    
    setOpenItems(newOpenItems)
  }

  const handleAddItem = () => {
    if (onUpdate) {
      const newItem: AccordionItem = {
        id: `acc-${Date.now()}`,
        title: 'New Accordion Item',
        body: '<p>Enter your content here...</p>'
      }
      onUpdate({ items: [...items, newItem] }, settings)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    if (onUpdate) {
      const updatedItems = items.filter(item => item.id !== itemId)
      onUpdate({ items: updatedItems }, settings)
    }
  }

  const handleItemUpdate = (itemId: string, field: 'title' | 'body', value: string) => {
    if (onUpdate) {
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
      onUpdate({ items: updatedItems }, settings)
    }
  }

  const handleSettingsChange = (newSettings: any) => {
    if (onUpdate) {
      onUpdate(content, { ...settings, ...newSettings })
    }
  }

  const getThemeClasses = () => {
    switch (theme) {
      case 'bordered':
        return {
          container: 'border-2 border-[#045D5E] rounded-xl overflow-hidden',
          item: 'border-b-2 border-gray-200 last:border-b-0',
          header: 'px-5 py-4 bg-white hover:bg-[#F1F4F3] cursor-pointer transition-colors duration-200',
          content: 'px-5 py-4 bg-[#F1F4F3]'
        }
      case 'minimal':
        return {
          container: '',
          item: 'mb-3',
          header: 'py-3 cursor-pointer hover:text-[#FC7300] transition-colors duration-200 font-semibold text-[#045D5E]',
          content: 'pt-2 pb-4'
        }
      default:
        return {
          container: 'space-y-3',
          item: 'bg-white border-2 border-gray-200 hover:border-[#045D5E] rounded-xl overflow-hidden transition-all duration-200',
          header: 'px-5 py-4 cursor-pointer hover:bg-[#F1F4F3] transition-colors duration-200 flex items-center justify-between font-semibold text-[#045D5E]',
          content: 'px-5 py-4 border-t-2 border-gray-200 bg-[#F1F4F3]'
        }
    }
  }

  const themeClasses = getThemeClasses()

  if (isEditor) {
    return (
      <div className="space-y-4">
        {/* Settings Panel */}
        <div className="p-4 bg-[#F1F4F3] rounded-xl border border-gray-200 space-y-3">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => handleSettingsChange({ theme: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
                title="Select accordion theme"
              >
                <option value="default">Default</option>
                <option value="bordered">Bordered</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={multipleOpen}
                  onChange={(e) => handleSettingsChange({ multipleOpen: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Allow multiple items open</span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="px-5 py-3 bg-[#FC7300] text-white rounded-xl hover:bg-[#e66800] transition-colors font-semibold shadow-md"
          >
            Add Accordion Item
          </button>
        </div>

        {/* Editor Items */}
        <div className={themeClasses.container}>
          {items.map((item, index) => (
            <div key={item.id} className={`${themeClasses.item} relative`}>
              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10"
              >
                ✕
              </button>

              {/* Title Editor */}
              <div className="p-3 border-b border-gray-200">
                <label className="block text-xs text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleItemUpdate(item.id, 'title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Enter accordion title..."
                />
              </div>

              {/* Content Editor */}
              <div className="p-3">
                <label className="block text-xs text-gray-600 mb-1">Content</label>
                <div
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: item.body }}
                  onBlur={(e) => handleItemUpdate(item.id, 'body', e.currentTarget.innerHTML)}
                  className="min-h-[80px] p-2 border border-gray-300 rounded prose prose-sm max-w-none bg-white text-black"
                />
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No accordion items yet. Click "Add Accordion Item" to get started.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={themeClasses.container}>
      {items.map((item) => (
        <div key={item.id} className={themeClasses.item}>
          <button
            type="button"
            className={themeClasses.header}
            onClick={() => handleToggle(item.id)}
          >
            <span>{item.title}</span>
            <span className="text-gray-500">
              {openItems.has(item.id) ? '−' : '+'}
            </span>
          </button>
          
          {openItems.has(item.id) && (
            <div className={themeClasses.content}>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          )}
        </div>
      ))}
      
      {items.length === 0 && !isEditor && (
        <div className="text-center py-4 text-gray-500">
          No accordion items to display.
        </div>
      )}
    </div>
  )
}