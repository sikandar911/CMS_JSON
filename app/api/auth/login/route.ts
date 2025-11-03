import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { isBanned, consumeRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: check ban status first (non-consuming). We'll consume a token only on failed login.
    const clientId = getClientIdentifier(request)
    const banStatus = await isBanned(`login:${clientId}`)
    if (banStatus.banned) {
      const retrySecs = Math.max(1, Math.ceil((banStatus.banTTL || 60)))
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. You are temporarily blocked for ${Math.ceil((banStatus.banTTL || 0) / 60)} minutes.`,
          retryAfter: retrySecs,
          banTTL: banStatus.banTTL,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retrySecs),
          },
        }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await AuthService.login(email, password)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      // Consume a token because credentials were wrong. This updates remaining.
      const consume = await consumeRateLimit(`login:${clientId}`, 5, 60, 30)

      if (!consume.success && consume.banned) {
        const retrySecs = Math.max(1, Math.ceil((consume.banTTL || 60)))
        return NextResponse.json(
          {
            success: false,
            error: `Too many login attempts. You are temporarily blocked for ${Math.ceil((consume.banTTL || 0) / 60)} minutes.`,
            retryAfter: retrySecs,
            banTTL: consume.banTTL,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(retrySecs),
              'X-RateLimit-Limit': String(consume.limit),
              'X-RateLimit-Remaining': String(consume.remaining),
            },
          }
        )
      }

      // Return 401 with updated remaining attempts
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          limit: consume.limit,
          remaining: consume.remaining,
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}