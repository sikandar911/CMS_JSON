'use client'

import React, { useState } from 'react'

export default function RoadmapForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    level: 'beginner'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', course: '', level: 'beginner' })
      } else {
        setSubmitStatus('error')
        console.error('Submission failed:', data.error)
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (submitStatus === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-green-800">
          <h3 className="font-medium mb-2">Thank you!</h3>
          <p className="text-sm">We've received your roadmap request. Check your email for next steps.</p>
          <button 
            onClick={() => setSubmitStatus('idle')}
            className="mt-3 text-sm text-green-700 hover:text-green-800 underline"
          >
            Submit another request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Get Your Learning Roadmap
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
            Course Interest
          </label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Select a course</option>
            <option value="web-development">Web Development</option>
            <option value="data-science">Data Science</option>
            <option value="mobile-apps">Mobile Apps</option>
            <option value="machine-learning">Machine Learning</option>
            <option value="cybersecurity">Cybersecurity</option>
          </select>
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {submitStatus === 'error' && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            Something went wrong. Please try again.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Get My Roadmap'}
        </button>
      </form>
    </div>
  )
}
