'use client'

import React, { useState, useEffect } from 'react'
import { clientApi, ClientApiError } from '@/lib/client-api'
import { useRouter } from 'next/navigation'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  published_at?: string
}

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)
  const router = useRouter()

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    console.log('Admin page: Starting authentication check...')
    
    // Simple timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Admin page: Timeout reached, stopping loading')
      setLoading(false)
    }, 5000)

    try {
      // Check for token
      const token = localStorage.getItem('blog_auth_token')
      console.log('Admin page: Token exists:', !!token)
      
      if (token) {
        console.log('Admin page: User has token, setting authenticated and loading posts')
        setIsAuthenticated(true)
        loadPosts().finally(() => clearTimeout(timeoutId))
      } else {
        console.log('Admin page: No token found, showing login form')
        setLoading(false)
        clearTimeout(timeoutId)
      }
    } catch (error) {
      console.error('Admin page: Error in useEffect:', error)
      setLoading(false)
      clearTimeout(timeoutId)
    }
  }, [])

  const loadPosts = async () => {
    console.log('Admin page: loadPosts started')
    try {
      setLoading(true)
      
      // Add timeout to API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 10000)
      )
      
      const apiPromise = clientApi.posts.getAll()
      const response = await Promise.race([apiPromise, timeoutPromise]) as any
      
      console.log('Admin page: API response received:', response)
      
      if (!response || !response.posts) {
        throw new Error('Invalid response format')
      }
      
      const allPosts = response.posts
      const validPosts = allPosts
        .filter((post: any) => post && (post.status === 'draft' || post.status === 'published'))
        .map((post: any) => ({
          ...post,
          status: post.status as 'draft' | 'published'
        }))
      
      console.log('Admin page: Setting posts:', validPosts.length, 'posts found')
      setPosts(validPosts as Post[])
    } catch (error) {
      console.error('Admin page: Error loading posts:', error)
      
      if (error instanceof ClientApiError && error.status === 401) {
        console.log('Admin page: 401 error, clearing auth')
        clientApi.auth.logout()
        setIsAuthenticated(false)
      } else {
        // Show error but don't log out for other errors
        showNotification('Failed to load posts. Please refresh the page.', 'error')
      }
    } finally {
      console.log('Admin page: loadPosts completed, setting loading to false')
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    try {
      const result = await clientApi.auth.login(email, password)
      if (result.token) {
        clientApi.auth.setToken(result.token)
        setIsAuthenticated(true)
        loadPosts()
      } else {
        setLoginError(result.error || 'Login failed')
      }
    } catch (error) {
      if (error instanceof ClientApiError) {
        // If rate limited/banned
        if (error.status === 429) {
          const body = (error as any).body || {}
          if (body.banTTL) {
            const mins = Math.ceil(body.banTTL / 60)
            setLoginError(body.error || `Too many attempts. Blocked for ${mins} minutes.`)
          } else {
            setLoginError(body.error || `Too many attempts. Try again in ${body.retryAfter || 'a moment'}.`)
          }
        } else if (error.status === 401) {
          // Invalid credentials - show remaining attempts if provided
          const body = (error as any).body || {}
          if (body.remaining !== undefined) {
            setLoginError(`${body.error || 'Invalid credentials'}. Attempts remaining: ${body.remaining}`)
          } else {
            setLoginError(error.message)
          }
        } else {
          setLoginError(error.message)
        }
      } else {
        setLoginError('Login failed. Please try again.')
      }
      console.error('Login error:', error)
    }
  }

  const handleLogout = () => {
    clientApi.auth.logout()
    setIsAuthenticated(false)
    setPosts([])
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await clientApi.posts.delete(postId)
      setPosts(posts.filter(post => post.id !== postId))
      showNotification('Post deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting post:', error)
      showNotification('Failed to delete post. Please try again.', 'error')
    }
  }

  const handlePublishToggle = async (post: Post) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published'
      const updatedPost: Post = {
        ...post,
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : undefined
      }

      await clientApi.posts.update(post.id, updatedPost)
      setPosts(posts.map(p => p.id === post.id ? updatedPost : p))
      showNotification(`Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`, 'success')
    } catch (error) {
      console.error('Error updating post status:', error)
      showNotification('Failed to update post status. Please try again.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter your password"
              />
            </div>

            {loginError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Bar */}
      {notification && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-white text-center transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-600'
              : notification.type === 'error'
              ? 'bg-red-600'
              : 'bg-blue-600'
          }`}
          role="alert"
          aria-label={`${notification.type} notification`}
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close notification"
              title="Close notification"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white shadow-sm border-b border-gray-200 ${notification ? 'mt-12' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog Admin</h1>
              <p className="text-sm text-gray-600">Manage your blog posts</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Home
              </a>
              <a
                href="/admin/posts/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                New Post
              </a>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Posts ({posts.length})</h2>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first blog post</p>
              <a
                href="/admin/posts/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create your first post
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          <a
                            href={`/admin/posts/${post.id}/edit`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </a>
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>Created: {formatDate(post.created_at)}</span>
                        <span>Updated: {formatDate(post.updated_at)}</span>
                        {post.published_at && (
                          <span>Published: {formatDate(post.published_at)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </a>
                      
                      <a
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      >
                        Edit
                      </a>

                      <button
                        onClick={() => handlePublishToggle(post)}
                        className={`text-sm font-medium ${
                          post.status === 'published'
                            ? 'text-yellow-600 hover:text-yellow-700'
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}