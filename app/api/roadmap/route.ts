import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'
import { roadmapSubmissionsApi } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 roadmap submissions per 60 seconds per IP
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await checkRateLimit(`roadmap:${clientId}`, 20, 60)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      )
    }

    const { name, email, course, level } = await request.json()

    if (!name || !email || !course) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and course are required' },
        { status: 400 }
      )
    }

    // Save roadmap submission to JSON DB
    const submission = await roadmapSubmissionsApi.create({
      target_degree: course,
      academic_level: level || 'beginner',
      field_of_study: course,
      email: email,
    })

    return NextResponse.json({
      success: true,
      message: 'Roadmap request submitted successfully',
      submission: {
        id: submission.id,
        email: submission.email
      }
    })

  } catch (error) {
    console.error('Roadmap submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit roadmap request' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to retrieve submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // You can add authentication check here
    const submissions = await roadmapSubmissionsApi.getAll()

    return NextResponse.json({
      success: true,
      submissions
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
