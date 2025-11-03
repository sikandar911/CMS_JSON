'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import BlockRenderer, { AVAILABLE_BLOCK_TYPES } from '../BlockRenderer'
import { v4 as uuidv4 } from 'uuid'
import { useClickOutside } from '../../hooks/useClickOutside'
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
import { CSS } from '@dnd-kit/utilities'
import {
  useSortable,
} from '@dnd-kit/sortable'

interface LayoutBlockProps {
  content: {
    columns: number
    columnWidths: number[]
    columnBlocks: any[][] // Array of blocks for each column
  }
  settings?: {
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
    gap: number
    minHeight?: number
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

export default function LayoutBlock({ 
  content, 
  settings = { gap: 16 }, 
  isEditor = false, 
  onUpdate 
}: LayoutBlockProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [showBlockPicker, setShowBlockPicker] = useState<number | null>(null)
  const [undoStack, setUndoStack] = useState<Array<{action: string, data: any, timestamp: number}>>([])
  const [showUndo, setShowUndo] = useState(false)
  // Local debounced content state to avoid re-render on every keystroke in nested inputs
  const [localContent, setLocalContent] = useState(content)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  // Track viewport for responsive inline styles where needed
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  
  // Store onUpdate and settings in refs to avoid recreating callbacks
  const onUpdateRef = useRef(onUpdate)
  const settingsRef = useRef(settings)
  
  useEffect(() => {
    onUpdateRef.current = onUpdate
    settingsRef.current = settings
  }, [onUpdate, settings])

  // Sync localContent when parent provides externally changed content (e.g. undo at higher level)
  // Only update if the reference actually changed from parent, not from our own updates
  useEffect(() => {
    setLocalContent(content)
  }, [content])

  // Listen for viewport changes to toggle mobile/desktop behavior
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    // Initial sync in case of hydration mismatch
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const scheduleParentUpdate = useCallback((nextContent: any, immediate = false) => {
    setLocalContent(nextContent)
    const updateFn = onUpdateRef.current
    if (!updateFn) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (immediate) {
      updateFn(nextContent, settingsRef.current)
      return
    }
    debounceRef.current = setTimeout(() => {
      if (onUpdateRef.current) {
        onUpdateRef.current(nextContent, settingsRef.current)
      }
    }, 500) // Increased debounce to 500ms to reduce re-renders
  }, []) // Empty deps - truly stable callback
  
  // Close all popups when clicking outside
  const closeAllPopups = () => {
    setShowSettings(false)
    setShowBlockPicker(null)
  }
  const containerRef = useClickOutside(closeAllPopups)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end for nested blocks
  const handleNestedDragEnd = useCallback((event: DragEndEvent, columnIndex: number) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const columnBlocks = localContent.columnBlocks[columnIndex] || []
      const oldIndex = columnBlocks.findIndex(block => block.id === active.id)
      const newIndex = columnBlocks.findIndex(block => block.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumnBlocks = arrayMove(columnBlocks, oldIndex, newIndex).map((block, index) => ({
          ...block,
          order: index + 1,
        }))
        
        const newContent = {
          ...localContent,
          columnBlocks: localContent.columnBlocks.map((blocks, idx) => 
            idx === columnIndex ? newColumnBlocks : blocks
          )
        }
        scheduleParentUpdate(newContent)
      }
    }
  }, [localContent, scheduleParentUpdate])

  // Sortable nested block component
  // Wrapped in React.memo with a custom comparator to avoid re-renders when
  // the block identity, content or settings haven't changed. This helps
  // prevent parent re-renders from causing focus loss inside nested inputs.
  const SortableNestedBlock = React.memo(function SortableNestedBlock({ block, columnIndex }: { block: any, columnIndex: number }) {
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
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative bg-white border border-gray-200 rounded mb-2 ${
          isDragging ? 'shadow-lg z-10' : 'shadow-sm'
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="bg-gray-50 px-2 py-1 border-b border-gray-200 cursor-grab active:cursor-grabbing flex items-center justify-between"
        >
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-600 capitalize">
              {block.type}
            </span>
          </div>
        </div>

        {/* Delete Button - Outside drag handle */}
        <div className="absolute top-1 right-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteBlockFromColumn(columnIndex, block.id)
            }}
            className="text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:shadow-md transition-all"
            title="Delete block"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Block Content */}
        <div className="p-2">
          <BlockRenderer
            blocks={[block]}
            isEditor={true}
            onBlockUpdate={(blockId, content, settings) => 
              updateBlockInColumn(columnIndex, blockId, content, settings)
            }
          />
        </div>
      </div>
    )
  }
  , (prevProps: { block: any, columnIndex: number }, nextProps: { block: any, columnIndex: number }) => {
    // If column changed, re-render
    if (prevProps.columnIndex !== nextProps.columnIndex) return false

    const prevBlock = prevProps.block || {}
    const nextBlock = nextProps.block || {}

    // If block identity changed, re-render
    if (prevBlock.id !== nextBlock.id) return false

    // If block type changed, re-render
    if (prevBlock.type !== nextBlock.type) return false

    // Compare content and settings by reference. Parent updates should
    // create new objects when actual changes happen, so reference
    // equality is a good cheap check to avoid unnecessary renders.
    if (prevBlock.content !== nextBlock.content) return false
    if (prevBlock.settings !== nextBlock.settings) return false

    // No meaningful changes -> skip re-render
    return true
  })

  const {
    columns = 2,
    columnWidths = [50, 50],
    columnBlocks = [[], []]
  } = localContent

  const {
    padding = { top: 16, right: 16, bottom: 16, left: 16 },
    margin = { top: 0, right: 0, bottom: 16, left: 0 },
    gap = 16,
    minHeight = 100
  } = settings

  const handleWidthChange = (columnIndex: number, newWidth: number) => {
    const newWidths = [...columnWidths]
    const totalOtherWidths = newWidths.reduce((sum, width, index) => 
      index !== columnIndex ? sum + width : sum, 0
    )
    
    // Ensure total doesn't exceed 100%
    const maxAllowedWidth = 100 - (totalOtherWidths - newWidths[columnIndex])
    newWidth = Math.min(newWidth, maxAllowedWidth)
    newWidth = Math.max(newWidth, 10) // Minimum 10% width
    
    newWidths[columnIndex] = newWidth
    
    // Adjust other columns proportionally if needed
    const currentTotal = newWidths.reduce((sum, width) => sum + width, 0)
    if (currentTotal > 100) {
      const excess = currentTotal - 100
      const otherColumns = newWidths.map((width, index) => 
        index !== columnIndex ? index : -1
      ).filter(index => index !== -1)
      
      otherColumns.forEach(index => {
        const reduction = (newWidths[index] / totalOtherWidths) * excess
        newWidths[index] = Math.max(10, newWidths[index] - reduction)
      })
    }
    
    scheduleParentUpdate({ ...localContent, columnWidths: newWidths })
  }

  const addBlockToColumn = (columnIndex: number, blockType: string) => {
    const newBlock = {
      id: uuidv4(),
      type: blockType,
      content: getDefaultBlockContent(blockType),
      settings: getDefaultBlockSettings(blockType),
      order: columnBlocks[columnIndex].length
    }

    const newColumnBlocks = [...columnBlocks]
    newColumnBlocks[columnIndex] = [...newColumnBlocks[columnIndex], newBlock]
    scheduleParentUpdate({ ...localContent, columnBlocks: newColumnBlocks })
  }

  const updateBlockInColumn = useCallback((columnIndex: number, blockId: string, blockContent: any, blockSettings: any) => {
    setLocalContent((prevContent) => {
      const newColumnBlocks = [...prevContent.columnBlocks]
      const blockIndex = newColumnBlocks[columnIndex].findIndex(block => block.id === blockId)
      if (blockIndex !== -1) {
        newColumnBlocks[columnIndex] = [...newColumnBlocks[columnIndex]]
        newColumnBlocks[columnIndex][blockIndex] = {
          ...newColumnBlocks[columnIndex][blockIndex],
          content: blockContent,
          settings: blockSettings
        }
        return { ...prevContent, columnBlocks: newColumnBlocks }
      }
      return prevContent
    })
    
    // Debounce the parent update separately using refs
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLocalContent((currentContent) => {
        if (onUpdateRef.current) {
          onUpdateRef.current(currentContent, settingsRef.current)
        }
        return currentContent
      })
    }, 500)
  }, []) // Empty deps - truly stable callback

  const deleteBlockFromColumn = useCallback((columnIndex: number, blockId: string) => {
    setLocalContent((prevContent) => {
      const columnBlocks = prevContent.columnBlocks
      // Store the deleted block for undo
      const deletedBlock = columnBlocks[columnIndex].find(block => block.id === blockId)
      if (deletedBlock) {
        const undoAction = {
          action: 'deleteBlock',
          data: { columnIndex, block: deletedBlock, position: columnBlocks[columnIndex].findIndex(block => block.id === blockId) },
          timestamp: Date.now()
        }
        setUndoStack(prev => [undoAction, ...prev.slice(0, 4)]) // Keep last 5 actions
        setShowUndo(true)
        setTimeout(() => setShowUndo(false), 5000) // Hide undo after 5 seconds
      }

      const newColumnBlocks = [...columnBlocks]
      newColumnBlocks[columnIndex] = newColumnBlocks[columnIndex]
        .filter(block => block.id !== blockId)
        .map((block, index) => ({ ...block, order: index }))
      
      const newContent = { ...prevContent, columnBlocks: newColumnBlocks }
      
      // Update parent immediately for deletions using ref
      if (onUpdateRef.current) {
        onUpdateRef.current(newContent, settingsRef.current)
      }
      
      return newContent
    })
  }, []) // Empty deps - truly stable callback

  const undoLastAction = () => {
    if (undoStack.length === 0) return

    const lastAction = undoStack[0]
    const remainingActions = undoStack.slice(1)
    setUndoStack(remainingActions)

    if (lastAction.action === 'deleteBlock') {
      const { columnIndex, block, position } = lastAction.data
      const newColumnBlocks = [...columnBlocks]
      newColumnBlocks[columnIndex].splice(position, 0, block)
      newColumnBlocks[columnIndex] = newColumnBlocks[columnIndex].map((block, index) => ({ ...block, order: index }))
      scheduleParentUpdate({ ...localContent, columnBlocks: newColumnBlocks }, true)
    }

    if (remainingActions.length === 0) {
      setShowUndo(false)
    }
  }

  const handleSettingsChange = (newSettings: any) => {
    const updateFn = onUpdateRef.current
    if (!updateFn) return
    // Settings changes can be immediate; they don't cause input focus loss issues
    const mergedSettings = { ...settingsRef.current, ...newSettings }
    settingsRef.current = mergedSettings
    updateFn(localContent, mergedSettings)
  }

  const containerStyle = {
    margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
    minHeight: `${minHeight}px`,
    gap: `${gap}px`
  }

  // Helper functions for default block content and settings
  const getDefaultBlockContent = (blockType: string): any => {
    const defaults: Record<string, any> = {
      title: { text: 'Enter your heading...', level: 'h2' },
      paragraph: { html: '<p>Start writing your paragraph here...</p>' },
      image: { imageUrl: '', alt: '', caption: '' },
      button: { text: 'Click here', url: '', external: false },
      card: { title: 'Card Title', content: 'Card content goes here...', imageUrl: '', link: '' },
      accordion: { items: [{ title: 'Accordion Item 1', content: 'Content for the first accordion item...' }] },
      tabs: { tabs: [{ title: 'Tab 1', content: 'Content for the first tab...' }] },
    }
    return defaults[blockType] || {}
  }

  const getDefaultBlockSettings = (blockType: string): any => {
    const commonSpacing = {
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 8, left: 0 }
    }
    
    const defaults: Record<string, any> = {
      title: { alignment: 'left', fontSize: 'default', color: 'default', ...commonSpacing },
      paragraph: { alignment: 'left', fontSize: 'default', ...commonSpacing },
      image: { alignment: 'center', size: 'medium', ...commonSpacing },
      button: { style: 'primary', size: 'md', alignment: 'left', ...commonSpacing },
      card: { theme: 'default', imagePosition: 'top', ...commonSpacing },
      accordion: { theme: 'default', allowMultiple: false, ...commonSpacing },
      tabs: { orientation: 'horizontal', theme: 'default', ...commonSpacing },
    }
    return defaults[blockType] || { ...commonSpacing }
  }

  if (isEditor) {
    return (
      <div className="space-y-4" ref={containerRef}>
        {/* Settings Panel */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSettings(!showSettings)
                setShowBlockPicker(null)
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
            >
              ⚙️ Layout Settings
            </button>
            <span className="text-sm text-gray-600">
              {columns}-Column Layout
            </span>
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

        {showSettings && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {/* Width Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Column Widths (%)
              </label>
              <div className="flex gap-2">
                {columnWidths.map((width, index) => (
                  <div key={index} className="flex-1">
                    <label className="text-xs text-gray-500">Col {index + 1}</label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={width}
                      onChange={(e) => handleWidthChange(index, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-center text-gray-600">{width}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spacing Controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Padding */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Padding
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="number"
                    placeholder="Top"
                    value={padding.top}
                    onChange={(e) => handleSettingsChange({
                      padding: { ...padding, top: parseInt(e.target.value) || 0 }
                    })}
                    className="px-2 py-1 border rounded text-sm bg-white text-black"
                  />
                  <input
                    type="number"
                    placeholder="Right"
                    value={padding.right}
                    onChange={(e) => handleSettingsChange({
                      padding: { ...padding, right: parseInt(e.target.value) || 0 }
                    })}
                    className="px-2 py-1 border rounded text-sm bg-white text-black"
                  />
                  <input
                    type="number"
                    placeholder="Bottom"
                    value={padding.bottom}
                    onChange={(e) => handleSettingsChange({
                      padding: { ...padding, bottom: parseInt(e.target.value) || 0 }
                    })}
                    className="px-2 py-1 border rounded text-sm bg-white text-black"
                  />
                  <input
                    type="number"
                    placeholder="Left"
                    value={padding.left}
                    onChange={(e) => handleSettingsChange({
                      padding: { ...padding, left: parseInt(e.target.value) || 0 }
                    })}
                    className="px-2 py-1 border rounded text-sm bg-white text-black"
                  />
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margin
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="number"
                    placeholder="Top"
                    value={margin.top}
                    onChange={(e) => handleSettingsChange({
                      margin: { ...margin, top: parseInt(e.target.value) || 0 }
                    })}
                    className="px-2 py-1 border rounded text-sm bg-white text-black"
                  />
                  <input
                    type="number"
                    placeholder="Right"
                    value={margin.right}
                    onChange={(e) => handleSettingsChange({
                      margin: { ...margin, right: parseInt(e.target.value) || 0 }
                    })}
                    className="px-2 py-1 border rounded text-sm bg-white text-black"
                  />
                  <input
                    type="number"
                    placeholder="Bottom"
                    value={margin.bottom}
                    onChange={(e) => handleSettingsChange({
                      margin: { ...margin, bottom: parseInt(e.target.value) || 0 }
                    })}
                    className="px-2 py-1 border rounded text-sm bg-white text-black"
                  />
                  <input
                    type="number"
                    placeholder="Left"
                    value={margin.left}
                    onChange={(e) => handleSettingsChange({
                      margin: { ...margin, left: parseInt(e.target.value) || 0 }
                    })}
                    className="px-2 py-1 border rounded text-sm bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Gap and Height */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column Gap (px)
                </label>
                <input
                  type="number"
                  value={gap}
                  onChange={(e) => handleSettingsChange({ gap: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 border rounded text-sm bg-white text-black"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Height (px)
                </label>
                <input
                  type="number"
                  value={minHeight}
                  onChange={(e) => handleSettingsChange({ minHeight: parseInt(e.target.value) || 100 })}
                  className="w-full px-2 py-1 border rounded text-sm bg-white text-black"
                />
              </div>
            </div>
          </div>
        )}

        {/* Layout Preview (editor) - stack columns on small screens for mobile */}
        <div
          className="flex flex-col md:flex-row border-2 border-dashed border-gray-300 rounded-lg"
          style={{
            ...containerStyle,
            display: 'flex',
            gap: isMobile ? '0px' : `${gap}px`
          }}
        >
          {columnWidths.map((width, index) => (
            <div
              key={index}
              className={`bg-gray-50 border border-gray-200 rounded transition-all w-full md:w-auto`}
              style={{
                width: '100%',
                maxWidth: isMobile ? '100%' : `${width}%`,
                flexBasis: isMobile ? '100%' : `${width}%`,
                minHeight: '150px'
              }}
              onClick={() => {
                setShowBlockPicker(null)
                setShowSettings(false)
              }}
            >
              <div className="p-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-500">
                    Column {index + 1} ({width}%)
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowBlockPicker(showBlockPicker === index ? null : index)
                        setShowSettings(false)
                      }}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      + Add Block
                    </button>

                    {showBlockPicker === index && (
                      <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 min-w-48">
                        <div className="text-xs font-medium text-gray-700 mb-2">Add Block to Column {index + 1}</div>
                        <div className="grid grid-cols-2 gap-1">
                          {AVAILABLE_BLOCK_TYPES.filter(type => !type.type.startsWith('layout')).map((blockType) => (
                            <button
                              key={blockType.type}
                              onClick={(e) => {
                                e.stopPropagation()
                                addBlockToColumn(index, blockType.type)
                                setShowBlockPicker(null)
                              }}
                              className="flex items-center p-1 text-left border border-gray-200 rounded text-xs hover:bg-gray-50 hover:border-blue-300 transition-colors"
                            >
                              <span className="mr-1" aria-hidden="true">
                                {blockType.icon}
                              </span>
                              <div className="text-xs text-gray-900">
                                {blockType.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Render blocks in this column */}
                <div className="space-y-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleNestedDragEnd(event, index)}
                  >
                    <SortableContext
                      items={columnBlocks[index].map(block => block.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {columnBlocks[index].map((block: any) => (
                        <SortableNestedBlock
                          key={block.id}
                          block={block}
                          columnIndex={index}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {columnBlocks[index].length === 0 && (
                    <div className="text-center py-4 text-xs text-gray-400 border-dashed border border-gray-300 rounded">
                      Click "Add Block" to add content
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render mode (non-editor) - mobile: stack full-width columns
  return (
    <div
      className="flex flex-col md:flex-row w-full"
      style={{
        ...containerStyle,
        gap: isMobile ? '0px' : `${gap}px`
      }}
    >
      {columnWidths.map((width, index) => (
        <div
          key={index}
          style={{ 
            width: '100%',
            maxWidth: isMobile ? '100%' : `${width}%`,
            flexBasis: isMobile ? '100%' : `${width}%`
          }}
          className="layout-column w-full md:w-auto"
        >
          <BlockRenderer
            blocks={columnBlocks[index] || []}
            isEditor={false}
          />
        </div>
      ))}
    </div>
  )
}