import { link } from "fs";

export default function FollowJourney() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white">
              {/* simple people icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" fill="white"/>
                <path d="M2 20c0-2.761 3.582-5 8-5s8 2.239 8 5v1H2v-1z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-gray-900">Follow Our Student Journey</h2>
          </div>
          <p className="mt-3 text-sm text-gray-600">See real student stories and connect with our community</p>
        </div>

        {/* Latest from Instagram */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-center text-base font-semibold text-gray-800 mb-4">Latest from Instagram</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Success Story', color: 'bg-pink-100'},
              { label: 'Campus Tour', color: 'bg-sky-100' },
              { label: 'Study Tips', color: 'bg-emerald-100' },
              { label: 'Application Tips', color: 'bg-amber-100' },
            ].map((card) => (
              <div key={card.label} className={`${card.color} rounded-xl shadow-sm p-8 flex items-center justify-center`}>
                <div className="text-center text-sm text-gray-800 h-20 font-medium">{card.label}</div> 
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button className="inline-flex items-center gap-3 px-5 py-2 rounded-full text-white font-medium bg-gradient-to-r from-pink-500 to-violet-600 shadow">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" fill="white"/>
              </svg>
              Follow @studyuk_official
            </button>
          </div>
        </div>

        {/* Community Engagement */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LinkedIn Card */}
            <div className="rounded-lg border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-sky-700 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8z" fill="white"/>
                  <path d="M8.5 8h3.8v2.2h.1c.5-1 1.8-2.2 3.8-2.2 4.1 0 4.9 2.7 4.9 6.2V24h-4v-7.1c0-1.7 0-3.9-2.4-3.9-2.4 0-2.8 1.8-2.8 3.7V24h-4V8z" fill="white" opacity="0.95"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Connect on LinkedIn</h4>
              <p className="text-sm text-gray-600 mt-2">Join 520+ professionals in our network</p>

              <div className="mt-6 w-full">
                <button className="w-full px-4 py-2 rounded-md bg-teal-800 text-white font-medium">Connect on LinkedIn</button>
              </div>
            </div>

            {/* Facebook Card */}
            <div className="rounded-lg border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M22 12a10 10 0 10-11.5 9.9v-7H8v-2.9h2.5V9.3c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.3.2 2.3.2v2.6H16c-1.2 0-1.6.8-1.6 1.6v1.9H18l-.4 2.9h-2v7A10 10 0 0022 12z" fill="white"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Join Facebook Community</h4>
              <p className="text-sm text-gray-600 mt-2">Join 280+ students sharing experiences</p>

              <div className="mt-6 w-full">
                <button className="w-full px-4 py-2 rounded-md bg-orange-500 text-white font-medium">Join Facebook Community</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
