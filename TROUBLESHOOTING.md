# SnapMealAI Troubleshooting

Concise, step-by-step fixes for common issues in this Next.js + Prisma + NextAuth + OpenAI stack.

---

## Where to check logs

- Next.js server/API logs: the terminal running `npm run dev` (server-side errors and API route logs).
- Prisma logs: printed in dev via `src/server/db.ts` (query, warn, error).
- Browser devtools: network tab for API request/response details.

---

## Diagnostics (quick checks)

```bash
# Node version (must be v20+)
node -v

# Switch to Node 20 with nvm if needed
nvm install 20
nvm use 20

# Ensure DB migrations are applied
npx prisma migrate dev

# API health check (GET)
curl -i http://localhost:3000/api/analyze-meal

# Minimal analyze POST (replace <BASE64> with a real base64-encoded jpg/png)
curl -i -X POST http://localhost:3000/api/analyze-meal \
  -H 'Content-Type: application/json' \
  -d '{
    "imageBase64": "<BASE64>",
    "userPreferences": { "allergies": ["peanut"] }
  }'
```

---

## Environment validation errors (from `@t3-oss/env-nextjs`)

### Symptoms

- Terminal shows messages like:
  - "Invalid environment variables"
  - `DATABASE_URL must be a valid url`
  - Process exits or build fails on `npm run dev` or `npm run build`.

### Likely causes

- Missing `.env` file or required keys.
- `DATABASE_URL` malformed.
- `AUTH_SECRET` missing (especially in production).

### Step-by-step fix

1. Create your env file if missing:
   ```bash
   cp .env.example .env
   ```
2. Set required variables in `.env`:
   - `AUTH_SECRET` (generate below)
   - `DATABASE_URL` (valid PostgreSQL URL)
   - `OPENAI_API_KEY` (from OpenAI dashboard)
3. Generate an auth secret and paste it into `.env`:
   ```bash
   npx auth secret
   ```
4. Restart the dev server:
   ```bash
   npm run dev
   ```

### Verify

- `npm run dev` starts cleanly with no env validation errors.

---

## NextAuth secret missing

### Symptoms

- Logs mention `next-auth` secret issues (e.g., `[NO_SECRET]`).
- 500s from auth routes or login not working.

### Likely causes

- `AUTH_SECRET` is not set in `.env`.

### Step-by-step fix

1. Generate a secret:
   ```bash
   npx auth secret
   ```
2. Add it to `.env` as:
   ```env
   AUTH_SECRET="<copy_pasted_value>"
   ```
3. Restart the server:
   ```bash
   npm run dev
   ```

### Verify

- Attempt sign-in; no secret-related errors appear in server logs.

---

## Database connection/migration errors (Prisma/PostgreSQL)

### Symptoms

- Prisma errors like `P1001: Can't reach database server`.
- Migration errors on `npx prisma migrate dev`.

### Likely causes

- PostgreSQL not running or wrong connection details.
- Schema drift or pending migrations.

### Step-by-step fix

1. Ensure PostgreSQL is running and credentials are correct.
2. Set a valid `DATABASE_URL` in `.env`, e.g.:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/snapmealai"
   ```
3. Apply migrations:
   ```bash
   npx prisma migrate dev
   ```
4. If drift persists and you can lose local data (DESTRUCTIVE):
   ```bash
   npx prisma migrate reset
   # WARNING: This deletes all data in the target database.
   ```
5. Re-run migrations:
   ```bash
   npx prisma migrate dev
   ```

### Verify

- `npx prisma migrate dev` completes successfully; app can connect without Prisma errors.

---

## Node/ESM version issues

### Symptoms

- Errors like `SyntaxError: Cannot use import statement outside a module`.
- Build/runtime failures related to Node features.

### Likely causes

- Running an older Node version.

### Step-by-step fix

1. Check Node version (must be v20+):
   ```bash
   node -v
   ```
2. Switch to Node 20 with nvm:
   ```bash
   nvm install 20
   nvm use 20
   ```
3. Reinstall dependencies if needed:
   ```bash
   rm -rf node_modules package-lock.json && npm install
   ```

### Verify

- `node -v` shows `v20.x`; `npm run dev` runs without ESM errors.

---

## 401 on `/api/analyze-meal` (Authentication required)

### Symptoms

- Response: `401 {"error":"Authentication required"}` when POSTing to `/api/analyze-meal`.

### Likely causes

- User not signed in; NextAuth session missing.

### Step-by-step fix

1. Sign in via the app’s login page.
2. Retry the POST request after a successful session is established.

### Verify

- POST returns 200 with a valid analysis payload.

---

## 400 on `/api/analyze-meal` (Image data is required)

### Symptoms

- Response: `400 {"error":"Image data is required"}`.

### Likely causes

- `imageBase64` missing from request body.

### Step-by-step fix

1. Include a valid base64-encoded image string in `imageBase64`.
2. Ensure JSON payload is correct and `Content-Type: application/json` is set.

### Verify

- POST returns 200 and includes `analysis` in the response.

---

## 429 OpenAI quota exceeded

### Symptoms

- Response: `429 {"error":"OpenAI API quota exceeded. Please check your billing."}`.

### Likely causes

- Reached OpenAI usage limits.

### Step-by-step fix

1. Check OpenAI account billing/usage.
2. Use another API key or wait until quota refresh.

### Verify

- Requests no longer return 429; analysis proceeds.

---

## 500 from OpenAI calls (No/Invalid response)

### Symptoms

- `500 {"error":"No response from OpenAI"}`
- `500 {"error":"Invalid response format from AI"}`
- `500 {"error":"Analysis failed"}` (generic fallback)

### Likely causes

- `OPENAI_API_KEY` missing/invalid.
- Unstable or malformed model output.
- Transient network/model issues.

### Step-by-step fix

1. Ensure `OPENAI_API_KEY` is set in `.env`.
2. Restart the dev server.
3. Try a clear food image and re-submit.
4. Check server logs for the raw model output to identify format issues.

### Verify

- POST returns 200; no OpenAI-related 500s in logs.

---

## Tests failing due to env/DB

### Symptoms

- Tests fail early with env validation or DB connection errors.

### Likely causes

- Missing env vars or unapplied migrations.

### Step-by-step fix

1. Ensure `.env` has at least `AUTH_SECRET`, `DATABASE_URL`, `OPENAI_API_KEY`.
2. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
3. Run tests:
   ```bash
   npm run test
   ```
4. For CI-only scenarios, optionally bypass env validation:
   ```bash
   SKIP_ENV_VALIDATION=1 npm run test
   ```

### Verify

- Tests run and pass locally or fail only on actual assertions (not env/DB setup).

---

## Example API calls

### Health check

```bash
curl -i http://localhost:3000/api/analyze-meal
```

### Minimal analyze POST

```bash
curl -i -X POST http://localhost:3000/api/analyze-meal \
  -H 'Content-Type: application/json' \
  -d '{
    "imageBase64": "<BASE64>",
    "userPreferences": { "allergies": ["peanut"] }
  }'
```

---

## Required environment variables

- `AUTH_SECRET`
- `DATABASE_URL`
- `OPENAI_API_KEY`

Ensure they are present in `.env` and restart the server after changes.
