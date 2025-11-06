import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { UsersDB } from './json-db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-secret-key'
)

export interface AuthUser {
  id: number
  email: string
  display_name: string
  role: 'admin' | 'editor'
}

export interface LoginResult {
  success: boolean
  token?: string
  user?: AuthUser
  error?: string
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // Login user
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Get user from JSON database
      const user = UsersDB.findByEmail(email)
      
      if (!user) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Verify password
      const isValid = await this.verifyPassword(password, user.password)
      
      if (!isValid) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Generate token
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role as 'admin' | 'editor'
      }

      const token = await this.generateToken(authUser)

      return {
        success: true,
        token,
        user: authUser
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  // Verify token and return user
  static async verifyToken(token: string): Promise<any> {
    try {
      console.log('[AuthService.verifyToken] Attempting to verify token...')
      const { payload } = await jwtVerify(token, JWT_SECRET)
      console.log('[AuthService.verifyToken] Token verified successfully:', JSON.stringify(payload))
      return payload
    } catch (error) {
      console.error('[AuthService.verifyToken] Token verification failed:', error)
      return null
    }
  }

  // Generate JWT token
  static async generateToken(user: AuthUser): Promise<string> {
    return new SignJWT({ 
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
  }

  // Generate preview token for drafts
  static async generatePreviewToken(postId: number, userId: number): Promise<string> {
    return new SignJWT({ 
      postId,
      userId,
      type: 'preview'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }

  // Extract token from a request headers object (supports Headers API or plain record)
  static extractTokenFromRequestHeaders(headers: any): string | null {
    try {
      // Try Authorization header first
      let authHeader: string | null = null
      if (headers && typeof headers.get === 'function') {
        authHeader = headers.get('authorization') || headers.get('Authorization') || null
      } else if (headers) {
        authHeader = headers['authorization'] || headers['Authorization'] || null
      }

      const tokenFromHeader = this.extractTokenFromHeader(authHeader)
      if (tokenFromHeader) {
        console.log('[extractTokenFromRequestHeaders] Token found in Authorization header')
        return tokenFromHeader
      }

      // Fallback: parse cookie header for blog_auth_token
      let cookieHeader: string | null = null
      if (headers && typeof headers.get === 'function') {
        cookieHeader = headers.get('cookie') || headers.get('Cookie') || null
      } else if (headers) {
        cookieHeader = headers['cookie'] || headers['Cookie'] || null
      }

      console.log('[extractTokenFromRequestHeaders] Cookie header present:', !!cookieHeader)
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(s => s.trim())
        console.log('[extractTokenFromRequestHeaders] Cookies found:', cookies.length)
        const match = cookies.find(s => s.startsWith('blog_auth_token='))
        if (match) {
          const token = match.split('=')[1]
          console.log('[extractTokenFromRequestHeaders] Token found in cookie')
          return token || null
        }
      }

      console.log('[extractTokenFromRequestHeaders] No token found in headers or cookies')
      return null
    } catch (err) {
      console.error('[extractTokenFromRequestHeaders] Error:', err)
      return null
    }
  }

  // Check if user has required role
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = ['editor', 'admin']
    const userLevel = roleHierarchy.indexOf(userRole)
    const requiredLevel = roleHierarchy.indexOf(requiredRole)
    
    return userLevel >= requiredLevel
  }
}

// Middleware for protecting API routes
export function withAuth(handler: any, requiredRole: string = 'editor') {
  return async (req: any, res: any) => {
    try {
      const authHeader = req.headers.authorization
      const token = AuthService.extractTokenFromHeader(authHeader)
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' })
      }

      const payload = await AuthService.verifyToken(token)
      
      if (!AuthService.hasPermission(payload.role, requiredRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      // Add user info to request
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }

      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}

// Session management (for client-side)
export class SessionManager {
  private static TOKEN_KEY = 'blog_auth_token'

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  // Decode token without verification (client-side only, for UI purposes)
  static getTokenPayload(): any {
    const token = this.getToken()
    if (!token) return null

    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      return null
    }
  }
}