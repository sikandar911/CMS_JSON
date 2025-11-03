/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['blogs.uapp.uk'],
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  },
}

module.exports = nextConfig