/**
 * Post Revisions Database Layer
 * Handles all post revision-related CRUD operations
 */

import { jsonDb } from './connection'

export interface PostRevision {
  id: number
  post_id: number
  revision_number: number
  author_id: number
  data_snapshot?: any
  edited_at?: string
  created_at: string
}

interface PostRevisionsData {
  post_revisions: PostRevision[]
}

export class PostRevisionsDB {
  private static filename = 'post_revisions.json'

  /**
   * Get all revisions
   */
  static findAll(): PostRevision[] {
    const data = jsonDb.read<PostRevisionsData>(this.filename)
    return data.post_revisions || []
  }

  /**
   * Find revision by ID
   */
  static findById(id: number): PostRevision | null {
    const revisions = this.findAll()
    return revisions.find(r => r.id === id) || null
  }

  /**
   * Find all revisions for a post
   */
  static findByPostId(postId: number): PostRevision[] {
    const revisions = this.findAll()
    return revisions
      .filter(r => r.post_id === postId)
      .sort((a, b) => b.revision_number - a.revision_number)
  }

  /**
   * Find specific revision by post and revision number
   */
  static findByPostAndRevision(postId: number, revisionNumber: number): PostRevision | null {
    const revisions = this.findAll()
    return revisions.find(r => r.post_id === postId && r.revision_number === revisionNumber) || null
  }

  /**
   * Get latest revision for a post
   */
  static findLatestByPostId(postId: number): PostRevision | null {
    const revisions = this.findByPostId(postId)
    return revisions.length > 0 ? revisions[0] : null
  }

  /**
   * Create a new revision
   */
  static create(revisionData: Omit<PostRevision, 'id' | 'created_at'>): PostRevision {
    const revisions = this.findAll()
    
    // Generate new ID
    const newId = revisions.length > 0 ? Math.max(...revisions.map(r => r.id)) + 1 : 1
    
    const newRevision: PostRevision = {
      ...revisionData,
      id: newId,
      edited_at: revisionData.edited_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    revisions.push(newRevision)
    jsonDb.write(this.filename, { post_revisions: revisions })

    return newRevision
  }

  /**
   * Delete a revision
   */
  static delete(id: number): boolean {
    const revisions = this.findAll()
    const filteredRevisions = revisions.filter(r => r.id !== id)

    if (filteredRevisions.length === revisions.length) return false

    jsonDb.write(this.filename, { post_revisions: filteredRevisions })
    return true
  }

  /**
   * Delete all revisions for a post
   */
  static deleteByPostId(postId: number): boolean {
    const revisions = this.findAll()
    const filteredRevisions = revisions.filter(r => r.post_id !== postId)

    jsonDb.write(this.filename, { post_revisions: filteredRevisions })
    return true
  }

  /**
   * Get next revision number for a post
   */
  static getNextRevisionNumber(postId: number): number {
    const revisions = this.findByPostId(postId)
    if (revisions.length === 0) return 1
    
    const maxRevision = Math.max(...revisions.map(r => r.revision_number))
    return maxRevision + 1
  }

  /**
   * Count revisions for a post
   */
  static countByPostId(postId: number): number {
    const revisions = this.findByPostId(postId)
    return revisions.length
  }
}
