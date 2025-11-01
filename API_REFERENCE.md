# SnapMealAI - Complete Software Reference Guide

**Version**: 0.1.0  
**Last Updated**: November 1, 2025

This comprehensive guide documents all commands, functions, API endpoints, configuration options, and features available in SnapMealAI.

---

## Table of Contents

1. [Quick Start Commands](#quick-start-commands)
2. [NPM Scripts Reference](#npm-scripts-reference)
3. [API Endpoints](#api-endpoints)
4. [Database Schema & Commands](#database-schema--commands)
5. [Environment Variables](#environment-variables)
6. [Authentication System](#authentication-system)
7. [Frontend Components](#frontend-components)
8. [Configuration Files](#configuration-files)
9. [Testing Framework](#testing-framework)
10. [Development Tools](#development-tools)
11. [Deployment Options](#deployment-options)
12. [Troubleshooting](#troubleshooting)

---

## Quick Start Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Generate authentication secret
npx auth secret

# Setup database
npm run db:generate

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## NPM Scripts Reference

### Development Scripts
| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev` | Start development server with Turbopack | Primary development command |
| `npm run build` | Build application for production | Pre-deployment step |
| `npm run start` | Start production server | After `npm run build` |
| `npm run preview` | Build and start production server | Combined build + start |

### Code Quality Scripts
| Command | Description | Options |
|---------|-------------|---------|
| `npm run lint` | Run ESLint on codebase | Identifies code issues |
| `npm run lint:fix` | Run ESLint with auto-fix | Automatically fixes issues |
| `npm run check` | Run linting + TypeScript check | Combined quality check |
| `npm run typecheck` | TypeScript type checking only | Validates types |
| `npm run format:check` | Check code formatting with Prettier | Validates formatting |
| `npm run format:write` | Auto-format code with Prettier | Fixes formatting |

### Database Scripts
| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run db:generate` | Run Prisma migrations in development | After schema changes |
| `npm run db:migrate` | Deploy migrations to production | Production deployments |
| `npm run db:push` | Push schema changes without migrations | Development only |
| `npm run db:studio` | Open Prisma Studio (database GUI) | Database inspection |
| `npm run postinstall` | Generate Prisma client (auto-runs) | After `npm install` |

### Testing Scripts
| Command | Description | Coverage |
|---------|-------------|----------|
| `npm test` | Run all tests in watch mode | Interactive testing |
| `npm run test:ui` | Run tests with UI interface | Visual test runner |
| `npm run coverage` | Generate test coverage report | Full coverage analysis |

---

## API Endpoints

### Authentication Endpoints

#### `POST /api/signup`
**Purpose**: Create new user account  
**Request Body**:
```json
{
  "name": "Full Name",
  "email": "user@example.com",
  "password": "minimum6chars"
}
```
**Responses**:
- `201` - Success: `{"ok": true, "userId": "user-id"}`
- `400` - Missing fields: `{"error": "Missing fields"}`
- `409` - User exists: `{"error": "User exists"}`

**Validation Rules**:
- All fields required
- Password minimum 6 characters
- Email must be unique

#### `GET/POST /api/auth/[...nextauth]`
**Purpose**: NextAuth.js authentication handlers  
**Methods**: Handles login, logout, session management  
**Provider**: Credentials (email/password)

#### `POST /api/reset-password`
**Purpose**: Reset authenticated user's password  
**Authentication**: Required (session-based)  
**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```
**Responses**:
- `200` - Success: `{"ok": true}`
- `401` - Not authenticated: `{"error": "Authentication required"}`
- `400` - Missing/invalid fields: `{"error": "Missing fields"}`
- `403` - Wrong current password: `{"error": "Current password incorrect"}`

### Meal Analysis Endpoint

#### `GET /api/analyze-meal`
**Purpose**: Health check for meal analysis API  
**Response**: `{"status": "ok", "message": "Meal analysis API is running", "timestamp": "ISO-string"}`

#### `POST /api/analyze-meal`
**Purpose**: Analyze meal images using OpenAI GPT-4 Vision  
**Authentication**: Required  
**Request Body**:
```json
{
  "imageBase64": "base64-encoded-image-data",
  "userPreferences": {
    "allergies": ["peanut", "shellfish"]
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "timestamp": "2025-11-01T12:00:00.000Z",
  "analysis": {
    "ingredients": ["rice", "chicken", "vegetables"],
    "nutrition": {
      "calories": 450,
      "protein": "25g",
      "carbs": "35g",
      "fat": "12g",
      "fiber": "4g"
    },
    "allergens": ["soy sauce"],
    "dietary_tags": ["gluten-free", "high-protein"],
    "healthScore": 7,
    "alternatives": ["grilled chicken salad", "brown rice bowl"],
    "portion_analysis": "moderate serving size",
    "confidence": 0.85,
    "warnings": ["⚠️ ALLERGEN ALERT: Contains soy"],
    "delivery_recommendation": "Pack rice separately to avoid sogginess",
    "delivery_options": [
      {
        "platform": "UberEats",
        "eta_minutes": 25,
        "cost_estimate": "$8-12"
      }
    ]
  }
}
```

**Error Responses**:
- `401` - Authentication required
- `400` - Image data required
- `429` - OpenAI quota exceeded
- `500` - Analysis failed or invalid AI response

**Supported Image Formats**: PNG, JPEG, WEBP, GIF  
**Max Tokens**: 1500  
**AI Model**: GPT-4o with vision capabilities

---

## Database Schema & Commands

### Database Models

#### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // bcrypt hashed, 10 rounds
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
}
```

#### Session Management (NextAuth)
```prisma
model Account {
  id                       String  @id @default(cuid())
  userId                   String
  type                     String
  provider                 String
  providerAccountId        String
  // ... additional OAuth fields
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Prisma Commands

#### Development Commands
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply new migration
npx prisma migrate dev --name descriptive-name

# Reset database (DESTRUCTIVE)
npx prisma migrate reset

# Push schema changes without migration
npx prisma db push

# Open database browser
npx prisma studio
```

#### Production Commands
```bash
# Apply pending migrations
npx prisma migrate deploy

# Generate production client
npx prisma generate
```

#### Database Inspection
```bash
# View current database status
npx prisma migrate status

# Introspect existing database
npx prisma db pull

# Validate schema
npx prisma validate
```

---

## Environment Variables

### Required Variables

#### Authentication
```bash
# NextAuth.js secret (generate with: npx auth secret)
AUTH_SECRET="your-secret-key"

# Application URL (development/production)
NEXTAUTH_URL="http://localhost:3000"
```

#### Database
```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database"
```

#### External APIs
```bash
# OpenAI API key for meal analysis
OPENAI_API_KEY="sk-your-openai-api-key"
```

#### Optional Variables
```bash
# Skip environment validation (Docker builds)
SKIP_ENV_VALIDATION="true"

# Node environment
NODE_ENV="development" # development | test | production
```

### Environment Validation

Environment variables are validated using Zod schemas in `src/env.js`:

```javascript
// Server-side variables (secure)
server: {
  AUTH_SECRET: z.string(),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"])
}

// Client-side variables (publicly accessible)
client: {
  // NEXT_PUBLIC_* variables go here
}
```

---

## Authentication System

### NextAuth.js Configuration

#### Session Strategy
- **Type**: JWT (JSON Web Tokens)
- **Duration**: 30 days
- **Provider**: Credentials (email/password)

#### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Minimum Length**: 6 characters
- **Storage**: Hashed in database

#### Session Management
```typescript
// Get current session
import { auth } from "~/server/auth";
const session = await auth();

// Sign in/out
import { signIn, signOut } from "~/server/auth";
await signIn("credentials", { email, password });
await signOut();
```

#### Protected Routes
```typescript
// API route protection
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}
```

---

## Frontend Components

### Page Components

#### Landing Page (`/`)
- **File**: `src/app/page.tsx`
- **Purpose**: Marketing page with sign-up/login links
- **Features**: Product overview, call-to-action buttons

#### Authentication Pages
- **Sign Up**: `src/app/signup/page.tsx`
  - Form validation (client-side)
  - Auto-redirect after success
  - Error handling for duplicate emails
- **Login**: `src/app/login/page.tsx`
  - NextAuth.js integration
  - Form validation
  - Redirect to dashboard on success

#### Main Dashboard (`/home`)
- **File**: `src/app/home/page.tsx`
- **Features**:
  - Image upload (drag & drop or click)
  - File validation (PNG, JPEG, WEBP, GIF)
  - Real-time analysis with progress indicator
  - Comprehensive results display

#### Profile Page (`/profile`)
- **File**: `src/app/profile/page.tsx`
- **Features**: Account info, password reset form

### UI Components (shadcn/ui)

#### Form Components
```typescript
// Basic form elements
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

// Advanced components
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Alert, AlertDialog } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { Select, SelectContent, SelectItem } from "~/components/ui/select";
```

#### Layout Components
```typescript
// Navigation and layout
import { Header } from "~/components/header";
import { SkipLink } from "~/components/SkipLink";
import { AuthProvider } from "~/components/authProvider";
```

### Custom Hooks

#### Mobile Detection
```typescript
// File: src/hooks/use-mobile.ts
import { useMobile } from "~/hooks/use-mobile";

function Component() {
  const isMobile = useMobile();
  return <div>{isMobile ? "Mobile" : "Desktop"}</div>;
}
```

---

## Configuration Files

### Next.js Configuration

#### `next.config.js`
```javascript
/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true, // ESLint run separately
  },
  // Additional Next.js options...
};
```

#### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

### Styling Configuration

#### Tailwind CSS (`tailwind.config.js`)
- **Framework**: Tailwind CSS v4.0.15
- **Plugin**: `prettier-plugin-tailwindcss`
- **Animation**: `tw-animate-css`

#### PostCSS (`postcss.config.js`)
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### Code Quality Configuration

#### ESLint (`eslint.config.js`)
```javascript
// TypeScript ESLint configuration
// Next.js ESLint rules
// Custom project rules
```

#### Prettier (`prettier.config.js`)
```javascript
/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  // Formatting rules...
};
```

---

## Testing Framework

### Vitest Configuration

#### Test Runner Setup (`vitest.config.ts`)
```typescript
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov", "html"],
      include: ["src/app/**"],
    },
  },
});
```

### Testing Commands

#### Running Tests
```bash
# Watch mode (development)
npm test

# Single run with coverage
npm run coverage

# UI mode (visual test runner)
npm run test:ui
```

### Test Structure

#### API Route Tests
- **Location**: `src/app/api/**/*.test.tsx`
- **Coverage**: Authentication, validation, error handling
- **Mocking**: Database, external APIs, authentication

#### Component Tests
- **Location**: `src/app/**/*.test.tsx`
- **Coverage**: User interactions, form validation, rendering
- **Tools**: `@testing-library/react`, `@testing-library/user-event`

#### Example Test Structure
```typescript
describe("API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle success case", async () => {
    // Test implementation
  });

  it("should handle error case", async () => {
    // Test implementation
  });
});
```

---

## Development Tools

### Code Quality Tools

#### ESLint Rules
- **Config**: `@eslint/eslintrc`
- **TypeScript**: `typescript-eslint`
- **Next.js**: `eslint-config-next`

#### TypeScript
- **Version**: 5.8.2
- **Strict Mode**: Enabled
- **Path Mapping**: `~/*` → `./src/*`

#### Prettier Formatting
- **Plugin**: `prettier-plugin-tailwindcss`
- **Auto-format**: On save (recommended)

### Development Server

#### Next.js Dev Server
```bash
# Start with Turbopack (faster builds)
npm run dev

# Access at: http://localhost:3000
```

#### Features
- **Hot Reload**: Automatic page refresh
- **Fast Refresh**: React component updates
- **Error Overlay**: Development error display
- **TypeScript**: Real-time type checking

---

## Deployment Options

### Vercel Deployment (Recommended)

#### Automatic Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Required Environment Variables
```bash
AUTH_SECRET="production-secret"
DATABASE_URL="postgresql://user:pass@host:port/db"
OPENAI_API_KEY="sk-production-key"
NEXTAUTH_URL="https://yourdomain.com"
```

### Manual Deployment

#### Build Process
```bash
# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

#### Database Setup
```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npx prisma generate
```

### Docker Deployment

#### Environment Variables
```bash
# Skip validation in Docker builds
SKIP_ENV_VALIDATION=true
```

---

## Troubleshooting

### Common Issues

#### Database Connection
**Problem**: `PrismaClientInitializationError`  
**Solution**: 
```bash
# Check DATABASE_URL format
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Test connection
npx prisma db pull
```

#### Authentication Errors
**Problem**: `NextAuthSessionError`  
**Solution**:
```bash
# Regenerate AUTH_SECRET
npx auth secret

# Check NEXTAUTH_URL matches your domain
NEXTAUTH_URL="http://localhost:3000"
```

#### OpenAI API Issues
**Problem**: `insufficient_quota`  
**Solution**: Check OpenAI account billing and usage limits

#### Build Errors
**Problem**: TypeScript or ESLint errors  
**Solution**:
```bash
# Type check
npm run typecheck

# Fix linting issues
npm run lint:fix
```

### Debugging Commands

#### Environment Validation
```bash
# Check environment variables
node -e "console.log(process.env)"

# Skip validation (temporary)
SKIP_ENV_VALIDATION=true npm run build
```

#### Database Debugging
```bash
# Check migration status
npx prisma migrate status

# View database in browser
npx prisma studio

# Reset database (DESTRUCTIVE)
npx prisma migrate reset
```

#### Log Analysis
- **Development**: Check browser console and terminal
- **Production**: Check Vercel function logs
- **Database**: Enable Prisma query logging in development

---

## Additional Resources

### Documentation Links
- [Installation Guide](INSTALL.md)
- [User Guide](USER_GUIDE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Support Channels
- **Email**: snapmealai@gmail.com
- **Issues**: [GitHub Issues](https://github.com/AhmedOHassan/2025Fall-Team11-Project2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AhmedOHassan/2025Fall-Team11-Project2/discussions)

---

## Version History

- **v0.1.0** (November 2025): Initial release with meal analysis, authentication, and profile management
- Future versions will include meal history, dietary preferences, and enhanced AI analysis

---

*This documentation is maintained by Team 11 and updated with each release. For the most current information, always refer to the latest version in the repository.*