/**
 * Roadmap Submissions Database Layer
 * Handles all roadmap submission-related CRUD operations
 */

import { jsonDb } from './connection'

export interface RoadmapSubmission {
  id: number
  target_degree?: string | null
  academic_level?: string | null
  field_of_study?: string | null
  email?: string | null
  created_at: string
}

interface RoadmapSubmissionsData {
  roadmap_submissions: RoadmapSubmission[]
}

export class RoadmapSubmissionsDB {
  private static filename = 'roadmap_submissions.json'

  /**
   * Get all submissions
   */
  static findAll(): RoadmapSubmission[] {
    const data = jsonDb.read<RoadmapSubmissionsData>(this.filename)
    return data.roadmap_submissions || []
  }

  /**
   * Find submission by ID
   */
  static findById(id: number): RoadmapSubmission | null {
    const submissions = this.findAll()
    return submissions.find(s => s.id === id) || null
  }

  /**
   * Find submissions by email
   */
  static findByEmail(email: string): RoadmapSubmission[] {
    const submissions = this.findAll()
    return submissions.filter(s => s.email === email)
  }

  /**
   * Create a new submission
   */
  static create(submissionData: Omit<RoadmapSubmission, 'id' | 'created_at'>): RoadmapSubmission {
    const submissions = this.findAll()
    
    // Generate new ID
    const newId = submissions.length > 0 ? Math.max(...submissions.map(s => s.id)) + 1 : 1
    
    const newSubmission: RoadmapSubmission = {
      ...submissionData,
      id: newId,
      created_at: new Date().toISOString(),
    }

    submissions.push(newSubmission)
    jsonDb.write(this.filename, { roadmap_submissions: submissions })

    return newSubmission
  }

  /**
   * Delete a submission
   */
  static delete(id: number): boolean {
    const submissions = this.findAll()
    const filteredSubmissions = submissions.filter(s => s.id !== id)

    if (filteredSubmissions.length === submissions.length) return false

    jsonDb.write(this.filename, { roadmap_submissions: filteredSubmissions })
    return true
  }
}
