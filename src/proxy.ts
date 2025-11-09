import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes (sign-in, sign-up, home)
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

// Use Clerk middleware with explicit protection logic
export default clerkMiddleware(async (auth, request) => {
  // Debug log to confirm middleware runs
  console.log("[proxy] path:", request.nextUrl.pathname);

  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// Recommended matcher per Clerk docs
export const config = {
  matcher: [
    // Skip Next.js internals and static files unless in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
