'use client'

import React, { useState } from 'react'

interface ImageBlockProps {
  content: {
    imageUrl: string
    alt: string
    caption?: string
    link?: string
    external?: boolean
  }
  settings?: {
    alignment?: 'left' | 'center' | 'right'
    size?: 'small' | 'medium' | 'large' | 'full'
    rounded?: boolean
    shadow?: boolean
    aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1' | '3/2'
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

export default function ImageBlock({
  content,
  settings = {},
  isEditor = false,
  onUpdate
}: ImageBlockProps) {
  const [imageError, setImageError] = useState(false)

  const {
    imageUrl = '',
    alt = '',
    caption = '',
    link = '',
    external = false
  } = content

  const {
    alignment = 'center',
    size = 'medium',
    rounded = false,
    shadow = false,
    aspectRatio = 'auto'
  } = settings

  const handleContentChange = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({ ...content, [field]: value }, settings)
    }
  }

  const handleSettingsChange = (newSettings: any) => {
    if (onUpdate) {
      onUpdate(content, { ...settings, ...newSettings })
    }
  }

  const getImageClasses = () => {
    const baseClasses = 'transition-all duration-200'
    
    const sizeClasses = {
      small: 'max-w-xs',
      medium: 'max-w-md',
      large: 'max-w-lg',
      full: 'w-full'
    }

    const aspectClasses = {
      'auto': '',
      '16/9': 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '1/1': 'aspect-square',
      '3/2': 'aspect-[3/2]'
    }

    const roundedClasses = rounded ? 'rounded-lg' : ''
    const shadowClasses = shadow ? 'shadow-lg' : ''

    return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses]} ${aspectClasses[aspectRatio as keyof typeof aspectClasses]} ${roundedClasses} ${shadowClasses} object-cover`.trim()
  }

  const getContainerClasses = () => {
    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }

    return alignmentClasses[alignment as keyof typeof alignmentClasses] || 'text-center'
  }

  if (isEditor) {
    return (
      <div className="space-y-4">
        {/* Settings Panel */}
        <div className="p-4 bg-[#F1F4F3] rounded-xl border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Alignment</label>
              <select
                value={alignment}
                onChange={(e) => handleSettingsChange({ alignment: e.target.value })}
                className="w-full px-3 py-2 border-2 border-[#045D5E] rounded-lg text-sm bg-white text-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
                aria-label="Image alignment"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => handleSettingsChange({ size: e.target.value })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
                aria-label="Image size"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="full">Full Width</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => handleSettingsChange({ aspectRatio: e.target.value })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
                aria-label="Image aspect ratio"
              >
                <option value="auto">Auto</option>
                <option value="16/9">16:9</option>
                <option value="4/3">4:3</option>
                <option value="1/1">1:1 (Square)</option>
                <option value="3/2">3:2</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rounded}
                  onChange={(e) => handleSettingsChange({ rounded: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-xs text-gray-600">Rounded Corners</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={shadow}
                  onChange={(e) => handleSettingsChange({ shadow: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-xs text-gray-600">Drop Shadow</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => handleContentChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 border-2 border-[#045D5E] rounded-lg bg-white text-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => handleContentChange('alt', e.target.value)}
              placeholder="Describe the image for accessibility..."
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption (Optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => handleContentChange('caption', e.target.value)}
              placeholder="Image caption..."
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => handleContentChange('link', e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={external}
                onChange={(e) => handleContentChange('external', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Open link in new tab</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 border border-gray-200 rounded bg-white">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <div className={getContainerClasses()}>
            {imageUrl ? (
              <div className="inline-block">
                <img
                  src={imageUrl}
                  alt={alt || 'Preview image'}
                  className={getImageClasses()}
                  onError={() => setImageError(true)}
                />
                {caption && (
                  <p className="text-sm text-gray-600 mt-2 italic">{caption}</p>
                )}
              </div>
            ) : (
              <div className={`${getImageClasses()} bg-gray-100 flex items-center justify-center min-h-32 text-gray-400`}>
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                  </svg>
                  <p className="text-xs">No image selected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!imageUrl || imageError) {
    return (
      <div className={`${getContainerClasses()} text-gray-400`}>
        <div className="inline-block border border-gray-200 rounded p-4 bg-gray-50">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
          </svg>
          <p className="text-xs">Image not available</p>
        </div>
      </div>
    )
  }

  const ImageComponent = link ? 'a' : 'div'

  return (
    <div className={getContainerClasses()}>
      <ImageComponent
        {...(link ? {
          href: link,
          target: external ? '_blank' : '_self',
          rel: external ? 'noopener noreferrer' : undefined,
          className: 'inline-block'
        } : {
          className: 'inline-block'
        })}
      >
        <img
          src={imageUrl}
          alt={alt}
          className={getImageClasses()}
          onError={() => setImageError(true)}
        />
        {caption && (
          <p className="text-sm text-gray-600 mt-2 italic max-w-prose">
            {caption}
          </p>
        )}
      </ImageComponent>
    </div>
  )
}