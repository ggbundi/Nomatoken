const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Environment configuration
const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || (dev ? 'localhost' : '0.0.0.0')
const port = parseInt(process.env.PORT || '3000', 10)

// Security configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://nomatoken.com', 'https://www.nomatoken.com']

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Security headers middleware
function addSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (!dev) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
}

// CORS middleware
function handleCORS(req, res) {
  const origin = req.headers.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return true
  }

  return false
}

// Request logging middleware
function logRequest(req) {
  if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
    const timestamp = new Date().toISOString()
    const method = req.method
    const url = req.url
    const userAgent = req.headers['user-agent'] || 'Unknown'

    console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`)
  }
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Add security headers
      addSecurityHeaders(res)

      // Handle CORS
      if (handleCORS(req, res)) {
        return // Preflight request handled
      }

      // Log request
      logRequest(req)

      // Parse the URL
      const parsedUrl = parse(req.url, true)

      // Handle the request
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
  .listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`> NomaToken DApp ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${process.env.NODE_ENV}`)
    console.log(`> M-Pesa Environment: ${process.env.MPESA_ENVIRONMENT || 'not configured'}`)
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})
