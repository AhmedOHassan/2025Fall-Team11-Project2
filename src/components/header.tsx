/**
 * Header component responsible for rendering the top navigation and user menu.
 * Shows the site brand, a center navigation (visible on md+ when authenticated),
 * and the user dropdown (which contains small-screen nav items, profile and sign-out).
 * Handles outside clicks and Escape key to close the dropdown for a better UX.
 *
 * @author Ahmed Hassan
 */
"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/home";

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const el = wrapperRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="border-primary/20 dark:border-primary/30 w-full border-b">
      <div className="flex items-center justify-between px-4 py-4 md:px-10 lg:px-20">
        <Link
          href="/"
          className="flex items-center gap-3 text-gray-900 hover:opacity-90 dark:text-white"
          aria-label="Go to home"
        >
          <svg className="text-primary h-6 w-6" viewBox="0 0 48 48" fill="none">
            <path
              d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-semibold">SnapMeal AI</span>
        </Link>

        {/* show navigation only when user is logged in; visible on md+ */}
        {session?.user && (
          <nav className="mx-auto hidden items-center gap-6 text-sm md:flex">
            <a
              href="/home"
              className={`hover:text-primary transition-colors ${
                isHome
                  ? "font-semibold text-green-600"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              Home
            </a>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ) : session?.user ? (
            <div className="relative" ref={wrapperRef}>
              <button
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1 text-sm font-medium hover:bg-white/10"
                onClick={() => setIsOpen((v) => !v)}
                type="button"
              >
                <span className="max-w-[10rem] truncate">
                  {session.user.name ?? session.user.email}
                </span>
                <svg
                  className={`h-4 w-4 origin-center transform transition-transform duration-150 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <div
                className={`absolute right-0 z-50 mt-2 w-48 rounded-md bg-white shadow-lg dark:bg-[#0b0b0b] ${
                  isOpen ? "" : "hidden"
                }`}
              >
                {/* small-screen nav: visible only on small screens (md:hidden) */}
                <div className="py-2 md:hidden">
                  <a
                    href="/home"
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#101010] ${
                      isHome
                        ? "font-semibold text-green-600"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Home
                  </a>
                  <div className="my-1 border-t border-gray-100 dark:border-[#101010]" />
                </div>

                <ul className="py-1">
                  <li>
                    <Link
                      href="/profile"
                      className="block cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#101010]"
                      onClick={() => setIsOpen(false)}
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-[#101010]"
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/signup"
                className="bg-primary inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-gray-900 transition-transform hover:scale-105 dark:text-white"
              >
                Sign Up
              </Link>

              <Link
                href="/login"
                className="bg-primary/20 inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-gray-900 transition-transform hover:scale-105 dark:text-white"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
