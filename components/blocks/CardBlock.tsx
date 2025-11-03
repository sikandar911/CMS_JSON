import React from 'react'

interface CardBlockProps {
  content: {
    title?: string
    image?: string
    description?: string
    link?: {
      url: string
      text: string
      external?: boolean
    }
  }
  settings?: {
    theme?: 'default' | 'elevated' | 'bordered'
    imagePosition?: 'top' | 'left' | 'right'
    size?: 'small' | 'medium' | 'large'
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

export default function CardBlock({
  content,
  settings = {},
  isEditor = false,
  onUpdate
}: CardBlockProps) {
  const {
    title = '',
    image = '',
    description = '',
    link
  } = content

  const {
    theme = 'default',
    imagePosition = 'top',
    size = 'medium'
  } = settings

  const handleContentChange = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({ ...content, [field]: value }, settings)
    }
  }

  const handleLinkChange = (field: string, value: any) => {
    if (onUpdate) {
      const updatedLink = link ? { ...link, [field]: value } : { url: '', text: '', [field]: value }
      onUpdate({ ...content, link: updatedLink }, settings)
    }
  }

  const handleSettingsChange = (newSettings: any) => {
    if (onUpdate) {
      onUpdate(content, { ...settings, ...newSettings })
    }
  }

  const getCardClasses = () => {
    const base = 'rounded-xl overflow-hidden transition-all duration-200 border-2'
    const sizeClasses = {
      small: 'max-w-sm',
      medium: 'max-w-md',
      large: 'max-w-lg'
    }
    
    let themeClasses = ''
    switch (theme) {
      case 'elevated':
        themeClasses = 'bg-white border-[#045D5E] shadow-lg hover:shadow-xl'
        break
      case 'bordered':
        themeClasses = 'bg-white border-gray-200 hover:border-[#045D5E]'
        break
      default:
        themeClasses = 'bg-white border-gray-200 shadow-md hover:shadow-lg'
    }

    return `${base} ${sizeClasses[size as keyof typeof sizeClasses]} ${themeClasses}`
  }

  const getLayoutClasses = () => {
    if (imagePosition === 'left' || imagePosition === 'right') {
      return imagePosition === 'left' ? 'flex' : 'flex flex-row-reverse'
    }
    return ''
  }

  if (isEditor) {
    return (
      <div className="space-y-4">
        {/* Settings Panel */}
        <div className="p-4 bg-[#F1F4F3] rounded-xl border border-gray-200 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => handleSettingsChange({ theme: e.target.value })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
              >
                <option value="default">Default</option>
                <option value="elevated">Elevated</option>
                <option value="bordered">Bordered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Image Position</label>
              <select
                value={imagePosition}
                onChange={(e) => handleSettingsChange({ imagePosition: e.target.value })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
              >
                <option value="top">Top</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => handleSettingsChange({ size: e.target.value })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => handleContentChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder="Enter card title..."
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => handleContentChange('description', e.target.value)}
              placeholder="Enter card description..."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded bg-white text-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input
                type="url"
                value={link?.url || ''}
                onChange={(e) => handleLinkChange('url', e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 border border-gray-300 rounded bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
              <input
                type="text"
                value={link?.text || ''}
                onChange={(e) => handleLinkChange('text', e.target.value)}
                placeholder="Learn More"
                className="w-full p-2 border border-gray-300 rounded bg-white text-black"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={link?.external || false}
                onChange={(e) => handleLinkChange('external', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Open link in new tab</span>
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={getCardClasses()}>
      <div className={getLayoutClasses()}>
        {/* Image */}
        {image && (
          <div className={imagePosition === 'top' ? '' : 'flex-shrink-0'}>
            <img
              src={image}
              alt={title}
              className={
                imagePosition === 'top'
                  ? 'w-full h-48 object-cover'
                  : imagePosition === 'left'
                  ? 'w-32 h-32 object-cover'
                  : 'w-32 h-32 object-cover'
              }
            />
          </div>
        )}

        {/* Content */}
        <div className={`p-4 ${imagePosition !== 'top' ? 'flex-1' : ''}`}>
          {title && (
            <h3 className="text-xl font-bold text-[#045D5E] mb-3">
              {title}
            </h3>
          )}

          {description && (
            <p className="text-gray-600 mb-4">
              {description}
            </p>
          )}

          {link && link.url && link.text && (
            <a
              href={link.url}
              target={link.external ? '_blank' : '_self'}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center text-[#FC7300] hover:text-[#e66800] font-semibold transition-colors"
            >
              {link.text}
              {link.external && (
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}