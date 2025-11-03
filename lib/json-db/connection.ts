/**
 * JSON Database Connection Handler
 * Manages file operations and provides atomic read/write operations
 */

import fs from 'fs'
import path from 'path'

export class JsonDb {
  private dataDir: string

  constructor(dataDir: string = path.join(process.cwd(), 'data')) {
    this.dataDir = dataDir
    this.ensureDataDir()
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
  }

  /**
   * Read JSON file with error handling
   */
  read<T>(filename: string): T {
    const filePath = path.join(this.dataDir, filename)
    
    try {
      if (!fs.existsSync(filePath)) {
        // Return empty structure based on filename
        return this.getEmptyStructure(filename) as T
      }

      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error(`Error reading ${filename}:`, error)
      return this.getEmptyStructure(filename) as T
    }
  }

  /**
   * Write JSON file atomically
   */
  write<T>(filename: string, data: T): void {
    const filePath = path.join(this.dataDir, filename)
    const tempPath = `${filePath}.tmp`

    try {
      // Write to temp file first
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8')
      
      // Rename temp file to actual file (atomic operation)
      fs.renameSync(tempPath, filePath)
    } catch (error) {
      console.error(`Error writing ${filename}:`, error)
      // Clean up temp file if it exists
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
      throw error
    }
  }

  /**
   * Get empty structure for a given filename
   */
  private getEmptyStructure(filename: string): any {
    const structures: Record<string, any> = {
      'users.json': { users: [] },
      'posts.json': { posts: [] },
      'post_blocks.json': { post_blocks: [] },
      'post_revisions.json': { post_revisions: [] },
      'roadmap_submissions.json': { roadmap_submissions: [] },
      'media.json': { media: [] },
    }

    return structures[filename] || {}
  }

  /**
   * Transaction-like operation for complex updates
   */
  transaction<T>(filename: string, callback: (data: T) => T): void {
    const data = this.read<T>(filename)
    const updatedData = callback(data)
    this.write(filename, updatedData)
  }
}

// Export singleton instance
export const jsonDb = new JsonDb()
