import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', 'sign-up(.*)'])

export default clerkMiddleware((auth, req) => {
  // if auth dont go back to landing page
  if (auth().userId && isPublicRoute(req)) {
    let path = '/select-org'
    if (auth().orgId) {
      path = `/organization/${auth().orgId}`
    }
    const orgSelection = new URL(path, req.url)
    return NextResponse.redirect(orgSelection)
  }

  // if not auth and go to not public route
  if (!isPublicRoute(req)) auth().protect()

  // if auth but no orgId and not go to select-org
  if (
    auth().userId &&
    !auth().orgId &&
    req.nextUrl.pathname !== '/select-org'
  ) {
    const orgSelection = new URL('/select-org', req.url)
    return NextResponse.redirect(orgSelection)
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
