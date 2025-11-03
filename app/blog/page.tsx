import { postsApi } from '@/lib/api'
import { SEOHelper } from '@/lib/seo'
import { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

// Helper function to format dates
function formatDate(dateInput?: string | Date): string {
  if (!dateInput) return ''
  const date = new Date(dateInput as any)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  published_at?: string
  meta_title?: string
  meta_description?: string
}

export const metadata: Metadata = {
  title: 'Blog | Your Site Name',
  description: 'Latest articles and insights from our blog',
  openGraph: {
    title: 'Blog | Your Site Name',
    description: 'Latest articles and insights from our blog',
    type: 'website',
  }
}

export default async function BlogPage() {
  // Get all published posts
  const allPosts = await postsApi.getAll()
  const publishedPosts = allPosts
    .filter(post => post.status === 'published')
    .sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at)
      const dateB = new Date(b.published_at || b.created_at)
      return dateB.getTime() - dateA.getTime()
    })

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Our Blog
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover insights, tips, and stories from our team. Stay updated with the latest in technology, design, and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {publishedPosts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {publishedPosts.map((post) => (
                <article 
                  key={post.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    {/* Post Date */}
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <time dateTime={(post.published_at || post.created_at) ? (post.published_at || post.created_at).toString() : undefined}>
                        {formatDate(post.published_at || post.created_at)}
                      </time>
                    </div>

                    {/* Post Title */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    {/* Post Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Read More Link */}
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      Read more
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup (Optional) */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get the latest blog posts delivered directly to your inbox.
            </p>
            <div className="max-w-md mx-auto">
              <form className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}