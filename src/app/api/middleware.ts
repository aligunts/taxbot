import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to handle API requests and add proper error handling
 */
export async function middleware(request: NextRequest) {
  // Skip middleware for non-API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Add CORS headers to all API responses
  const response = NextResponse.next();

  // Allow requests from any origin for development
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Add cache control headers to prevent caching of API responses
  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
