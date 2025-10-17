/**
 * Login page responsible for handling user sign-in.
 * Renders the login form, performs credential-based sign-in using next-auth,
 * displays error messages and redirects to the main dashboard on success.
 *
 * @author Ahmed Hassan
 */
"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      } as any);

      if (!res) {
        setError("Either email or password is incorrect. Please try again.");
        return;
      }

      const anyRes = res as any;
      if (anyRes.error) {
        setError("Either email or password is incorrect. Please try again.");
        return;
      }

      if (anyRes.ok || anyRes.status === 200 || anyRes.url) {
        router.push("/main");
        return;
      }

      setError("Login failed. Either email or password is incorrect.");
    } catch (err) {
      console.error("signIn exception:", err);
      setError("Login error. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-background-light dark:bg-background-dark flex min-h-screen items-center justify-center px-4 py-16 md:px-10 lg:px-20">
      <Card className="-mt-30 w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-3xl">Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Logging in..." : "Login"}
              </Button>

              <div className="mt-3 text-center">
                <Link
                  href="/signup"
                  className="text-muted-foreground text-sm hover:underline"
                >
                  Create account
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
