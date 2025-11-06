import { NextRequest, NextResponse } from 'next/server'
import { postsApi } from '@/lib/api'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    let posts
    if (status === 'draft') {
      posts = await postsApi.getDrafts()
    } else if (status === 'published') {
      posts = await postsApi.getPublished()
    } else if (status === 'archived') {
      const allPosts = await postsApi.getAll()
      posts = allPosts.filter(p => p.status === 'archived' && p.active === 1)
    } else {
      posts = await postsApi.getAll()
    }

    // Apply pagination if specified
    if (limit !== undefined) {
      const start = offset || 0
      posts = posts.slice(start, start + limit)
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[POST /api/posts] === NEW REQUEST ===')
    
    // Verify authentication (accept token from Authorization header or cookie)
    const token = AuthService.extractTokenFromRequestHeaders(request.headers)
    console.log('[POST /api/posts] Token present:', token ? 'YES (length=' + token.length + ')' : 'NO')

    if (!token) {
      console.log('[POST /api/posts] No token provided - returning 401')
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const payload = await AuthService.verifyToken(token)
    console.log('[POST /api/posts] Payload:', payload ? JSON.stringify({ userId: payload.userId, email: payload.email, role: payload.role }) : 'NULL')

    if (!payload) {
      console.log('[POST /api/posts] Token verification failed - returning 403')
      return NextResponse.json(
        { error: 'Editor or admin access required' },
        { status: 403 }
      )
    }

    const roleValue = payload.role ? String(payload.role).toLowerCase() : undefined
    console.log('[POST /api/posts] Role check: role=', roleValue, ', allowed:', roleValue === 'admin' || roleValue === 'editor')

    if (roleValue !== 'admin' && roleValue !== 'editor') {
      console.log('[POST /api/posts] Role not admin or editor - returning 403')
      return NextResponse.json(
        { error: 'Editor or admin access required' },
        { status: 403 }
      )
    }

    console.log('[POST /api/posts] Authorization successful for userId=', payload.userId)

    const body = await request.json()
    const newPost = await postsApi.create(body)

    return NextResponse.json({ post: newPost }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}