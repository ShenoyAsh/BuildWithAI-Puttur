import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (HAS_CLERK) {
    try {
      const { clerkMiddleware } = await import("@clerk/nextjs/server");
      // Call clerkMiddleware with the request
      return clerkMiddleware()(request, event);
    } catch (e) {
      console.warn("Failed to load Clerk middleware, skipping...", e);
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[^?]*\\.).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
