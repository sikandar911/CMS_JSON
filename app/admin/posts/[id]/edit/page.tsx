'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { clientApi, ClientApiError } from '@/lib/client-api'
import { generateSlug, generateExcerpt } from '@/lib/seo'
import BlockEditor from '@/components/BlockEditor'
import BlockRenderer from '@/components/BlockRenderer'
import { getCategories } from '@/lib/categories'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  meta_title?: string
  meta_description?: string
  status: 'draft' | 'published'
  tags: string[]
  category: string
  canonical_url?: string
  featured_image?: string
  published_at?: string
}

interface BlockData {
  id: string
  type: string
  content: any
  settings?: any
  order: number
}

export default function EditPost() {
  const router = useRouter()
  const params = useParams()
  
  const [post, setPost] = useState<Post | null>(null)
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview' | 'revisions'>('content')
  const [tagInput, setTagInput] = useState('')
  const [revisions, setRevisions] = useState<any[]>([])
  const [revisionCount, setRevisionCount] = useState(0)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    show: boolean
  }>({ type: 'info', message: '', show: false })

  useEffect(() => {
    // Check authentication
    if (!clientApi.auth.isAuthenticated()) {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    loadPost()
  }, [router])

  const loadPost = async () => {
    if (!params?.id) return
    
    try {
      setLoading(true)
      const postResponse = await clientApi.posts.getById(parseInt(params.id as string))
      setPost(postResponse.post)

      // Load blocks for this post
      const blocksResponse = await clientApi.blocks.getAll(parseInt(params.id as string))
      setBlocks(blocksResponse.blocks || [])

      // Load revisions for this post
      try {
        const revisionsResponse = await fetch(`/api/posts/${params.id}/revisions`, {
          headers: {
            'Authorization': `Bearer ${clientApi.auth.getToken()}`
          }
        })
        if (revisionsResponse.ok) {
          const revisionsData = await revisionsResponse.json()
          setRevisions(revisionsData.revisions || [])
          setRevisionCount(revisionsData.count || 0)
        }
      } catch (error) {
        console.error('Error loading revisions:', error)
      }
    } catch (error) {
      console.error('Error loading post:', error)
      if (error instanceof ClientApiError && error.status === 401) {
        clientApi.auth.logout()
        router.push('/admin')
      } else if (error instanceof ClientApiError && error.status === 404) {
        router.push('/admin')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePostChange = (field: keyof Post, value: string | string[]) => {
    if (!post) return
    
    setPost(prev => {
      if (!prev) return prev
      
      const updated = { ...prev, [field]: value }
      
      // Auto-generate slug when title changes
      if (field === 'title' && typeof value === 'string') {
        updated.slug = generateSlug(value)
      }
      
      return updated
    })
  }

  const handleBlocksChange = (newBlocks: BlockData[]) => {
    setBlocks(newBlocks)
  }

  const addTag = () => {
    if (!post) return
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => prev ? ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }) : prev)
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (!post) return
    setPost(prev => prev ? ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }) : prev)
  }

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  const handleSave = async (publishStatus: 'draft' | 'published' = post?.status || 'draft') => {
    if (!post || !post.title.trim()) {
      showNotification('error', 'Please enter a post title')
      return
    }

    setSaving(true)
    try {
      // Update the post
      const postData = {
        ...post,
        status: publishStatus,
        published_at: publishStatus === 'published' && post.status !== 'published' 
          ? new Date().toISOString() 
          : post.published_at
      }

      const response = await clientApi.posts.update(post.id, postData)
      const savedPost = response.post

      // Update blocks if any changes
      if (blocks.length > 0) {
        const blocksWithPostId = blocks.map((block, index) => ({
          ...block,
          post_id: savedPost.id,
          index: index,
          updated_by: 1
        }))

        await clientApi.blocks.updateMany(blocksWithPostId)
      }

      // Update local state
      setPost(savedPost)
      
      // Reload revisions after save
      try {
        const revisionsResponse = await fetch(`/api/posts/${post.id}/revisions`, {
          headers: {
            'Authorization': `Bearer ${clientApi.auth.getToken()}`
          }
        })
        if (revisionsResponse.ok) {
          const revisionsData = await revisionsResponse.json()
          setRevisions(revisionsData.revisions || [])
          setRevisionCount(revisionsData.count || 0)
        }
      } catch (error) {
        console.error('Error loading revisions:', error)
      }
      
      showNotification('success', `Post ${publishStatus === 'published' ? 'published' : 'saved'} successfully!`)
    } catch (error) {
      console.error('Error saving post:', error)
      if (error instanceof ClientApiError && error.status === 401) {
        clientApi.auth.logout()
        router.push('/admin')
      } else if (error instanceof ClientApiError) {
        showNotification('error', error.message || 'Failed to save post. Please try again.')
      } else {
        showNotification('error', (error as any)?.message || 'Failed to save post. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Post not found</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Bar */}
      {notification.show && (
        <div className={`fixed top-0 left-0 right-0 z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white px-4 py-3 shadow-lg`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
              <span className="font-medium">{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="text-white hover:text-gray-200"
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
      <header className={`bg-white shadow-sm border-b border-gray-200 ${notification.show ? 'mt-14' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Admin
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
                <p className="text-sm text-gray-600">{post.title || 'Untitled Post'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {(['content', 'seo', 'preview', 'revisions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                  {tab === 'revisions' && revisionCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {revisionCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Basic Post Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      value={post.title}
                      onChange={(e) => handlePostChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Enter post title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={(e) => handlePostChange('slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="post-slug"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={post.category}
                      onChange={(e) => handlePostChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      title="Select category"
                    >
                      {getCategories().map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Tags
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        placeholder="Enter tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={post.excerpt}
                    onChange={(e) => handlePostChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Brief description of the post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={post.featured_image || ''}
                    onChange={(e) => handlePostChange('featured_image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  {post.featured_image && (
                    <div className="mt-2">
                      <img
                        src={post.featured_image}
                        alt="Featured image preview"
                        className="w-32 h-20 object-cover rounded-md border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Block Editor */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Content Blocks</h3>
                  <BlockEditor
                    initialBlocks={blocks}
                    onChange={handleBlocksChange}
                  />
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={post.meta_title || ''}
                    onChange={(e) => handlePostChange('meta_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={post.meta_description || ''}
                    onChange={(e) => handlePostChange('meta_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="SEO description for search engines (150-160 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={post.canonical_url || ''}
                    onChange={(e) => handlePostChange('canonical_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="https://example.com/canonical-url"
                  />
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {post.title || 'Post Title'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt || 'Post excerpt will appear here...'}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Category: {post.category} | Status: {post.status} | ID: {post.id}
                  </div>
                </div>

                {blocks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Content Preview</h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <BlockRenderer blocks={blocks} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'revisions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Revision History</h3>
                  <div className="text-sm text-gray-500">
                    Total revisions: {revisionCount}
                  </div>
                </div>

                {revisions.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No revisions yet. Save changes to create the first revision.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {revisions.map((revision) => (
                      <div key={revision.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  #{revision.revision_number}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Revision #{revision.revision_number}
                              </p>
                              <p className="text-xs text-gray-500">
                                Edited by {revision.author?.display_name || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(revision.edited_at || revision.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}