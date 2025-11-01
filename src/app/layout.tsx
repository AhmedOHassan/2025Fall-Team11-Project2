/**
 * SnapMeal AI - Root layout component for the application
 * Copyright (C) 2025 Team11-Project2
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
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
import SkipLink from "~/components/SkipLink";

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
          <SkipLink />
          <Header />
          <main id="main">{children}</main>
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
