/**
 * JSON Database Connection Handler
 * Manages file operations and provides atomic read/write operations
 */

import fs from 'fs'
import path from 'path'

export class JsonDb {

  // Local (repo) data directory - read from committed files
  private localDataDir: string
  // Temp directory for writable operations on serverless (e.g., Vercel)
  private tmpDataDir: string

  constructor() {
    this.localDataDir = path.join(process.cwd(), 'data')
    this.tmpDataDir = path.join('/tmp', 'cms-data')

    // Ensure local data dir exists for local dev/build (no-op if present)
    if (!fs.existsSync(this.localDataDir)) {
      try {
        fs.mkdirSync(this.localDataDir, { recursive: true })
        console.log('[JsonDb] Created local data directory:', this.localDataDir)
      } catch (err) {
        console.error('[JsonDb] Failed to create local data dir:', err)
      }
    }

    // Ensure tmp dir exists if running in an environment that supports it
    try {
      if (!fs.existsSync(this.tmpDataDir)) {
        fs.mkdirSync(this.tmpDataDir, { recursive: true })
        console.log('[JsonDb] Created tmp data directory:', this.tmpDataDir)
      }
    } catch (err) {
      // tmp may not be writable on some environments; we'll create lazily on write
      // Log and continue
      console.log('[JsonDb] tmp data directory not created at startup (will attempt on write):', this.tmpDataDir, err)
    }
  }

  

  /**
   * Read JSON file with error handling
   * Priority on Vercel runtime: read /tmp first (has latest writes), then fallback to committed data
   * Priority in other environments: read committed data first
   */
  read<T>(filename: string): T {
    const localPath = path.join(this.localDataDir, filename)
    const tmpPath = path.join(this.tmpDataDir, filename)
    const isVercelRuntime = process.env.VERCEL === '1' && !!process.env.VERCEL_URL

    try {
      // On Vercel runtime, prioritize /tmp (where writes go) over committed data
      if (isVercelRuntime) {
        // Check /tmp first (latest writes)
        if (fs.existsSync(tmpPath)) {
          const data = fs.readFileSync(tmpPath, 'utf-8')
          const parsed = JSON.parse(data)
          console.log('[JsonDb.read] Read from tmp data dir (Vercel):', tmpPath)
          return parsed
        }

        // Fallback to committed data (initial state on cold-start)
        if (fs.existsSync(localPath)) {
          const data = fs.readFileSync(localPath, 'utf-8')
          const parsed = JSON.parse(data)
          console.log('[JsonDb.read] Read from local data dir (Vercel fallback):', localPath)
          
          // Copy to /tmp so subsequent writes can modify it
          try {
            const dir = path.dirname(tmpPath)
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true })
            }
            fs.writeFileSync(tmpPath, data, 'utf-8')
            console.log('[JsonDb.read] Copied to tmp for future writes:', tmpPath)
          } catch (copyError) {
            console.warn('[JsonDb.read] Failed to copy to tmp (non-critical):', copyError)
          }
          
          return parsed
        }
      } else {
        // Local/build environment: prefer committed data
        if (fs.existsSync(localPath)) {
          const data = fs.readFileSync(localPath, 'utf-8')
          const parsed = JSON.parse(data)
          console.log('[JsonDb.read] Read from local data dir:', localPath)
          return parsed
        }

        // Fallback to /tmp (unlikely in local dev)
        if (fs.existsSync(tmpPath)) {
          const data = fs.readFileSync(tmpPath, 'utf-8')
          const parsed = JSON.parse(data)
          console.log('[JsonDb.read] Read from tmp data dir (local fallback):', tmpPath)
          return parsed
        }
      }

      // No file found
      console.log('[JsonDb.read] File not found in local or tmp:', filename, '- returning empty structure')
      return this.getEmptyStructure(filename) as T
    } catch (error) {
      console.error(`[JsonDb.read] Error reading ${filename}:`, error)
      return this.getEmptyStructure(filename) as T
    }
  }

  /**
   * Write JSON file atomically
   */
  /**
   * Write JSON file atomically
   * On serverless (Vercel runtime) write to /tmp; locally write to committed `data/` dir
   */
  write<T>(filename: string, data: T): void {
    // Decide where to write: prefer tmp for runtime writes, otherwise local data dir
    const isVercelRuntime = process.env.VERCEL === '1' && !!process.env.VERCEL_URL
    const writeDir = isVercelRuntime ? this.tmpDataDir : this.localDataDir
    const filePath = path.join(writeDir, filename)
    const tempPath = `${filePath}.tmp`

    console.log('[JsonDb.write] Attempting to write:', filename, 'to', writeDir, 'isVercelRuntime=', isVercelRuntime)

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
