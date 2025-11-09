import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Debug endpoint: GET /api/debug/auth
// Returns minimal auth/session info and cookie presence for troubleshooting 401 issues.
// DO NOT deploy to production with full cookie logging.
export async function GET(request) {
  try {
    const authResult = auth();
    const { userId, sessionId, sessionClaims } = authResult;

    // Try alternative: currentUser() which reads directly from request
    const user = await currentUser();

    const cookieHeader = request.headers.get("cookie") || null;
    const preview = cookieHeader
      ? cookieHeader
          .split(";")
          .slice(0, 3)
          .map((s) => s.trim())
      : [];

    console.log("[debug:auth] auth() keys:", Object.keys(authResult));
    console.log("[debug:auth] userId:", userId, "sessionId:", sessionId);
    console.log(
      "[debug:auth] currentUser():",
      user?.id,
      user?.emailAddresses?.[0]?.emailAddress
    );

    return NextResponse.json({
      authMethod: {
        userId,
        sessionId,
        hasSessionClaims: !!sessionClaims,
        authKeys: Object.keys(authResult),
      },
      currentUserMethod: {
        userId: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress,
        firstName: user?.firstName,
        hasUser: !!user,
      },
      hasCookie: !!cookieHeader,
      cookiePreview: preview,
      note: "Comparing auth() vs currentUser() to debug session loading",
    });
  } catch (error) {
    console.error("[debug:auth] error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack?.split("\n").slice(0, 5),
      },
      { status: 500 }
    );
  }
}
