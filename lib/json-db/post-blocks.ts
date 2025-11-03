/**
 * Post Blocks Database Layer
 * Handles all post block-related CRUD operations
 */

import { jsonDb } from './connection'

export interface PostBlock {
  id: string
  post_id: number
  index: number
  type: string
  content: any
  settings: any
  order?: number | null
  created_by: number
  updated_by: number
  created_at: string
  updated_at: string
}

interface PostBlocksData {
  post_blocks: PostBlock[]
}

export class PostBlocksDB {
  private static filename = 'post_blocks.json'

  /**
   * Get all blocks
   */
  static findAll(): PostBlock[] {
    const data = jsonDb.read<PostBlocksData>(this.filename)
    return data.post_blocks || []
  }

  /**
   * Find block by ID
   */
  static findById(id: string): PostBlock | null {
    const blocks = this.findAll()
    return blocks.find(b => b.id === id) || null
  }

  /**
   * Find all blocks for a post
   */
  static findByPostId(postId: number): PostBlock[] {
    const blocks = this.findAll()
    return blocks
      .filter(b => b.post_id === postId)
      .sort((a, b) => (a.order || a.index) - (b.order || b.index))
  }

  /**
   * Find blocks by type
   */
  static findByType(type: string): PostBlock[] {
    const blocks = this.findAll()
    return blocks.filter(b => b.type === type)
  }

  /**
   * Create a new block
   */
  static create(blockData: Omit<PostBlock, 'id' | 'created_at' | 'updated_at'>): PostBlock {
    const blocks = this.findAll()
    
    // Generate UUID-like ID
    const newId = blockData.id || `b${blockData.post_id}-${blockData.type}-${Date.now()}`
    
    const newBlock: PostBlock = {
      ...blockData,
      id: newId,
      index: blockData.index !== undefined ? blockData.index : 0,
      order: blockData.order !== undefined ? blockData.order : blockData.index,
      settings: blockData.settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    blocks.push(newBlock)
    jsonDb.write(this.filename, { post_blocks: blocks })

    return newBlock
  }

  /**
   * Update a block
   */
  static update(id: string, blockData: Partial<Omit<PostBlock, 'id' | 'created_at'>>): PostBlock | null {
    const blocks = this.findAll()
    const index = blocks.findIndex(b => b.id === id)

    if (index === -1) return null

    blocks[index] = {
      ...blocks[index],
      ...blockData,
      updated_at: new Date().toISOString(),
    }

    jsonDb.write(this.filename, { post_blocks: blocks })
    return blocks[index]
  }

  /**
   * Delete a block
   */
  static delete(id: string): boolean {
    const blocks = this.findAll()
    const filteredBlocks = blocks.filter(b => b.id !== id)

    if (filteredBlocks.length === blocks.length) return false

    jsonDb.write(this.filename, { post_blocks: filteredBlocks })
    return true
  }

  /**
   * Delete all blocks for a post
   */
  static deleteByPostId(postId: number): boolean {
    const blocks = this.findAll()
    const filteredBlocks = blocks.filter(b => b.post_id !== postId)

    jsonDb.write(this.filename, { post_blocks: filteredBlocks })
    return true
  }

  /**
   * Update block order for a post
   */
  static updateOrder(postId: number, blockIds: string[]): boolean {
    const blocks = this.findAll()
    
    blockIds.forEach((blockId, index) => {
      const blockIndex = blocks.findIndex(b => b.id === blockId && b.post_id === postId)
      if (blockIndex !== -1) {
        blocks[blockIndex].order = index
        blocks[blockIndex].index = index
        blocks[blockIndex].updated_at = new Date().toISOString()
      }
    })

    jsonDb.write(this.filename, { post_blocks: blocks })
    return true
  }

  /**
   * Bulk create blocks
   */
  static bulkCreate(blocksData: Omit<PostBlock, 'id' | 'created_at' | 'updated_at'>[]): PostBlock[] {
    const newBlocks = blocksData.map(blockData => {
      const newId = `b${blockData.post_id}-${blockData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      return {
        ...blockData,
        id: newId,
        index: blockData.index !== undefined ? blockData.index : 0,
        order: blockData.order !== undefined ? blockData.order : blockData.index,
        settings: blockData.settings || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    const blocks = this.findAll()
    blocks.push(...newBlocks)
    jsonDb.write(this.filename, { post_blocks: blocks })

    return newBlocks
  }
}
