import Link from 'next/link'

export default function Navigation() {
  return (
    // Transparent header so hero image can be visible behind it
    <nav className="absolute inset-x-0 top-0 z-30 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">UAPP</h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-white hover:text-white/90 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>

            <Link
              href="/blog"
              className="text-white hover:text-white/90 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Blog
            </Link>

            <Link
              href="/admin"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors border border-white/30 text-white bg-white/10 hover:bg-white/20"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}