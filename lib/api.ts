/**
 * API Layer - JSON Database Version
 * Provides high-level API methods for interacting with JSON data files
 */

import { UsersDB, PostsDB, PostBlocksDB, PostRevisionsDB, RoadmapSubmissionsDB } from './json-db'
import type { User } from './json-db/users'
import type { Post } from './json-db/posts'
import type { PostBlock } from './json-db/post-blocks'
import type { PostRevision } from './json-db/post-revisions'
import type { RoadmapSubmission } from './json-db/roadmap-submissions'

// Extended types for API responses (including relations)
export interface PostWithAuthor extends Post {
  author: {
    id: number
    display_name: string
  }
}

export interface PostWithAuthorAndBlocks extends PostWithAuthor {
  blocks: PostBlock[]
}

// Re-export types
export type { User, Post, PostBlock, PostRevision, RoadmapSubmission }

// Posts API
export const postsApi = {
  getAll: async (): Promise<PostWithAuthor[]> => {
    const posts = PostsDB.findAll()
    const users = UsersDB.findAll()
    
    return posts
      .filter(p => p.active === 1)
      .map(post => {
        const author = users.find(u => u.id === post.author_id)
        return {
          ...post,
          author: author 
            ? { id: author.id, display_name: author.display_name }
            : post.author || { id: post.author_id || 0, display_name: 'Unknown' }
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getBySlug: async (slug: string): Promise<PostWithAuthor | null> => {
    const post = PostsDB.findBySlug(slug)
    if (!post || post.active !== 1) return null

    const users = UsersDB.findAll()
    const author = users.find(u => u.id === post.author_id)

    return {
      ...post,
      author: author 
        ? { id: author.id, display_name: author.display_name }
        : post.author || { id: post.author_id || 0, display_name: 'Unknown' }
    }
  },

  getById: async (id: number): Promise<PostWithAuthor | null> => {
    const post = PostsDB.findById(id)
    if (!post) return null

    const users = UsersDB.findAll()
    const author = users.find(u => u.id === post.author_id)

    return {
      ...post,
      author: author 
        ? { id: author.id, display_name: author.display_name }
        : post.author || { id: post.author_id || 0, display_name: 'Unknown' }
    }
  },

  getPublished: async (): Promise<PostWithAuthor[]> => {
    const posts = PostsDB.findByStatus('published')
    const users = UsersDB.findAll()

    return posts
      .map(post => {
        const author = users.find(u => u.id === post.author_id)
        return {
          ...post,
          author: author 
            ? { id: author.id, display_name: author.display_name }
            : post.author || { id: post.author_id || 0, display_name: 'Unknown' }
        }
      })
      .sort((a, b) => {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
        return dateB - dateA
      })
  },

  getDrafts: async (): Promise<PostWithAuthor[]> => {
    const posts = PostsDB.findByStatus('draft')
    const users = UsersDB.findAll()

    return posts.map(post => {
      const author = users.find(u => u.id === post.author_id)
      return {
        ...post,
        author: author 
          ? { id: author.id, display_name: author.display_name }
          : post.author || { id: post.author_id || 0, display_name: 'Unknown' }
      }
    })
  },

  create: async (data: any): Promise<PostWithAuthor> => {
    const newPost = PostsDB.create(data)
    const author = UsersDB.findById(newPost.author_id || 0)

    return {
      ...newPost,
      author: author 
        ? { id: author.id, display_name: author.display_name }
        : { id: newPost.author_id || 0, display_name: 'Unknown' }
    }
  },

  update: async (id: number, data: any): Promise<PostWithAuthor | null> => {
    const updated = PostsDB.update(id, data)
    if (!updated) return null

    const author = UsersDB.findById(updated.author_id || 0)

    return {
      ...updated,
      author: author 
        ? { id: author.id, display_name: author.display_name }
        : updated.author || { id: updated.author_id || 0, display_name: 'Unknown' }
    }
  },

  delete: async (id: number): Promise<boolean> => {
    return PostsDB.delete(id)
  },

  getWithBlocks: async (id: number): Promise<PostWithAuthorAndBlocks | null> => {
    const post = await postsApi.getById(id)
    if (!post) return null

    const blocks = PostBlocksDB.findByPostId(id)

    return {
      ...post,
      blocks
    }
  }
}

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return UsersDB.findAll()
  },

  getById: async (id: number): Promise<User | null> => {
    return UsersDB.findById(id)
  },

  getByEmail: async (email: string): Promise<User | null> => {
    return UsersDB.findByEmail(email)
  },

  create: async (data: any): Promise<User> => {
    return UsersDB.create(data)
  },

  update: async (id: number, data: any): Promise<User | null> => {
    return UsersDB.update(id, data)
  },

  delete: async (id: number): Promise<boolean> => {
    return UsersDB.delete(id)
  }
}

// Post Blocks API
export const postBlocksApi = {
  getAll: async (): Promise<PostBlock[]> => {
    return PostBlocksDB.findAll()
  },

  getById: async (id: string): Promise<PostBlock | null> => {
    return PostBlocksDB.findById(id)
  },

  getByPostId: async (postId: number): Promise<PostBlock[]> => {
    return PostBlocksDB.findByPostId(postId)
  },

  create: async (data: any): Promise<PostBlock> => {
    return PostBlocksDB.create(data)
  },

  update: async (id: string, data: any): Promise<PostBlock | null> => {
    return PostBlocksDB.update(id, data)
  },

  delete: async (id: string): Promise<boolean> => {
    return PostBlocksDB.delete(id)
  },

  deleteByPostId: async (postId: number): Promise<boolean> => {
    return PostBlocksDB.deleteByPostId(postId)
  },

  updateOrder: async (postId: number, blockIds: string[]): Promise<boolean> => {
    return PostBlocksDB.updateOrder(postId, blockIds)
  },

  bulkCreate: async (blocksData: any[]): Promise<PostBlock[]> => {
    return PostBlocksDB.bulkCreate(blocksData)
  }

  ,

  // Update many blocks (upsert behavior)
  updateMany: async (blocksData: any[]): Promise<PostBlock[]> => {
    const results: PostBlock[] = []

    for (const b of blocksData) {
      // If block has an id, attempt update
      if (b.id) {
        const updated = PostBlocksDB.update(b.id, b)
        if (updated) {
          results.push(updated)
          continue
        }
        // If update failed (not found), fall through to create
      }

      // Ensure we don't pass protected fields to create
      const toCreate: any = {
        post_id: b.post_id,
        index: b.index !== undefined ? b.index : 0,
        type: b.type,
        content: b.content,
        settings: b.settings || {},
        created_by: b.created_by || 0,
        updated_by: b.updated_by || 0,
        order: b.order !== undefined ? b.order : b.index
      }

      const created = PostBlocksDB.create(toCreate)
      results.push(created)
    }

    return results
  }
}

// Post Revisions API
export const postRevisionsApi = {
  getAll: async (): Promise<PostRevision[]> => {
    return PostRevisionsDB.findAll()
  },

  getById: async (id: number): Promise<PostRevision | null> => {
    return PostRevisionsDB.findById(id)
  },

  getByPostId: async (postId: number): Promise<PostRevision[]> => {
    return PostRevisionsDB.findByPostId(postId)
  },

  create: async (data: any): Promise<PostRevision> => {
    return PostRevisionsDB.create(data)
  },

  delete: async (id: number): Promise<boolean> => {
    return PostRevisionsDB.delete(id)
  },

  getNextRevisionNumber: (postId: number): number => {
    return PostRevisionsDB.getNextRevisionNumber(postId)
  }
}

// Roadmap Submissions API
export const roadmapSubmissionsApi = {
  getAll: async (): Promise<RoadmapSubmission[]> => {
    return RoadmapSubmissionsDB.findAll()
  },

  getById: async (id: number): Promise<RoadmapSubmission | null> => {
    return RoadmapSubmissionsDB.findById(id)
  },

  create: async (data: any): Promise<RoadmapSubmission> => {
    return RoadmapSubmissionsDB.create(data)
  },

  delete: async (id: number): Promise<boolean> => {
    return RoadmapSubmissionsDB.delete(id)
  }
}
