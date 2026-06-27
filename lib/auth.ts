import { auth } from "@clerk/nextjs/server";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const MOCK_USER_ID = "user_2a1B3c4D5e6F7g8H9i0J";

export async function getAuthUser() {
  if (HAS_CLERK) {
    try {
      const session = await auth();
      return {
        userId: session.userId,
        isSignedIn: !!session.userId,
      };
    } catch (e) {
      console.warn("Failed to get Clerk session, falling back to mock user", e);
    }
  }

  // Graceful fallback for mock dev mode
  return {
    userId: MOCK_USER_ID,
    isSignedIn: true,
  };
}
