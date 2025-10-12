/**
 * Main dashboard placeholder page.
 * This file renders a simple welcome placeholder while the full SnapMeal AI
 * main application (photo upload, analysis, personalized recommendations,
 * etc.) is being implemented. Replace or extend this page with the actual
 * dashboard UI and functionality when ready.
 *
 * @author Ahmed Hassan
 */
"use client";

export default function MainPage() {
  return (
    <main className="bg-background-light dark:bg-background-dark flex min-h-screen items-center justify-center px-4 py-16 md:px-10 lg:px-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to SnapMeal AI
        </h1>
      </div>
    </main>
  );
}
