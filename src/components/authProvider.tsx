/**
 * Authentication provider wrapper.
 * Wraps application UI with NextAuth's `SessionProvider` so client components
 * can access authentication state (session) via `useSession`.
 * Accepts `children` to render inside the provider and an optional `session`
 * object to hydrate the session on the client.
 *
 * @author Ahmed Hassan
 */
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

type Props = {
  children: React.ReactNode;
  session?: unknown;
};

export default function AuthProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
