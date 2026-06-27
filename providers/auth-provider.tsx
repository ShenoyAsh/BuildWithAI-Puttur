"use client";

import React, { createContext, useContext } from "react";

// Static mock user — no auth required
const MOCK_USER = {
  id: "local-user",
  emailAddress: "phoenix.dev@example.com",
  firstName: "Phoenix",
  lastName: "User",
  fullName: "Phoenix User",
  imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  username: "phoenix_user",
};

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: typeof MOCK_USER | null;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: true,
  isLoaded: true,
  user: MOCK_USER,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ isSignedIn: true, isLoaded: true, user: MOCK_USER }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  return useContext(AuthContext);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return {
    isSignedIn: ctx.isSignedIn,
    isLoaded: ctx.isLoaded,
    userId: ctx.user?.id || null,
    signOut: () => {},
  };
}

export function UserButton() {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MOCK_USER.imageUrl}
        alt={MOCK_USER.fullName}
        className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
      />
    </div>
  );
}
