'use client'

import React, { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BlockRenderer, { AVAILABLE_BLOCK_TYPES } from '@/components/BlockRenderer'
import { v4 as uuidv4 } from 'uuid'

interface BlockData {
  id: string
  type: string
  content: any
  settings?: any
  order: number
}

interface BlockEditorProps {
  initialBlocks?: BlockData[]
  onChange?: (blocks: BlockData[]) => void
}

// Sortable Block Wrapper Component
function SortableBlock({ block, index, onUpdate, onDelete }: {
  block: BlockData
  index: number
  onUpdate: (blockId: string, content: any, settings: any) => void
  onDelete: (blockId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white border border-gray-200 rounded-lg overflow-hidden ${
        isDragging ? 'shadow-lg z-10' : 'shadow-sm'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="bg-gray-50 px-4 py-2 border-b border-gray-200 cursor-grab active:cursor-grabbing flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-gray-600 capitalize font-medium">
            {block.type} Block
          </span>
        </div>
      </div>

      {/* Delete Button - Outside drag handle */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(block.id)
          }}
          className="text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:shadow-md transition-all"
          title="Delete block"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Block Content */}
      <div className="p-4">
        <BlockRenderer
          blocks={[block]}
          isEditor={true}
          onBlockUpdate={onUpdate}
        />
      </div>
    </div>
  )
}

export default function BlockEditor({ initialBlocks = [], onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<BlockData[]>(initialBlocks)
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [undoStack, setUndoStack] = useState<Array<{action: string, data: any, timestamp: number}>>([])
  const [showUndo, setShowUndo] = useState(false)

  // Sync with initialBlocks when it changes
  useEffect(() => {
    setBlocks(initialBlocks)
  }, [initialBlocks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id)
      const newIndex = blocks.findIndex(block => block.id === over.id)
      
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order: index + 1,
      }))
      
      setBlocks(newBlocks)
      onChange?.(newBlocks)
    }
  }, [blocks, onChange])

  const addBlock = useCallback((blockType: string) => {
    const newBlock: BlockData = {
      id: uuidv4(),
      type: blockType,
      content: getDefaultContent(blockType),
      settings: getDefaultSettings(blockType),
      order: blocks.length + 1,
    }

    const newBlocks = [...blocks, newBlock]
    setBlocks(newBlocks)
    onChange?.(newBlocks)
    setShowBlockPicker(false)
  }, [blocks, onChange])

  const updateBlock = useCallback((blockId: string, content: any, settings: any) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, content, settings } : block
    )
    setBlocks(newBlocks)
    onChange?.(newBlocks)
  }, [blocks, onChange])

  const deleteBlock = useCallback((blockId: string) => {
    // Store the deleted block for undo
    const deletedBlock = blocks.find(block => block.id === blockId)
    if (deletedBlock) {
      const undoAction = {
        action: 'deleteMainBlock',
        data: { block: deletedBlock, position: blocks.findIndex(block => block.id === blockId) },
        timestamp: Date.now()
      }
      setUndoStack(prev => [undoAction, ...prev.slice(0, 4)]) // Keep last 5 actions
      setShowUndo(true)
      setTimeout(() => setShowUndo(false), 5000) // Hide undo after 5 seconds
    }

    const newBlocks = blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index + 1 }))
    
    setBlocks(newBlocks)
    onChange?.(newBlocks)
  }, [blocks, onChange])

  const undoLastAction = useCallback(() => {
    if (undoStack.length === 0) return

    const lastAction = undoStack[0]
    const remainingActions = undoStack.slice(1)
    setUndoStack(remainingActions)

    if (lastAction.action === 'deleteMainBlock') {
      const { block, position } = lastAction.data
      const newBlocks = [...blocks]
      newBlocks.splice(position, 0, block)
      const reorderedBlocks = newBlocks.map((block, index) => ({ ...block, order: index + 1 }))
      
      setBlocks(reorderedBlocks)
      onChange?.(reorderedBlocks)
    }

    if (remainingActions.length === 0) {
      setShowUndo(false)
    }
  }, [undoStack, blocks, onChange])

  return (
    <div className="space-y-6">
      {/* Block List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <SortableBlock
                key={block.id}
                block={block}
                index={index}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Block Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 flex justify-center">
          {!showBlockPicker ? (
          <button
            onClick={() => setShowBlockPicker(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Block
          </button>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Block</h3>
              <button
                onClick={() => setShowBlockPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_BLOCK_TYPES.map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <span className="text-lg mr-3" aria-hidden="true">
                    {blockType.icon}
                  </span>
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {blockType.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
        
        {/* Undo Button */}
        {(showUndo || undoStack.length > 0) && (
          <button
            onClick={undoLastAction}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition-colors flex items-center gap-1"
          >
            ↶ Undo ({undoStack.length})
          </button>
        )}
      </div>

      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content blocks yet</h3>
          <p className="text-gray-600 mb-4">Start building your post by adding content blocks</p>
        </div>
      )}
    </div>
  )
}

// Helper functions for default content and settings
function getDefaultContent(blockType: string): any {
  const defaults: Record<string, any> = {
    title: {
      text: 'Enter your heading...',
      level: 2,
    },
    paragraph: {
      text: 'Start writing your paragraph here...',
    },
    image: {
      imageUrl: '',
      alt: '',
      caption: '',
    },
    button: {
      text: 'Click here',
      url: '',
      external: false,
    },
    card: {
      title: 'Card Title',
      content: 'Card content goes here...',
      imageUrl: '',
      link: '',
    },
    accordion: {
      items: [
        {
          title: 'Accordion Item 1',
          content: 'Content for the first accordion item...',
        },
      ],
    },
    tabs: {
      tabs: [
        {
          title: 'Tab 1',
          content: 'Content for the first tab...',
        },
      ],
    },
    layout2: {
      columns: 2,
      columnWidths: [50, 50],
      columnBlocks: [[], []]
    },
    layout3: {
      columns: 3,
      columnWidths: [33, 34, 33],
      columnBlocks: [[], [], []]
    },
    layout4: {
      columns: 4,
      columnWidths: [25, 25, 25, 25],
      columnBlocks: [[], [], [], []]
    },
  }

  return defaults[blockType] || {}
}

function getDefaultSettings(blockType: string): any {
  const commonSpacing = {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    margin: { top: 0, right: 0, bottom: 16, left: 0 }
  }

  const defaults: Record<string, any> = {
    title: {
      alignment: 'left',
      fontSize: 'default',
      color: 'default',
      ...commonSpacing
    },
    paragraph: {
      alignment: 'left',
      fontSize: 'default',
      ...commonSpacing
    },
    image: {
      alignment: 'center',
      size: 'medium',
      ...commonSpacing
    },
    button: {
      style: 'primary',
      size: 'md',
      alignment: 'left',
      textColor: 'black',
      ...commonSpacing
    },
    card: {
      theme: 'default',
      imagePosition: 'top',
      ...commonSpacing
    },
    accordion: {
      theme: 'default',
      allowMultiple: false,
      ...commonSpacing
    },
    tabs: {
      orientation: 'horizontal',
      theme: 'default',
      ...commonSpacing
    },
    layout2: {
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
      margin: { top: 0, right: 0, bottom: 16, left: 0 },
      gap: 16,
      minHeight: 150
    },
    layout3: {
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
      margin: { top: 0, right: 0, bottom: 16, left: 0 },
      gap: 16,
      minHeight: 150
    },
    layout4: {
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
      margin: { top: 0, right: 0, bottom: 16, left: 0 },
      gap: 12,
      minHeight: 150
    },
  }

  return defaults[blockType] || { ...commonSpacing }
}