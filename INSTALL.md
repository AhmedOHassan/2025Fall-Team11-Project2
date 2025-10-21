# SnapMealAI Installation Guide

This document explains how to install and run **SnapMealAI** locally.

---

## ⚙️ Prerequisites

Before starting, ensure the following are installed on your system:
- **Node.js** (v20 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (for database storage)
- (Optional) **Docker** (for containerized setup)

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

SnapMealAI uses PostgreSQL as its main database.
You can either install it locally or run it in Docker depending on your preference.

### Option 1: Run PostgreSQL with Docker

If you have Docker installed, you can quickly start a PostgreSQL container:

1. Copy the provided `docker-compose.yml` file to your project root.
2. Start the container:
	```bash
	docker-compose up -d
	```
3. The database will be available at `localhost:5432` with:
	- **username:** devuser
	- **password:** devpass
	- **database:** devdb

### Option 2: Install PostgreSQL Locally

If you prefer a local installation, follow the official instructions:  
👉 [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

After installation:
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

## 📦 Install Dependencies (or Run Full Setup)

You can install dependencies manually:
```bash
npm install
```

Or, to automate the entire setup (install dependencies, copy env, generate secret, run migrations), use the provided npm script:
```bash
npm run setup
```
This will:
- Install dependencies
- Copy `.env.example` to `.env`
- Generate an authentication secret
- Run Prisma migrations

---

## 🔐 Configure Environment Variables

```bash
cp .env.example .env
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

If you are using Docker:
```env
DATABASE_URL="postgresql://devuser:devpass@localhost:5432/devdb"
```

If you are not using Docker:
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
