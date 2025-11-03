// MINIMAL MIDDLEWARE - NO SECURITY FEATURES
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Pass through all requests without any processing
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
