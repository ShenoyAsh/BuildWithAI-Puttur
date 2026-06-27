// Auth is handled client-side via mock context in providers/auth-provider.tsx
// No server-side auth needed.
export async function getAuthUser() {
  return {
    userId: "local-user",
    isSignedIn: true,
  };
}
