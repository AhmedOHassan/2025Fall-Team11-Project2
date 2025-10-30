"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  if (status === "loading") {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">Loading profile…</div>
      </main>
    );
  }

  const user = session?.user;

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMsg({ type: "error", text: "All fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({
          type: "error",
          text: body?.error || "Failed to reset password.",
        });
        return;
      }

      setMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("reset password error:", err);
      setMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your account details and manage your password.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label className="font-semibold">Full name:</Label>
              <div className="mt-2 text-sm">{user?.name ?? "—"}</div>
            </div>

            <div>
              <Label className="font-semibold">Email:</Label>
              <div className="mt-2 text-sm">{user?.email ?? "—"}</div>
            </div>

            <div className="mt-30 flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/home");
                }}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>

          <CardContent>
            {msg && (
              <Alert
                className={`mb-4 ${
                  msg.type === "error"
                    ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                    : "border-green-200 bg-green-50 dark:bg-green-900/20"
                }`}
              >
                <AlertDescription>{msg.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="current">Current password</Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="new">New password</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div className="flex justify-center">
                <Button type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Update password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
