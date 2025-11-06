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
    theme?: 'light' | 'shadow' | 'bordered' | 'splitted'
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
  const { multipleOpen = false, theme = 'light' } = settings
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

  const getThemeClasses = (isOpen: boolean) => {
    switch (theme) {
      case 'shadow':
        return {
          container: 'space-y-4',
          item: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200',
          header: 'w-full px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-[#045D5E] hover:to-[#0a7c7a] hover:text-white transition-all duration-200 font-semibold text-[#045D5E] rounded-lg',
          headerOpen: 'bg-gradient-to-r from-[#045D5E] to-[#0a7c7a] text-white rounded-t-lg rounded-b-none',
          content: 'px-4 sm:px-6 py-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50'
        }
      case 'bordered':
        return {
          container: 'space-y-3',
          item: 'bg-white border-2 border-[#045D5E] rounded-lg overflow-hidden hover:border-[#044041] transition-colors duration-200',
          header: 'w-full px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer  transition-colors duration-200 font-semibold text-[#045D5E]',
          headerOpen: 'bg-[#045D5E] hover:bg-[#044041] text-white',
          content: 'px-4 sm:px-6 py-4 border-t-2 border-[#045D5E] bg-[#F1F4F3]'
        }
      case 'splitted':
        return {
          container: 'space-y-2 px-2 sm:px-0',
          item: 'bg-gradient-to-r from-[#045D5E] to-[#0a7c7a] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform origin-center',
          header: 'w-full px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer text-white font-semibold hover:from-[#034d4c] hover:to-[#086666] hover:bg-gradient-to-r transition-all duration-200',
          headerOpen: 'bg-gradient-to-r from-[#0a7c7a] to-[#0a7c7a]',
          content: 'px-4 sm:px-6 py-4 bg-gradient-to-br from-white via-gray-50 to-white text-gray-800 border-t-2 border-[#045D5E] border-opacity-60'
        }
      default: // light
        return {
          container: 'space-y-3',
          item: 'bg-white rounded-lg overflow-hidden border border-gray-200',
          header: 'w-full px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors duration-200 font-semibold text-[#045D5E]',
          headerOpen: 'bg-[#F1F4F3]',
          content: 'px-4 sm:px-6 py-4 bg-white text-gray-700'
        }
    }
  }

  const themeClasses = getThemeClasses(false)

  // Icon Component
  const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg
      className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      {/* Right-pointing chevron '>' that rotates down when open */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4l8 8-8 8" />
    </svg>
  )

  if (isEditor) {
    return (
      <div className="space-y-4">
        {/* Settings Panel */}
        <div className="p-4 bg-[#F1F4F3] rounded-lg border-2 border-[#045D5E] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => handleSettingsChange({ theme: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#045D5E] focus:outline-none text-sm bg-white text-black"
                title="Select accordion theme"
              >
                <option value="light">Light</option>
                <option value="shadow">Shadow</option>
                <option value="bordered">Bordered</option>
                <option value="splitted">Splitted</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={multipleOpen}
                  onChange={(e) => handleSettingsChange({ multipleOpen: e.target.checked })}
                  className="mr-2 w-4 h-4 rounded border-gray-300 text-[#045D5E] cursor-pointer"
                />
                <span>Multiple items open</span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full px-5 py-3 bg-gradient-to-r from-[#FC7300] to-[#ff8c1a] text-white rounded-lg hover:from-[#e66800] hover:to-[#ff7a00] transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            + Add Accordion Item
          </button>
        </div>

        {/* Editor Items */}
        <div className={themeClasses.container}>
          {items.map((item) => (
            <div key={item.id} className={`${themeClasses.item} relative group`}>
              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 sm:p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                title="Delete accordion item"
                aria-label="Delete accordion item"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Title Editor */}
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <label className="block text-xs text-gray-600 mb-1 font-medium">Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleItemUpdate(item.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#045D5E] focus:ring-2 focus:ring-[#045D5E] focus:ring-opacity-20 focus:outline-none bg-white text-black text-sm"
                  placeholder="Enter accordion title..."
                />
              </div>

              {/* Content Editor */}
              <div className="p-3 sm:p-4">
                <label className="block text-xs text-gray-600 mb-1 font-medium">Content</label>
                <div
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: item.body }}
                  onBlur={(e) => handleItemUpdate(item.id, 'body', e.currentTarget.innerHTML)}
                  className="min-h-[100px] p-3 border border-gray-300 rounded-lg prose prose-sm max-w-none bg-white text-black focus:border-[#045D5E] focus:ring-2 focus:ring-[#045D5E] focus:ring-opacity-20 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            No accordion items yet. Click "Add Accordion Item" to get started.
          </div>
        )}
      </div>
    )
  }

  // Display Mode
  return (
    <div className={themeClasses.container}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id)
        const openClasses = getThemeClasses(isOpen)

        // Render each item with CSS-driven transition (max-height and opacity)
        const AccordionItemView = ({ item, isOpen }: { item: AccordionItem, isOpen: boolean }) => {
          return (
            <div className={themeClasses.item}>
              <button
                type="button"
                className={`${openClasses.header} ${isOpen ? openClasses.headerOpen : ''}`}
                onClick={() => handleToggle(item.id)}
                aria-expanded={!!isOpen}
                aria-controls={`accordion-content-${item.id}`}
              >
                <span className="text-left flex-1 truncate">{item.title}</span>
                <ChevronIcon isOpen={isOpen} />
              </button>

              {/* wrapper using tailwind classes to animate max-height + opacity */}
              <div
                id={`accordion-content-${item.id}`}
                className={`overflow-hidden transition-[max-height,opacity] duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className={openClasses.content}>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.body }} />
                </div>
              </div>
            </div>
          )
        }

        return <AccordionItemView key={item.id} item={item} isOpen={isOpen} />
      })}
      
      {items.length === 0 && !isEditor && (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
          No accordion items to display.
        </div>
      )}
    </div>
  )
}