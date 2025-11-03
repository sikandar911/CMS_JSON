'use client'

import React from 'react'

interface SpacingControlsProps {
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
  onPaddingChange: (padding: { top: number; right: number; bottom: number; left: number }) => void
  onMarginChange: (margin: { top: number; right: number; bottom: number; left: number }) => void
}

export default function SpacingControls({ 
  padding, 
  margin, 
  onPaddingChange, 
  onMarginChange 
}: SpacingControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Padding */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Padding (px)
        </label>
        <div className="grid grid-cols-2 gap-1">
          <input
            type="number"
            placeholder="Top"
            value={padding.top}
            onChange={(e) => onPaddingChange({
              ...padding,
              top: parseInt(e.target.value) || 0
            })}
            className="px-1 py-1 border rounded text-xs bg-white text-black"
            min="0"
          />
          <input
            type="number"
            placeholder="Right"
            value={padding.right}
            onChange={(e) => onPaddingChange({
              ...padding,
              right: parseInt(e.target.value) || 0
            })}
            className="px-1 py-1 border rounded text-xs bg-white text-black"
            min="0"
          />
          <input
            type="number"
            placeholder="Bottom"
            value={padding.bottom}
            onChange={(e) => onPaddingChange({
              ...padding,
              bottom: parseInt(e.target.value) || 0
            })}
            className="px-1 py-1 border rounded text-xs bg-white text-black"
            min="0"
          />
          <input
            type="number"
            placeholder="Left"
            value={padding.left}
            onChange={(e) => onPaddingChange({
              ...padding,
              left: parseInt(e.target.value) || 0
            })}
            className="px-1 py-1 border rounded text-xs bg-white text-black"
            min="0"
          />
        </div>
      </div>

      {/* Margin */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Margin (px)
        </label>
        <div className="grid grid-cols-2 gap-1">
          <input
            type="number"
            placeholder="Top"
            value={margin.top}
            onChange={(e) => onMarginChange({
              ...margin,
              top: parseInt(e.target.value) || 0
            })}
            className="px-1 py-1 border rounded text-xs bg-white text-black"
          />
          <input
            type="number"
            placeholder="Right"
            value={margin.right}
            onChange={(e) => onMarginChange({
              ...margin,
              right: parseInt(e.target.value) || 0
            })}
            className="px-1 py-1 border rounded text-xs bg-white text-black"
          />
          <input
            type="number"
            placeholder="Bottom"
            value={margin.bottom}
            onChange={(e) => onMarginChange({
              ...margin,
              bottom: parseInt(e.target.value) || 0
            })}
            className="px-1 py-1 border rounded text-xs bg-white text-black"
          />
          <input
            type="number"
            placeholder="Left"
            value={margin.left}
            onChange={(e) => onMarginChange({
              ...margin,
              left: parseInt(e.target.value) || 0
            })}
            className="px-1 py-1 border rounded text-xs bg-white text-black"
          />
        </div>
      </div>
    </div>
  )
}