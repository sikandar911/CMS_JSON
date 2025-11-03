import React from 'react'

export default function FeaturedCourses() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Featured Courses</h3>

      {/* Course Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <a href="#" className="block">
          <div className="w-full h-40 bg-gray-100 overflow-hidden">
            <img src="https://res.cloudinary.com/drgot7znf/image/upload/v1760352534/photo-1610563166150-b34df4f3bcd6_pyyfcl.jpg" alt="Computer Science MSc" className="w-full h-full object-cover" />
          </div>
        </a>
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-900">Computer Science MSc</h4>
          <p className="text-xs text-gray-500 mt-1">Imperial College London</p>
          <a href="#" className="mt-4 inline-block w-full text-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium">
            View Course
          </a>
        </div>
      </div>

      {/* Course Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <a href="#" className="block">
          <div className="w-full h-40 bg-gray-100 overflow-hidden">
            <img src="https://res.cloudinary.com/drgot7znf/image/upload/v1760352622/photo-1758874384555-37d50c0ee81a_rmx8ub.jpg" alt="Business Management BA" className="w-full h-full object-cover" />
          </div>
        </a>
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-900">Business Management BA</h4>
          <p className="text-xs text-gray-500 mt-1">University of Manchester</p>
          <a href="#" className="mt-4 inline-block w-full text-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium">
            View Course
          </a>
        </div>
      </div>
    </div>
  )
}
