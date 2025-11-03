import { NextRequest, NextResponse } from 'next/server'
import { postRevisionsApi as revisionsApi } from '@/lib/api'
import { AuthService } from '@/lib/auth'

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
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
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const postId = parseInt(params.id)
  const revisions = await revisionsApi.getByPostId(postId)
  const revisionCount = Array.isArray(revisions) ? revisions.length : 0

    return NextResponse.json({ 
      revisions,
      count: revisionCount
    })
  } catch (error) {
    console.error('Error fetching revisions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revisions' },
      { status: 500 }
    )
  }
}