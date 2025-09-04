/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopackを無効にして従来のWebpackを使用
  experimental: {
    turbo: false,
  },
}

module.exports = nextConfig