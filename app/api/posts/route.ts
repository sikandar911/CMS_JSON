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
  console.log('[POST /api/posts] === NEW REQUEST ===')
  
  try {
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

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log('[POST /api/posts] Request body parsed successfully, keys:', Object.keys(body || {}))
    } catch (parseError) {
      console.error('[POST /api/posts] Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Failed to parse JSON' },
        { status: 400 }
      )
    }

    // Create post
    console.log('[POST /api/posts] Attempting to create post with title:', body?.title)
    const newPost = await postsApi.create(body)
    console.log('[POST /api/posts] Post created successfully, id=', newPost?.id)

    return NextResponse.json({ post: newPost }, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'N/A'
    console.error('[POST /api/posts] Error creating post:', errorMessage)
    console.error('[POST /api/posts] Stack trace:', errorStack)
    return NextResponse.json(
      { error: 'Failed to create post', details: errorMessage },
      { status: 500 }
    )
  }
}