/**
 * Posts Database Layer
 * Handles all post-related CRUD operations
 */

import { jsonDb } from './connection'

export interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  meta_title?: string | null
  meta_description?: string | null
  status: string
  tags: string[]
  category?: string | null
  canonical_url?: string | null
  featured_image?: string | null
  featured_image_id?: number | null
  language: string
  author_id?: number
  author?: {
    id: number
    name: string
  }
  published_at?: string | null
  created_at: string
  updated_at: string
  active: number
}

interface PostsData {
  posts: Post[]
}

export class PostsDB {
  private static filename = 'posts.json'

  /**
   * Get all posts
   */
  static findAll(): Post[] {
    const data = jsonDb.read<PostsData>(this.filename)
    return data.posts || []
  }

  /**
   * Find post by ID
   */
  static findById(id: number): Post | null {
    const posts = this.findAll()
    return posts.find(p => p.id === id) || null
  }

  /**
   * Find post by slug
   */
  static findBySlug(slug: string): Post | null {
    const posts = this.findAll()
    return posts.find(p => p.slug === slug) || null
  }

  /**
   * Find posts by status
   */
  static findByStatus(status: string): Post[] {
    const posts = this.findAll()
    return posts.filter(p => p.status === status && p.active === 1)
  }

  /**
   * Find posts by category
   */
  static findByCategory(category: string): Post[] {
    const posts = this.findAll()
    return posts.filter(p => p.category === category && p.active === 1)
  }

  /**
   * Find posts by author
   */
  static findByAuthor(authorId: number): Post[] {
    const posts = this.findAll()
    return posts.filter(p => p.author_id === authorId && p.active === 1)
  }

  /**
   * Create a new post
   */
  static create(postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Post {
    const posts = this.findAll()
    
    // Generate new ID
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1
    
    const newPost: Post = {
      ...postData,
      id: newId,
      status: postData.status || 'draft',
      tags: postData.tags || [],
      language: postData.language || 'en',
      active: postData.active !== undefined ? postData.active : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    posts.push(newPost)
    jsonDb.write(this.filename, { posts })

    return newPost
  }

  /**
   * Update a post
   */
  static update(id: number, postData: Partial<Omit<Post, 'id' | 'created_at'>>): Post | null {
    const posts = this.findAll()
    const index = posts.findIndex(p => p.id === id)

    if (index === -1) return null

    posts[index] = {
      ...posts[index],
      ...postData,
      updated_at: new Date().toISOString(),
    }

    jsonDb.write(this.filename, { posts })
    return posts[index]
  }

  /**
   * Delete a post (soft delete by setting active = 0)
   */
  static delete(id: number): boolean {
    return this.update(id, { active: 0 }) !== null
  }

  /**
   * Hard delete a post
   */
  static hardDelete(id: number): boolean {
    const posts = this.findAll()
    const filteredPosts = posts.filter(p => p.id !== id)

    if (filteredPosts.length === posts.length) return false

    jsonDb.write(this.filename, { posts: filteredPosts })
    return true
  }

  /**
   * Get published posts
   */
  static findPublished(): Post[] {
    return this.findByStatus('published')
  }

  /**
   * Get draft posts
   */
  static findDrafts(): Post[] {
    return this.findByStatus('draft')
  }

  /**
   * Search posts by title or excerpt
   */
  static search(query: string): Post[] {
    const posts = this.findAll()
    const lowerQuery = query.toLowerCase()
    
    return posts.filter(p => 
      p.active === 1 && (
        p.title.toLowerCase().includes(lowerQuery) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(lowerQuery)) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      )
    )
  }

  /**
   * Get posts with pagination
   */
  static findPaginated(limit: number = 10, offset: number = 0): Post[] {
    const posts = this.findAll()
    return posts
      .filter(p => p.active === 1)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit)
  }
}
