/**
 * JSON Database Connection Handler
 * Manages file operations and provides atomic read/write operations
 */

import fs from 'fs'
import path from 'path'

export class JsonDb {
  private dataDir: string

  constructor(dataDir: string = this.getDataDir()) {
    this.dataDir = dataDir
    this.ensureDataDir()
  }

  /**
   * Determine the data directory based on environment
   * On Vercel (runtime), use /tmp; locally or during build, use /data
   */
  private getDataDir(): string {
    // Check if running on Vercel at RUNTIME (not during build)
    // VERCEL_URL is only set during request handling on Vercel, not during build
    const isVercelRuntime = process.env.VERCEL === '1' && process.env.VERCEL_URL
    
    if (isVercelRuntime) {
      const tmpDir = path.join('/tmp', 'cms-data')
      console.log('[JsonDb] Running on Vercel at runtime, using /tmp:', tmpDir)
      return tmpDir
    }

    const localDir = path.join(process.cwd(), 'data')
    console.log('[JsonDb] Running locally or during build, using:', localDir)
    return localDir
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true })
        console.log('[JsonDb] Created data directory:', this.dataDir)
      } catch (error) {
        console.error('[JsonDb] Failed to create data directory:', this.dataDir, error)
        throw error
      }
    }
  }

  /**
   * Read JSON file with error handling
   */
  read<T>(filename: string): T {
    const filePath = path.join(this.dataDir, filename)
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log('[JsonDb.read] File does not exist:', filePath, '- returning empty structure')
        // Return empty structure based on filename
        return this.getEmptyStructure(filename) as T
      }

      const data = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(data)
      console.log('[JsonDb.read] Successfully read', filename, '- entries:', 
        (parsed.posts?.length || parsed.users?.length || parsed.post_blocks?.length || 0))
      return parsed
    } catch (error) {
      console.error(`[JsonDb.read] Error reading ${filename}:`, error)
      return this.getEmptyStructure(filename) as T
    }
  }

  /**
   * Write JSON file atomically
   */
  write<T>(filename: string, data: T): void {
    const filePath = path.join(this.dataDir, filename)
    const tempPath = `${filePath}.tmp`

    console.log('[JsonDb.write] Attempting to write:', filename, 'to', this.dataDir)

    try {
      // Ensure directory exists before writing
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log('[JsonDb.write] Created missing directory:', dir)
      }

      // Write to temp file first
      const jsonString = JSON.stringify(data, null, 2)
      fs.writeFileSync(tempPath, jsonString, 'utf-8')
      console.log('[JsonDb.write] Temp file written:', tempPath)
      
      // Rename temp file to actual file (atomic operation)
      fs.renameSync(tempPath, filePath)
      console.log('[JsonDb.write] File successfully written:', filePath)
    } catch (error) {
      console.error(`[JsonDb.write] Error writing ${filename}:`, error)
      // Clean up temp file if it exists
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath)
          console.log('[JsonDb.write] Cleaned up temp file:', tempPath)
        }
      } catch (cleanupError) {
        console.error('[JsonDb.write] Failed to clean up temp file:', cleanupError)
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
