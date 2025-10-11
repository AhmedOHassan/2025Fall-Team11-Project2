import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SnapMeal AI",
  description: "Photo-based nutritional insights",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <header className="border-primary/20 dark:border-primary/30 w-full border-b">
          <div className="flex items-center justify-between px-4 py-4 md:px-10 lg:px-20">
            <Link
              href="/"
              className="flex items-center gap-3 text-gray-900 hover:opacity-90 dark:text-white"
              aria-label="Go to home"
            >
              <svg
                className="text-primary h-6 w-6"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                  fill="currentColor"
                ></path>
              </svg>

              <span className="font-semibold">SnapMeal AI</span>
            </Link>

            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-primary/20 dark:border-primary/30 mt-12 border-t">
          <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="text-center">
              © 2025 SnapMeal AI. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
