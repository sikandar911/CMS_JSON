import { Post } from './api'

// SEO and JSON-LD Schema helpers
export interface SEOData {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
  category?: string
}

export class SEOHelper {
  // Generate comprehensive SEO meta tags
  static generateMetaTags(seoData: SEOData) {
    const tags = [
      { name: 'description', content: seoData.description },
      { name: 'robots', content: 'index, follow' },
      
      // Open Graph
      { property: 'og:title', content: seoData.title },
      { property: 'og:description', content: seoData.description },
      { property: 'og:type', content: seoData.ogType || 'article' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seoData.title },
      { name: 'twitter:description', content: seoData.description },
    ]

    if (seoData.canonical) {
      tags.push({ property: 'og:url', content: seoData.canonical })
    }

    if (seoData.ogImage) {
      tags.push(
        { property: 'og:image', content: seoData.ogImage },
        { name: 'twitter:image', content: seoData.ogImage }
      )
    } 
    

    if (seoData.publishedTime) {
      tags.push({ property: 'article:published_time', content: seoData.publishedTime })
    }

    if (seoData.modifiedTime) {
      tags.push({ property: 'article:modified_time', content: seoData.modifiedTime })
    }

    if (seoData.author) {
      tags.push({ property: 'article:author', content: seoData.author })
    }

    if (seoData.category) {
      tags.push({ property: 'article:section', content: seoData.category })
    }

    if (seoData.tags && seoData.tags.length > 0) {
      seoData.tags.forEach(tag => {
        tags.push({ property: 'article:tag', content: tag })
      })
    }

    return tags
  }

  // Generate JSON-LD structured data for blog post
  static generateBlogPostSchema(post: any, media?: any, blocks?: any[]): any {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'
    
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.published_at,
      dateModified: post.updated_at,
      author: {
        '@type': 'Person',
        name: (post as any)?.author?.display_name || (post as any)?.author?.name || 'Unknown'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Your Blog Name',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/${post.slug}`
      }
    }

    // Add image if available
    if (media) {
      ;(schema as any).image = {
        '@type': 'ImageObject',
        url: media.url,
        width: media.width,
        height: media.height,
        alt: media.alt_text
      }
    }

    // Add article body from blocks
    if (blocks && blocks.length > 0) {
      const textContent = blocks
        .filter(block => block.type === 'paragraph' || block.type === 'title')
        .map(block => {
          if (block.type === 'title') {
            return (block.content as any)?.text || ''
          }
          if (block.type === 'paragraph') {
            // Strip HTML tags for plain text
            const html = (block.content as any)?.html || (block.content as any)?.text || ''
            return String(html).replace(/<[^>]*>/g, '')
          }
          return ''
        })
        .join(' ')
        .substring(0, 500) // Limit length

      if (textContent) {
        ;(schema as any).articleBody = textContent
      }
    }

    // Add keywords from tags
    if (post.tags && post.tags.length > 0) {
      ;(schema as any).keywords = post.tags.join(', ')
    }

    // Add article section (category)
    if (post.category) {
      ;(schema as any).articleSection = post.category
    }

    return schema
  }

  // Generate breadcrumb schema
  static generateBreadcrumbSchema(items: Array<{name: string, url: string}>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }
  }

  // Generate website schema
  static generateWebsiteSchema(): any {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'
    
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Your Blog Name',
      url: baseUrl,
      description: 'A modern blog platform built with Next.js',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    }
  }

  // Clean and optimize text for SEO
  static optimizeText(text: string, maxLength: number = 160): string {
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '')
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    // Truncate if too long
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength).trim()
      // Try to break at word boundary
      const lastSpace = cleaned.lastIndexOf(' ')
      if (lastSpace > maxLength * 0.8) {
        cleaned = cleaned.substring(0, lastSpace)
      }
      cleaned += '...'
    }
    
    return cleaned
  }

  // Generate slug from title
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
      .trim()
  }

  // Extract reading time estimate from content
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  // Generate excerpt from content
  static generateExcerpt(content: string, maxLength: number = 300): string {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, ' ')
    
    // Clean up whitespace
    const cleaned = plainText.replace(/\s+/g, ' ').trim()
    
    if (cleaned.length <= maxLength) {
      return cleaned
    }
    
    // Find the last complete sentence within the limit
    const truncated = cleaned.substring(0, maxLength)
    const lastSentence = truncated.lastIndexOf('.')
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastSentence > maxLength * 0.7) {
      return cleaned.substring(0, lastSentence + 1)
    }
    
    if (lastSpace > maxLength * 0.8) {
      return cleaned.substring(0, lastSpace) + '...'
    }
    
    return truncated + '...'
  }
}

// Utility function to inject JSON-LD script
export function injectJsonLd(data: any): string {
  return JSON.stringify(data, null, 2)
}

// Utility functions for generating slugs and excerpts
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function generateExcerpt(content: string, maxLength = 160): string {
  // Remove HTML tags if present
  const cleanContent = content.replace(/<[^>]*>/g, '')
  
  if (cleanContent.length <= maxLength) {
    return cleanContent
  }
  
  const truncated = cleanContent.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}