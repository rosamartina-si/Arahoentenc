/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuració bàsica
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false, // Millora seguretat en producció
  poweredByHeader: false, // Amaga el header X-Powered-By per seguretat

  // Configuració d'imatges
  images: {
    domains: ['www.ccma.cat', 'api.ccma.cat'], // Dominis permesos per a optimització d'imatges
    minimumCacheTTL: 3600, // 1 hora de cache per imatges
  },

  // Headers de seguretat
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // Configuració de redireccionaments (exemple)
  async redirects() {
    return [
      {
        source: '/tv3',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Configuració de rewrites per a l'API (si es necessari)
  async rewrites() {
    return [
      {
        source: '/api/tv3/:path*',
        destination: 'https://api.ccma.cat/:path*', // Exemple de proxy
      },
    ]
  },

  // Optimització per a entorns serverless
  experimental: {
    serverComponentsExternalPackages: ['axios', 'cheerio'],
    optimizeCss: true,
    scrollRestoration: true,
  },
}

// Capçaleres de seguretat
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: www.ccma.cat api.ccma.cat; font-src 'self'; connect-src 'self' api.ccma.cat www.ccma.cat; frame-src 'self'`,
  },
]

module.exports = nextConfig
