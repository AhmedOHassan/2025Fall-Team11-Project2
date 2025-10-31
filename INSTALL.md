# SnapMealAI Installation Guide

This document explains how to install and run **SnapMealAI** locally.

---

## ⚙️ Prerequisites

Before starting, ensure the following are installed on your system:
- **Node.js** (v20 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (for database storage)

---

## 💻 Install Node.js

SnapMealAI is built using Node.js, which is required to run the backend and frontend.

If you don’t have Node.js installed yet, please download and install it by following the official instructions here:  
👉 [https://nodejs.org/en/download](https://nodejs.org/en/download)

After installation, verify Node.js and npm are installed by running:

```bash
node -v
npm -v
```

If both commands return version numbers, Node.js and npm are ready to use.

---

## 🐘 Install PostgreSQL

SnapMealAI uses PostgreSQL as its database.

If you don’t have PostgreSQL installed yet, follow the official download and installation instructions here:  
👉 [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

Once installed:
- Make sure PostgreSQL is running locally.
- Note your **username**, **password**, and **port** (default: `5432`).

---

## 💾 Clone and Setup the Project

```bash
# Clone the repository
git clone https://github.com/AhmedOHassan/2025Fall-Team11-Project2.git
cd 2025Fall-Team11-Project2
```

---

## 📦 Install Dependencies

```bash
npm install
```

---

## 🔐 Configure Environment Variables

```bash
cp .env.example .env
```

---

## 🤖 Add OpenAI API Key

SnapMealAI uses the OpenAI/GPT API. Create an API key at:
https://platform.openai.com/account/api-keys

Then in your `.env` file, update the OpenAI API key:

```env
OPENAI_API_KEY=""
```

---

## 🔑 Generate Authentication Secret

Run:
```bash
npx auth secret
```

A `.env.local` file will be created in the project directory (2025Fall-Team11-Project2). It will contain a generated `AUTH_SECRET` value. Copy the `AUTH_SECRET` from `.env.local` and paste it into your `.env` file under `AUTH_SECRET`.

---

## 🗄️ Configure Database Connection

In your `.env` file, update the connection string:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/2025Fall-Team11-Project2"
```

Replace `password` with your actual PostgreSQL password.

---

## 🧱 Run Prisma Migrations

```bash
npx prisma migrate dev
```

This will create all the necessary tables in your PostgreSQL database.

---

## 🚀 Start the Development Server

```bash
npm run dev
```

The app should now be accessible at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧪 Run Tests

```bash
# Run unit and integration tests
npm run test

# Run coverage
npm run coverage
```
