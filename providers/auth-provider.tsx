"use client";

import React, { createContext, useContext, useState } from "react";
import { 
  ClerkProvider, 
  useUser as useClerkUser, 
  useAuth as useClerkAuth,
  SignInButton as ClerkSignInBtn,
  SignUpButton as ClerkSignUpBtn,
  UserButton as ClerkUserBtn
} from "@clerk/nextjs";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Mock User Data for seamless developer experience
const MOCK_USER = {
  id: "user_2a1B3c4D5e6F7g8H9i0J",
  emailAddress: "phoenix.dev@example.com",
  firstName: "Alex",
  lastName: "Phoenix",
  fullName: "Alex Phoenix",
  imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  username: "alex_phoenix",
};

interface MockAuthContextType {
  isSignedIn: boolean;
  user: typeof MOCK_USER | null;
  loading: boolean;
  logout: () => void;
  login: () => void;
}

const MockAuthContext = createContext<MockAuthContextType>({
  isSignedIn: true,
  user: MOCK_USER,
  loading: false,
  logout: () => {},
  login: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(true);

  if (HAS_CLERK) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }

  const logout = () => setIsSignedIn(false);
  const login = () => setIsSignedIn(true);

  return (
    <MockAuthContext.Provider
      value={{
        isSignedIn,
        user: isSignedIn ? MOCK_USER : null,
        loading: false,
        logout,
        login,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

export function useUser() {
  if (HAS_CLERK) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const clerkUser = useClerkUser();
    return {
      isSignedIn: clerkUser.isSignedIn,
      isLoaded: clerkUser.isLoaded,
      user: clerkUser.user
        ? {
            id: clerkUser.user.id,
            emailAddress: clerkUser.user.primaryEmailAddress?.emailAddress || "",
            firstName: clerkUser.user.firstName || "",
            lastName: clerkUser.user.lastName || "",
            fullName: clerkUser.user.fullName || "",
            imageUrl: clerkUser.user.imageUrl,
            username: clerkUser.user.username || "",
          }
        : null,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mock = useContext(MockAuthContext);
  return {
    isSignedIn: mock.isSignedIn,
    isLoaded: true,
    user: mock.user,
  };
}

export function useAuth() {
  if (HAS_CLERK) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const clerkAuth = useClerkAuth();
    return {
      isSignedIn: clerkAuth.isSignedIn,
      isLoaded: clerkAuth.isLoaded,
      userId: clerkAuth.userId,
      signOut: clerkAuth.signOut,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mock = useContext(MockAuthContext);
  return {
    isSignedIn: mock.isSignedIn,
    isLoaded: true,
    userId: mock.user?.id || null,
    signOut: mock.logout,
  };
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

// Reusable mock-safe auth UI components
export function SignInButton({ children, mode }: { children?: React.ReactNode; mode?: "modal" | "redirect" }) {
  const mock = useContext(MockAuthContext);
  
  if (HAS_CLERK) {
    return <ClerkSignInBtn mode={mode}>{children}</ClerkSignInBtn>;
  }

  return (
    <button onClick={mock.login} className="w-full">
      {children || "Sign In"}
    </button>
  );
}

export function SignUpButton({ children, mode }: { children?: React.ReactNode; mode?: "modal" | "redirect" }) {
  const mock = useContext(MockAuthContext);

  if (HAS_CLERK) {
    return <ClerkSignUpBtn mode={mode}>{children}</ClerkSignUpBtn>;
  }

  return (
    <button onClick={mock.login} className="w-full">
      {children || "Sign Up"}
    </button>
  );
}

export function UserButton() {
  const mock = useContext(MockAuthContext);

  if (HAS_CLERK) {
    return <ClerkUserBtn />;
  }

  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MOCK_USER.imageUrl}
        alt={MOCK_USER.fullName}
        className="w-8 h-8 rounded-full border border-zinc-800"
      />
      <button 
        onClick={mock.logout}
        className="text-xs text-zinc-400 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
