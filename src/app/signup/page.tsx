/**
 * Signup page responsible for handling new user registration.
 * Renders the signup form, validates input (including password length > 6),
 * posts to the signup API, displays errors, and redirects to the login page
 * on successful account creation (with a short countdown).
 *
 * @author Ahmed Hassan
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (success) {
      setCountdown(3);
      intervalRef.current = window.setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [success]);

  useEffect(() => {
    if (success && countdown <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      countdownRef.current = window.setTimeout(() => {
        router.push("/login");
      }, 250);
    }
  }, [countdown, success, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("Name, Email, and password are required.");
      return;
    }

    // Password minimum length rule
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.status === 201) {
        setSuccess(true);
        return;
      }

      // Duplicate user
      if (res.status === 409) {
        setError("User already exists with this email.");
        return;
      }

      const body = await res.json().catch(() => ({}));
      setError(body?.error || "Signup failed.");
    } catch (err) {
      setError("Signup error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-background-light dark:bg-background-dark flex min-h-screen items-center justify-center px-4 py-16 md:px-10 lg:px-20">
      <Card className="-mt-30 w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-3xl">Create account</CardTitle>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
                Account created successfully. Redirecting to the login page in{" "}
                <strong>{Math.max(0, countdown)}</strong> second
                {countdown === 1 ? "" : "s"}…
              </div>

              <div className="text-center">
                <Button
                  onClick={() => {
                    router.push("/login");
                  }}
                >
                  Go to Login now
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

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
                  {busy ? "Creating..." : "Create account"}
                </Button>

                <div className="mt-3 text-center">
                  <Link
                    href="/login"
                    className="text-muted-foreground text-sm hover:underline"
                  >
                    Already have an account?
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
