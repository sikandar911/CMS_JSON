"use client"

import React, { useState, useEffect } from 'react'
import RoadmapForm from './RoadmapForm'

interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  category?: string
  published_at?: string | null
  created_at?: string
  featured_image?: string
}

export default function ReadingNow({ initialPosts }: { initialPosts?: any }) {
  const POSTS_PER_PAGE = 6
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Reset to first page if the incoming posts change
  // Normalize initialPosts by finding the first array of post-like objects
  const findPostsArray = (input: any, depth = 0, visited = new Set()): any[] => {
    if (!input || depth > 6) return []
    if (visited.has(input)) return []
    if (Array.isArray(input)) {
      // check if array looks like posts (has objects with slug or title or id)
      if (input.length === 0) return []
      const sample = input.find((x) => x && typeof x === 'object')
      if (sample && (sample.slug || sample.title || sample.id)) return input
      // maybe nested one level: [{ post: {...} }, ...]
      const unwrapped = input.map((x) => (x && x.post ? x.post : x)).filter(Boolean)
      if (unwrapped.length > 0 && (unwrapped[0].slug || unwrapped[0].title || unwrapped[0].id)) return unwrapped
      // otherwise try to search inside array elements
      for (const el of input) {
        const found = findPostsArray(el, depth + 1, visited)
        if (found.length) return found
      }
      return []
    }

    if (typeof input === 'object') {
      visited.add(input)
      // common keys
      const keysToTry = ['data', 'posts', 'rows', 'results', 'items', 'docs', 'payload']
      for (const k of keysToTry) {
        if (Array.isArray(input[k])) {
          const candidate = input[k]
          const sample = candidate.find((x: any) => x && typeof x === 'object')
          if (sample && (sample.slug || sample.title || sample.id)) return candidate
          const unwrapped = candidate.map((x: any) => (x && x.post ? x.post : x)).filter(Boolean)
          if (unwrapped.length > 0 && (unwrapped[0].slug || unwrapped[0].title || unwrapped[0].id)) return unwrapped
        }
      }

      // search values recursively
      for (const val of Object.values(input)) {
        const found = findPostsArray(val, depth + 1, visited)
        if (found.length) return found
      }
    }

    return []
  }

  const postsArray: Post[] = findPostsArray(initialPosts)
  const flattenedPosts = postsArray.map((p: any) => (p && p.post ? p.post : p))

  // Warn in dev if normalization yields nothing (helps trace DB/API shape issues)
  if (process.env.NODE_ENV !== 'production' && flattenedPosts.length === 0 && initialPosts) {
    // eslint-disable-next-line no-console
    console.warn('ReadingNow: normalized initialPosts to empty array — incoming shape:', initialPosts)
  }

  useEffect(() => {
    setPage(1)
  }, [postsArray])

  // reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedCategory])

  // compute filtered posts based on search and category
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredPosts = flattenedPosts.filter((p: Post) => {
    if (!p || typeof p !== 'object') return false
    const matchesCategory = selectedCategory ? (p.category === selectedCategory) : true
    if (!normalizedSearch) return matchesCategory
    const inTitle = (p.title || '').toLowerCase().includes(normalizedSearch)
    const inExcerpt = (p.excerpt || '').toLowerCase().includes(normalizedSearch)
    return matchesCategory && (inTitle || inExcerpt)
  })

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const start = (page - 1) * POSTS_PER_PAGE
  const pagedPosts = filteredPosts.slice(start, start + POSTS_PER_PAGE)

  // derive available categories from posts (unique)
  const categories = Array.from(new Set(flattenedPosts.map((p: any) => p?.category).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)))

  return (
    
    <section className="py-10 px-5 bg-gray-50">
      <div className="max-w-7xl mx-auto sm:px-3 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-[#EF623C]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 12l5-5 7 7" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">What Students Are Reading Now</h2>
          </div>
          <p className="text-gray-600 mt-2">Join thousands of students accessing the most valuable content this week</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Search & Category filter moved inside the blog list and shown at top */}
            <div className="mb-6 flex flex-col sm:flex-row items-center gap-3 ">
              <div className="w-full sm:w-80">
          <input
            aria-label="Search posts"
            placeholder="Search by title or excerpt"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white"
            style={{ color: 'black' }}
          />
              </div>
              <div>
          <select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
            style={{ color: 'black' }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pagedPosts.map((post) => (
            <article
              key={post.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                transform: 'none',
                transition: 'transform 500ms ease-out, box-shadow 500ms ease-out',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px) scale(1.01)'
                el.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'none'
                el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <div className="relative h-44 bg-gray-100">
                <img
                  src={post.featured_image || 'https://res.cloudinary.com/drgot7znf/image/upload/v1759752597/blog_image_a2jalg.jpg'}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    bottom: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: '#045B5C',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                  }}
                >
                  {post.category || 'Article'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  <a href={`/blog/${post.slug}`}>{post.title}</a>
                </h3>

                <p
                  className="text-sm text-gray-600 mb-4"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {post.excerpt}
                </p>

                {/* Footer anchored to bottom */}
                <div className="mt-auto flex items-center justify-between">
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#EF623C] text-white text-sm no-underline"
                  >
                    Read More
                  </a>
                  <div className="text-sm text-gray-500">
                    {new Date(post.published_at || post.created_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
            </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-3 py-2 bg-white border rounded-md"
            disabled={page === 1}
          >
            Prev
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1
              return (
                <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded-md ${p === page ? 'bg-[#EF623C] text-white' : 'bg-white border text-gray-700'}`}
                >
            {p}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="px-3 py-2 bg-white border rounded-md"
            disabled={page === totalPages}
          >
            Next
          </button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {/* Roadmap student form */}
            <RoadmapForm />
            {/* Roadmap student form end */}


            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center gap-3 mb-2">
          <svg className="w-5 h-5 text-[#EF623C]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7h7l-5.5 4.2L20 22l-8-5.6L4 22l2.5-8.8L1 9h7l3-7z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900">What's Trending</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Most popular topics this week</p>

              <div className="flex flex-col gap-2 mb-3">
          {['UCAS Applications','Student Loans','University Rankings','Personal Statements','Accommodation','Scholarships'].map((t) => (
            <button key={t} className="text-sm px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-left">{t}</button>
          ))}
              </div>

              <button className="w-full px-4 py-2 rounded-md border border-[#1C334D] text-[#1C334D]">View All Trending</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
