import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Dashboard only for admin/editor
    if (path.startsWith('/dashboard') && token?.role !== 'admin' && token?.role !== 'editor') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // These routes require auth
        const protectedPaths = ['/dashboard', '/blog/new', '/blog/edit', '/links/new']
        if (protectedPaths.some((p) => path.startsWith(p))) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/blog/new', '/blog/edit/:path*', '/links/new'],
}
