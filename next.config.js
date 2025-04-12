/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': false,
      'path': false,
    }
    return config
  }
}

module.exports = nextConfig