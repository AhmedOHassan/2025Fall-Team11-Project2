/**
 * SnapMeal AI - Home page component for the application
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
 * Home page for the application. Renders the hero section, "How It Works" steps,
 * and benefit cards for customers, restaurants/platforms, and healthcare partners.
 *
 * This file provides the landing content users see at the root route.
 *
 * @author Ahmed Hassan
 */
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      <div className="w-full px-4 py-16 md:px-10 lg:px-20">
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <div className="relative h-[520px] w-full">
            <Image
              src="/hero.png"
              alt="Hero background"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Gradient overlay + content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/60 via-black/40 to-black/30 p-12 text-center text-white backdrop-blur-sm">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                Your Meal, Decoded. Your Health, Empowered.
              </h1>
              <p className="mt-4 text-sm text-gray-200 md:text-base">
                SnapMeal AI revolutionizes your relationship with food. Simply
                snap a photo to instantly identify ingredients, estimate
                nutrition and allergens, and get personalized meal
                recommendations that fit your lifestyle. Make informed food
                choices, effortlessly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold md:text-4xl">
          How It Works
        </h2>
        <p className="text-muted-foreground text-md mx-auto mt-3 max-w-2xl text-center">
          Transform your meal discovery in three simple steps with our powerful
          AI.
        </p>

        <div className="mt-12 grid grid-cols-1 items-start gap-12 md:grid-cols-3">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center gap-4">
            <div className="bg-primary border-background-light dark:border-background-dark flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-bold text-gray-900">
              1
            </div>
            <h3 className="mt-2 text-lg font-semibold">Snap &amp; Analyze</h3>
            <p className="text-muted-foreground text-md max-w-xs text-center">
              Upload a photo of any dish. Our AI instantly identifies
              ingredients and estimates nutritional information, including
              calories and potential allergens.
            </p>
            <svg
              className="text-primary absolute top-6 right-[-3.5rem] hidden h-6 w-24 md:block"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 100 24"
              aria-hidden
            >
              <path
                d="M0 12h90l-10 -10m10 10l-10 10"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center gap-4">
            <div className="bg-primary border-background-light dark:border-background-dark flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-bold text-gray-900">
              2
            </div>
            <h3 className="mt-2 text-lg font-semibold">
              Get Personalized Insights
            </h3>
            <p className="text-muted-foreground text-md max-w-xs text-center">
              The AI suggests if the meal fits your dietary goals and health
              profile, offering a simple 'Good Fit' or 'Consider Alternatives'
              badge.
            </p>
            <svg
              className="text-primary absolute top-6 right-[-3.5rem] hidden h-6 w-24 md:block"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 100 24"
              aria-hidden
            >
              <path
                d="M0 12h90l-10 -10m10 10l-10 10"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-primary border-background-light dark:border-background-dark flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-bold text-gray-900">
              3
            </div>
            <h3 className="mt-2 text-lg font-semibold">Discover &amp; Order</h3>
            <p className="text-muted-foreground text-md max-w-xs text-center">
              Discover healthier menu options and get practical delivery
              guidance, suggested platforms, estimated ETA/cost, packaging and
              reheating tips, so you can choose pickup or delivery with
              confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits for Everyone */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold md:text-4xl">
          Benefits for Everyone
        </h2>
        <p className="text-muted-foreground text-md mx-auto mt-3 max-w-2xl text-center">
          SnapMeal AI is designed to create value for every stakeholder in the
          food ecosystem.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-col items-start gap-3">
              <div className="text-primary">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <CardTitle>For Customers</CardTitle>
            </CardHeader>
            <CardContent>
              Make healthier choices with ease, manage dietary restrictions, and
              discover new, suitable meals from local restaurants.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col items-start gap-3">
              <div className="text-primary">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-1 4h.01M9 11h.01M12 11h.01M15 11h.01M9 14h.01M12 14h.01M15 14h.01"
                  />
                </svg>
              </div>
              <CardTitle>For Restaurants &amp; Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              Gain insights into customer preferences, promote healthier menu
              items, and attract a health-conscious customer base.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col items-start gap-3">
              <div className="text-primary">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="4"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                  />
                  <path
                    d="M12 8v8M8 12h8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="currentColor"
                  />
                </svg>
              </div>
              <CardTitle>For Healthcare Partners</CardTitle>
            </CardHeader>
            <CardContent>
              Leverage anonymized data to understand dietary trends, support
              patient nutrition plans, and promote public health initiatives.
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
