# SnapMeal AI — User Guide

This guide explains how to use the SnapMeal AI web app (sign up, sign in, upload a meal image, view analysis, profile & sign out).

---

## Quick overview

- Visit the landing page and click "Sign Up" or "Login".
  - Landing page component: [`LandingPage`](src/app/page.tsx)
- Create an account on the Sign Up page or sign in on the Login page.
  - Sign up component: [`SignUpPage`](src/app/signup/page.tsx)
  - Login component: [`LoginPage`](src/app/login/page.tsx)
- After signing in you are redirected to the main dashboard (Home).
  - Dashboard component: [`HomePage`](src/app/home/page.tsx)
- From the top bar you can open the user menu (click your name) to go to "My Profile" or "Sign out".
  - Header component: [`Header`](src/components/header.tsx)
- "My Profile" shows your name/email and allows resetting your password.
  - Profile component: [`ProfilePage`](src/app/profile/page.tsx)

---

## 1) Landing page (Welcome)

What it does:
- Intro and product pitch.
- Links to Sign Up and Login.

![LandingPage](landing.png)

How to use:
1. Click "Sign Up" to create an account, or "Login" if you already have one.
2. Clicking the SnapMeal logo/text (top-left) returns you to this landing page.

---

## 2) Sign Up

What it does:
- Create a new account with Full name, Email, Password.
- Client-side validations:
  - All fields required.
  - Password must be at least 6 characters.

![SingUpPage](signup.png)

How to use:
1. Fill Full name, Email, Password.
2. Click "Create account".
3. On success you will see a confirmation message and a short countdown, then be redirected to Login.
4. If the email already exists you will see an error message.

---

## 3) Login

What it does:
- Sign in with email + password.
- On success redirects to the main dashboard (/home).

![LoginPage](login.png)

How to use:
1. Enter Email and Password.
2. Click "Login".
3. If credentials are valid you'll be taken to the Home dashboard.
4. If there's an error an inline message is shown.

---

## 4) Main Dashboard — Analyze a Meal

What it does:
- Upload or drag & drop an image of a meal.
- Displays analysis: ingredients, nutrition, allergens, portion, alternatives, delivery guidance, warnings, health score.

![AnalysisPageUpload](analysis_upload.png)
![AnalysisPageResult1](analysis_result_1.png)
![AnalysisPageResult2](analysis_result_2.png)

How to use:
1. Click the upload area or drag & drop an image (PNG, JPEG, WEBP, GIF).
2. After selecting, preview appears. Use "Change Image" to pick another file.
3. Click "Analyze Meal".
4. Wait for the AI to process; a loading card and progress indicator are shown.
5. Review results: calories, macros, allergens, dietary tags, portion analysis, alternatives, delivery recommendations.

---

## 5) Profile & Sign out

What it does:
- View account details (name & email).
- Reset password.
- Sign out from the header menu.

![Header](header_name_click.png)
![MyProfilePage](my_profile.png)

How to use:
1. Click your name in the top-right to open the user menu.
2. Click "My Profile" to view account details and access the password reset form.
3. To reset password:
   - Fill current password, new password, confirm new password.
   - New password must be at least 6 characters.
   - Click "Update password".
4. Click "Sign out" in the header menu to log out.

---