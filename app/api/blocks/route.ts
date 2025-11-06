import { NextRequest, NextResponse } from 'next/server'
import { postBlocksApi } from '@/lib/api'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    let blocks
    if (postId) {
      blocks = await postBlocksApi.getByPostId(parseInt(postId))
    } else {
      blocks = await postBlocksApi.getAll()
    }

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (accept token from header or cookie)
    const token = AuthService.extractTokenFromRequestHeaders(request.headers)
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const payload = await AuthService.verifyToken(token)
    console.log('[POST /api/blocks] Token payload:', payload ? JSON.stringify(payload) : 'NULL')
  const roleValue = payload && (payload.role || (Array.isArray(payload.roles) ? payload.roles[0] : undefined)) ? String(payload.role || (Array.isArray(payload.roles) ? payload.roles[0] : '')).toLowerCase() : undefined
    console.log('[POST /api/blocks] Resolved role:', roleValue)
    if (!payload || (roleValue !== 'admin' && roleValue !== 'editor')) {
      console.log('[POST /api/blocks] Authorization failed - role:', roleValue || 'NO PAYLOAD')
      console.log('[POST /api/blocks] Request headers:', Object.fromEntries((request.headers as any).entries()))
      return NextResponse.json(
        { error: 'Editor or admin access required' },
        { status: 403 }
      )
    }

  const body = await request.json()
  console.log('[POST /api/blocks] incoming body keys=', Object.keys(body || {}))
  const newBlock = await postBlocksApi.create(body)

    return NextResponse.json({ block: newBlock }, { status: 201 })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    console.log('[PUT /api/blocks] User verified:', user ? JSON.stringify({ id: user.userId, email: user.email, role: user.role }) : 'NULL')
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Editor or admin access required' },
        { status: 403 }
      )
    }

  const body = await request.json()
  console.log('[PUT /api/blocks] incoming body keys=', Object.keys(body || {}))
  const { blocks } = body

    if (Array.isArray(blocks)) {
      // Batch update blocks
  const updatedBlocks = await postBlocksApi.updateMany(blocks)
      return NextResponse.json({ blocks: updatedBlocks })
    } else {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating blocks:', error)
    return NextResponse.json(
      { error: 'Failed to update blocks' },
      { status: 500 }
    )
  }
}