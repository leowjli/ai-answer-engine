import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function middleware(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success, remaining, reset } = await ratelimit.limit(ip);

    if(!success) {
      // if the rate is exceeded by the user, return a 429 error
      return NextResponse.json(
        { error: `Rate limit has been exceeded. Try again in ${reset} seconds.` },
        { status : 429 }
      );
    }
    const response = NextResponse.next();
    
    console.log(`Remaining requests: ${remaining}; will be resetted at ${reset}`);

    return response;
  } catch (error) {
    console.error("Error during rate limiting: ", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}


// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
