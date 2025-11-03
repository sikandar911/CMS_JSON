'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function BlogSlider({ posts }: { posts?: any }) {
  // Normalize posts to an array to guard against unexpected shapes
  const postsArray: any[] = (() => {
    if (!posts) return []
    if (Array.isArray(posts)) return posts
    // Common wrappers (e.g. data: [...])
    if (posts && Array.isArray((posts as any).data)) return (posts as any).data
    // If it's an object map, return its values
    if (typeof posts === 'object') return Object.values(posts)
    return []
  })()

  // Filter out null/invalid entries before sorting
  const validPosts = postsArray.filter((p) => p && typeof p === 'object')
  const latest = validPosts.slice().sort((a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0)).slice(0, 5)
  const items = latest.concat(latest)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const isDraggingRef = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)

  // duration in seconds for a single loop (based on number of items)
  const duration = Math.max(12, Math.min(30, 6 * Math.max(1, latest.length)))

  useEffect(() => {
    const el = scrollRef.current
    if (!el || latest.length === 0) return

    const singleWidth = el.scrollWidth / 2
    const speed = singleWidth / duration // pixels per second

    const step = (time: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time
      const dt = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time

      if (!isPaused && !isDraggingRef.current) {
        el.scrollLeft = el.scrollLeft + speed * dt
        if (el.scrollLeft >= singleWidth) {
          el.scrollLeft = el.scrollLeft - singleWidth
        }
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
    }
  }, [posts, duration, latest.length, isPaused])

  // Pointer handlers for drag-to-scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onPointerDown = (e: PointerEvent) => {
      // Don't start dragging if the user clicked an interactive element (link, button, input, etc.)
      const targetEl = e.target as Element
      if (typeof (targetEl as HTMLElement)?.closest === 'function') {
        const interactive = (targetEl as HTMLElement).closest('a,button,input,textarea,select,label')
        if (interactive) return
      }

      isDraggingRef.current = true
      dragStartX.current = e.clientX
      dragStartScroll.current = el.scrollLeft
      setIsPaused(true)
      // Only call setPointerCapture if supported
      try {
        if (typeof (targetEl as any).setPointerCapture === 'function') {
          (targetEl as any).setPointerCapture(e.pointerId)
        }
      } catch (err) {
        // ignore - some elements don't support pointer capture
      }
      document.documentElement.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - dragStartX.current
      el.scrollLeft = dragStartScroll.current - dx
      // wrap behavior
      const singleWidth = el.scrollWidth / 2
      if (el.scrollLeft < 0) {
        el.scrollLeft = singleWidth + el.scrollLeft
      } else if (el.scrollLeft >= singleWidth) {
        el.scrollLeft = el.scrollLeft - singleWidth
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        setIsPaused(false)
        try { (e.target as Element).releasePointerCapture?.(e.pointerId) } catch (err) {}
        document.documentElement.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  if (!latest || latest.length === 0) return null

  return (
    <div className="mb-8 mt-6">
      <div
        ref={scrollRef}
        className="blog-slider overflow-x-auto no-scrollbar cursor-grab touch-pan-x flex gap-4 items-stretch py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="region"
        aria-label="Latest blog posts slider"
      >
        {items
          .filter((post: any) => post && post.slug)
          .map((post: any, idx: number) => (
            <article key={`${post?.id ?? 'post'}-${idx}`} className="min-w-[300px] max-w-sm bg-white/5 rounded-xl p-4 flex-shrink-0">
              <h3 className="text-white font-semibold text-lg leading-tight mb-2">
                <Link href={`/blog/${post.slug}`} className="hover:underline text-white">
                  {post.title}
                </Link>
              </h3>
            <p className="text-sm text-white/80 mb-3 line-clamp-3">{post.excerpt || post.meta_description || ''}</p>
            <div className="flex items-center justify-between text-xs text-white/70">
              <time>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</time>
              <Link href={`/blog/${post.slug}`} className="text-[#EF623C]">Read</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
