'use client'

import React from 'react'
import TextEditor from './blocks/TextEditor'
import AccordionBlock from './blocks/AccordionBlock'
import TabBlock from './blocks/TabBlock'
import CardBlock from './blocks/CardBlock'
import ButtonBlock from './blocks/ButtonBlock'
import ImageBlock from './blocks/ImageBlock'
import LayoutBlock from './blocks/LayoutBlock'

interface BlockData {
  id: string
  type: string
  content: any
  settings?: any
  order: number
}

interface BlockRendererProps {
  blocks: BlockData[]
  isEditor?: boolean
  onBlockUpdate?: (blockId: string, content: any, settings: any) => void
  onBlockDelete?: (blockId: string) => void
  onBlockMove?: (blockId: string, direction: 'up' | 'down') => void
}

const BLOCK_COMPONENTS = {
  title: TextEditor,
  paragraph: TextEditor,
  texteditor: TextEditor,
  accordion: AccordionBlock,
  tabs: TabBlock,
  card: CardBlock,
  button: ButtonBlock,
  image: ImageBlock,
  layout2: LayoutBlock,
  layout3: LayoutBlock,
  layout4: LayoutBlock,
} as const

export default function BlockRenderer({
  blocks,
  isEditor = false,
  onBlockUpdate,
  onBlockDelete,
  onBlockMove
}: BlockRendererProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)

  const handleBlockUpdate = (blockId: string, content: any, settings: any) => {
    if (onBlockUpdate) {
      onBlockUpdate(blockId, content, settings)
    }
  }

  const handleBlockDelete = (blockId: string) => {
    if (onBlockDelete) {
      onBlockDelete(blockId)
    }
  }

  const handleBlockMove = (blockId: string, direction: 'up' | 'down') => {
    if (onBlockMove) {
      onBlockMove(blockId, direction)
    }
  }

  const renderBlock = (block: BlockData, index: number) => {
    const BlockComponent = BLOCK_COMPONENTS[block.type as keyof typeof BLOCK_COMPONENTS]
    
    if (!BlockComponent) {
      if (isEditor) {
        return (
          <div key={block.id} className="p-4 border border-red-200 bg-red-50 rounded">
            <p className="text-red-600 text-sm">Unknown block type: {block.type}</p>
            <p className="text-xs text-gray-500 mt-1">Block ID: {block.id}</p>
          </div>
        )
      }
      return null
    }

    const blockElement = (
      <BlockComponent
        key={block.id}
        content={block.content || {}}
        settings={block.settings || {}}
        isEditor={isEditor}
        onUpdate={(content: any, settings: any) => 
          handleBlockUpdate(block.id, content, settings)
        }
      />
    )

    // Wrap with editor controls if in editor mode
    if (isEditor) {
      return (
        <div
          key={block.id}
          className={`block-editor-wrapper group relative my-4 sm:my-0 px-4 sm:px-0 p-4 sm:p-0 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors`}
          data-block-id={block.id}
          data-block-type={block.type}
        >
          {/* Block Controls */}
          <div className="absolute -top-3 left-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded border shadow-sm">
            <span className="text-xs text-gray-500 capitalize">{block.type}</span>
            
            {/* Move Up Button */}
            {index > 0 && (
              <button
                onClick={() => handleBlockMove(block.id, 'up')}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Move up"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Move Down Button */}
            {index < sortedBlocks.length - 1 && (
              <button
                onClick={() => handleBlockMove(block.id, 'down')}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Move down"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={() => handleBlockDelete(block.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete block"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Block Content */}
          <div className="block-content prose max-w-none">
            {blockElement}
          </div>
        </div>
      )
    }

    // For display mode, check if it's a layout block to remove extra padding
    const isLayoutBlock = block.type.startsWith('layout')
    
    return (
      <div key={block.id} className={isLayoutBlock ? "" : "my-4 sm:my-0 px-4 sm:px-0"}>
        <div className={isLayoutBlock ? "" : "prose max-w-none"}>{blockElement}</div>
      </div>
    )
  }
  

  if (!blocks || blocks.length === 0) {
    if (isEditor) {
      return (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">No content blocks yet</p>
          <p className="text-sm">Add some blocks to start building your post</p>
        </div>
      )
    }
    
    return null
  }

  const containerClass = isEditor
    ? 'block-renderer editor-mode mx-auto px-2 my-1 sm:my-1 font-sans text-gray-800 space-y-6'
    : 'block-renderer display-mode mx-auto px-2 my-1 sm:my-1 font-sans text-gray-800 '

  return (
    <div className={containerClass}>
      {sortedBlocks.map((block, index) => renderBlock(block, index))}
    </div>
  )
}

// Export block types for use in other components
export const AVAILABLE_BLOCK_TYPES = [
  { type: 'texteditor', label: 'Rich Text Editor', icon: '📝' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'card', label: 'Card', icon: '📄' },
  { type: 'accordion', label: 'Accordion', icon: '📋' },
  { type: 'tabs', label: 'Tabs', icon: '📑' },
  { type: 'layout2', label: '2-Column Layout', icon: '' },
  { type: 'layout3', label: '3-Column Layout', icon: '' },
  { type: 'layout4', label: '4-Column Layout', icon: '' },
]

export type { BlockData }