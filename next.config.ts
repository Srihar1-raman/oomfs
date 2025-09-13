/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['unavatar.io', 'pbs.twimg.com'],
  },
  env: {
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  },
}

module.exports = nextConfig