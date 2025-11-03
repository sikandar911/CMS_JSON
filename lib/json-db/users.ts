/**
 * Users Database Layer
 * Handles all user-related CRUD operations
 */

import { jsonDb } from './connection'

export interface User {
  id: number
  email: string
  display_name: string
  password: string
  role: string
  created_at: string
  updated_at?: string
}

interface UsersData {
  users: User[]
}

export class UsersDB {
  private static filename = 'users.json'

  /**
   * Get all users
   */
  static findAll(): User[] {
    const data = jsonDb.read<UsersData>(this.filename)
    return data.users || []
  }

  /**
   * Find user by ID
   */
  static findById(id: number): User | null {
    const users = this.findAll()
    return users.find(u => u.id === id) || null
  }

  /**
   * Find user by email
   */
  static findByEmail(email: string): User | null {
    const users = this.findAll()
    return users.find(u => u.email === email) || null
  }

  /**
   * Create a new user
   */
  static create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const users = this.findAll()
    
    // Generate new ID
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
    
    const newUser: User = {
      ...userData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    users.push(newUser)
    jsonDb.write(this.filename, { users })

    return newUser
  }

  /**
   * Update a user
   */
  static update(id: number, userData: Partial<Omit<User, 'id' | 'created_at'>>): User | null {
    const users = this.findAll()
    const index = users.findIndex(u => u.id === id)

    if (index === -1) return null

    users[index] = {
      ...users[index],
      ...userData,
      updated_at: new Date().toISOString(),
    }

    jsonDb.write(this.filename, { users })
    return users[index]
  }

  /**
   * Delete a user
   */
  static delete(id: number): boolean {
    const users = this.findAll()
    const filteredUsers = users.filter(u => u.id !== id)

    if (filteredUsers.length === users.length) return false

    jsonDb.write(this.filename, { users: filteredUsers })
    return true
  }

  /**
   * Find users by role
   */
  static findByRole(role: string): User[] {
    const users = this.findAll()
    return users.filter(u => u.role === role)
  }
}
