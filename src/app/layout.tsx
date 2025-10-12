/**
 * This file handles our root layout. So it adds the general layout for each page
 * including everything that we should need app-wide.
 *
 * @author Ahmed Hassan
 */
import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "~/components/header";
import AuthProvider from "~/components/authProvider";

export const metadata: Metadata = {
  title: "SnapMeal AI",
  description: "Photo-based nutritional insights",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body {...({ "cz-shortcut-listen": "true" } as any)}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>

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
