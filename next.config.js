/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true
    },
    compiler: {
        // removeConsole: process.env.NODE_ENV === "production"
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'metadata.ens.domains',
                port: '',
                pathname: '/mainnet/**'
            },
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
                port: '',
                pathname: '/*/**'
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/*/**'
            }
        ]
    },
    experimental: {}
}

module.exports = withBundleAnalyzer(nextConfig)
