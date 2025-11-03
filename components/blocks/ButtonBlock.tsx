import React from 'react'

interface ButtonBlockProps {
  content: {
    text: string
    url?: string
    external?: boolean
  }
  settings?: {
    style?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    alignment?: 'left' | 'center' | 'right'
    fullWidth?: boolean
    // optional text color (tailwind color token like 'black' or 'white' or 'blue-600')
    textColor?: string
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

export default function ButtonBlock({
  content,
  settings = {},
  isEditor = false,
  onUpdate
}: ButtonBlockProps) {
  const {
    text = 'Click here',
    url = '',
    external = false
  } = content

  const {
    style = 'primary',
    size = 'md',
    alignment = 'left',
    fullWidth = false
  } = settings
  const { textColor } = settings as any || {}

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

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-md hover:shadow-lg'
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }

    // separate background/interaction classes from text color so we can override text color
    const styleBgClasses: Record<string, string> = {
      primary: 'bg-[#045D5E] hover:bg-[#034549] focus:ring-[#045D5E]',
      secondary: 'bg-[#FC7300] hover:bg-[#e66800] focus:ring-[#FC7300]',
      outline: 'border-2 border-[#045D5E] hover:bg-[#045D5E] hover:text-white focus:ring-[#045D5E] bg-transparent',
      ghost: 'hover:bg-[#F1F4F3] focus:ring-[#045D5E] bg-transparent'
    }

    const styleDefaultText: Record<string, string> = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-[#045D5E]',
      ghost: 'text-[#045D5E]'
    }

    const alignmentClasses = {
      left: '',
      center: 'mx-auto',
      right: 'ml-auto'
    }

    const widthClasses = fullWidth ? 'w-full' : ''

    // allow explicit textColor to override style default
    let textColorClass = ''
    if (textColor) {
      // map common names to Tailwind classes, otherwise assume user passed a tailwind token like 'blue-600'
      if (textColor === 'black' || textColor === 'white') {
        textColorClass = `text-${textColor}`
      } else if (textColor.startsWith('text-')) {
        textColorClass = textColor
      } else {
        textColorClass = `text-${textColor}`
      }
    } else {
      textColorClass = styleDefaultText[style] || ''
    }

    const bg = styleBgClasses[style] || ''

    return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses]} ${bg} ${textColorClass} ${alignmentClasses[alignment as keyof typeof alignmentClasses]} ${widthClasses}`.trim()
  }

  const getContainerClasses = () => {
    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }

    return alignmentClasses[alignment as keyof typeof alignmentClasses] || 'text-left'
  }

  if (isEditor) {
    return (
      <div className="space-y-4">
        {/* Settings Panel */}
        <div className="p-4 bg-[#F1F4F3] rounded-xl border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Style</label>
              <select
                value={style}
                onChange={(e) => handleSettingsChange({ style: e.target.value })}
                className="w-full px-3 py-2 border-2 border-[#045D5E] rounded-lg text-sm bg-white text-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
                aria-label="Button style"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => handleSettingsChange({ size: e.target.value })}
                className="w-full px-3 py-2 border-2 border-[#045D5E] rounded-lg text-sm bg-white text-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
                aria-label="Button size"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Alignment</label>
              <select
                value={alignment}
                onChange={(e) => handleSettingsChange({ alignment: e.target.value })}
                className="w-full px-3 py-2 border-2 border-[#045D5E] rounded-lg text-sm bg-white text-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
                aria-label="Button alignment"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={fullWidth}
                  onChange={(e) => handleSettingsChange({ fullWidth: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-xs text-gray-600">Full Width</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => handleContentChange('text', e.target.value)}
              placeholder="Enter button text..."
              className="w-full p-3 border-2 border-[#045D5E] rounded-lg bg-white text-[#045D5E] focus:ring-2 focus:ring-[#FC7300] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleContentChange('url', e.target.value)}
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
            <button
              type="button"
              className={getButtonClasses()}
              disabled
            >
              {text || 'Button Text'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const ButtonComponent = url ? 'a' : 'button'

  return (
    <div className={getContainerClasses()}>
      <ButtonComponent
        {...(url ? {
          href: url,
          target: external ? '_blank' : '_self',
          rel: external ? 'noopener noreferrer' : undefined
        } : {
          type: 'button' as const
        })}
        className={getButtonClasses()}
      >
        {text}
        {external && url && (
          <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </ButtonComponent>
    </div>
  )
}