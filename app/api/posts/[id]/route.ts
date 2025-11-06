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
  console.log('[PUT /api/posts/:id] === NEW REQUEST ===')
  
  try {
    // Verify authentication (accept token from Authorization header or cookie)
    const token = AuthService.extractTokenFromRequestHeaders(request.headers)
    console.log('[PUT /api/posts/:id] Token present:', token ? 'YES (length=' + token.length + ')' : 'NO')
    
    if (!token) {
      console.log('[PUT /api/posts/:id] No token provided - returning 401')
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const payload = await AuthService.verifyToken(token)
    console.log('[PUT /api/posts/:id] Payload:', payload ? JSON.stringify({ userId: payload.userId, email: payload.email, role: payload.role }) : 'NULL')
    
    const roleValue = payload && payload.role ? String(payload.role).toLowerCase() : undefined
    const user = payload ? { id: payload.userId, email: payload.email, role: roleValue } : null

    if (!user || (roleValue !== 'admin' && roleValue !== 'editor')) {
      console.log('[PUT /api/posts/:id] Authorization failed - role:', roleValue || 'NO PAYLOAD')
      return NextResponse.json(
        { error: 'Editor or admin access required' },
        { status: 403 }
      )
    }

    const postId = parseInt(params.id)
    console.log('[PUT /api/posts/:id] Attempting to update post id=', postId, 'for user id=', user.id)

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log('[PUT /api/posts/:id] Request body parsed successfully, keys:', Object.keys(body || {}))
    } catch (parseError) {
      console.error('[PUT /api/posts/:id] Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Failed to parse JSON' },
        { status: 400 }
      )
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
    console.log('[PUT /api/posts/:id] Calling postsApi.update with updates:', Object.keys(updates))
    let updatedPost = null
    try {
      updatedPost = await postsApi.update(postId, updates, user.id)
      console.log('[PUT /api/posts/:id] postsApi.update completed, result:', updatedPost ? 'SUCCESS' : 'NULL')
    } catch (updateError) {
      console.error('[PUT /api/posts/:id] postsApi.update threw:', updateError instanceof Error ? updateError.message : String(updateError))
      throw updateError
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

    console.log('[PUT /api/posts/:id] Post updated successfully, id=', updatedPost.id)
    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'N/A'
    console.error('[PUT /api/posts/:id] Error updating post:', errorMessage)
    console.error('[PUT /api/posts/:id] Stack trace:', errorStack)
    return NextResponse.json(
      { error: 'Failed to update post', details: errorMessage },
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