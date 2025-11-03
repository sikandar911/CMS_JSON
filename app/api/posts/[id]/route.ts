import { NextRequest, NextResponse } from 'next/server'
import { postsApi, revisionsApi } from '@/lib/api'
import { AuthService } from '@/lib/auth'

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const postId = parseInt(params.id)
    const post = await postsApi.getById(postId)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const payload = await AuthService.verifyToken(token)
    // Normalize payload to user object: verifyToken returns JWT payload with userId/email/role
    const user = payload ? { id: payload.userId, email: payload.email, role: payload.role } : null

    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Editor or admin access required' },
        { status: 403 }
      )
    }

    const postId = parseInt(params.id)
    const body = await request.json()

    // Debug logging to help trace 404s from the client
    console.log('[PUT /api/posts/:id] postId=', postId)
    console.log('[PUT /api/posts/:id] Authorization header=', request.headers.get('authorization'))
    try {
      console.log('[PUT /api/posts/:id] incoming body keys=', Object.keys(body || {}))
    } catch (e) {
      console.log('[PUT /api/posts/:id] incoming body (non-json)')
    }

    // Sanitize incoming payload: only allow writable scalar fields and map nested author -> author_id
    const allowedFields = [
      'title',
      'slug',
      'excerpt',
      'status',
      'published_at',
      'meta_title',
      'meta_description',
      'canonical_url',
      'category',
      'tags',
      'featured_image',
      'featured_image_id',
      'language',
      'author_id',
      'active'
    ]

    const updates: Record<string, any> = {}
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updates[key] = body[key]
      }
    }

    // Map nested author object to author_id when present
    if (body?.author && typeof body.author === 'object' && body.author.id) {
      updates.author_id = body.author.id
    }

    // Attempt update (pass user.id for revision tracking)
    let updatedPost = null
    try {
      updatedPost = await postsApi.update(postId, updates, user.id)
    } catch (err) {
      console.error('[PUT /api/posts/:id] postsApi.update threw:', err)
      throw err
    }

    if (!updatedPost) {
      // Distinguish between "not found" and update failure
      const existing = await postsApi.getById(postId)
      if (!existing) {
        console.log('[PUT /api/posts/:id] post does not exist (id=', postId, ')')
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      console.log('[PUT /api/posts/:id] update returned null for id=', postId, ' updates=', updates)

      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const user = await AuthService.verifyToken(token)
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Editor or admin access required' },
        { status: 403 }
      )
    }

    const postId = parseInt(params.id)
    const deleted = await postsApi.delete(postId)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}