import { NextRequest, NextResponse } from 'next/server'

// Function to resolve a URL relative to a base URL
function resolveUrl(url: string, base: string): string {
  try {
    return new URL(url, base).toString()
  } catch {
    return url
  }
}

// Function to rewrite URLs in HTML content to go through the proxy
function rewriteHtml(html: string, baseUrl: string): string {
  const proxyUrl = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  // Add a <base> tag to resolve relative paths correctly
  if (!html.match(/<base\s+href=/i)) {
    html = html.replace('<head>', `<head><base href="${baseUrl}">`)
  }

  // Rewrite attributes
  return html
    .replace(/ (href|src|action|formaction)=["'](.*?)["']/g, (match, attr, url) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) {
        return match
      }
      const absoluteUrl = resolveUrl(url, baseUrl)
      return ` ${attr}="${proxyUrl(absoluteUrl)}"`
    })
    .replace(/ srcset=["'](.*?)["']/g, (match, srcset) => {
      const newSrcset = srcset
        .split(',')
        .map((part: string) => {
          const [url, descriptor] = part.trim().split(/\s+/)
          if (!url) return part
          const absoluteUrl = resolveUrl(url, baseUrl)
          return `${proxyUrl(absoluteUrl)} ${descriptor || ''}`.trim()
        })
        .join(', ')
      return ` srcset="${newSrcset}"`
    })
    // Remove integrity attributes as content is modified
    .replace(/ integrity=["'].*?["']/g, '')
}

async function proxyRequest(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url')
  if (!urlParam) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    const targetUrl = new URL(urlParam)

    const requestHeaders = new Headers(request.headers)
    // Let the browser set the host, referer, and origin
    requestHeaders.delete('host')
    requestHeaders.delete('referer')
    requestHeaders.delete('origin')

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: requestHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual', // Handle redirects manually
    })

    // Handle redirects
    if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
      const redirectUrl = resolveUrl(response.headers.get('location')!, targetUrl.toString())
      const proxiedRedirectUrl = `${request.nextUrl.origin}/api/proxy?url=${encodeURIComponent(redirectUrl)}`
      return NextResponse.redirect(proxiedRedirectUrl, 302)
    }

    const responseHeaders = new Headers(response.headers)
    // Remove security headers that prevent embedding
    responseHeaders.delete('content-security-policy')
    responseHeaders.delete('x-frame-options')
    responseHeaders.delete('content-encoding') // Let Next.js handle compression

    let body: BodyInit | null = response.body
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('text/html')) {
      const originalHtml = await response.text()
      body = rewriteHtml(originalHtml, targetUrl.toString())
    }

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred in the proxy.' },
      { status: 500 }
    )
  }
}

export const GET = proxyRequest
export const POST = proxyRequest
