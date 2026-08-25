# Acquisitions API

A Node.js REST API backend for the Acquisitions application, built with Express v5, Neon Postgres, and Drizzle ORM.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js (ESM) | JavaScript execution |
| Framework | Express v5 | HTTP routing & middleware |
| Database | Neon Postgres (serverless) | Persistent storage |
| ORM | Drizzle ORM | Type-safe SQL queries & migrations |
| Auth | jsonwebtoken + bcrypt | JWT tokens + password hashing |
| Validation | Zod v4 | Request body schema validation |
| Logging | Winston + Morgan | App logging + HTTP request logging |
| Security | Helmet, CORS, cookie-parser | Security headers, cross-origin, cookies |
| Dev | ESLint v10 + Prettier | Code quality + formatting |

## Architecture

Classic layered architecture:

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                        │
└─────────────────┬───────────────────────────────┘
                  │ HTTP Request
┌─────────────────▼───────────────────────────────┐
│  ROUTES  (src/routes/)          — URL → Handler │
├─────────────────────────────────────────────────┤
│  CONTROLLERS  (src/controllers/) — req/res     │
├─────────────────────────────────────────────────┤
│  SERVICES  (src/services/)       — Business    │
├─────────────────────────────────────────────────┤
│  MODELS  (src/models/)           — DB Schema   │
├─────────────────────────────────────────────────┤
│  Neon PostgreSQL (Drizzle ORM)                  │
└─────────────────────────────────────────────────┘
```

Supporting layers: Validations (Zod schemas), Utils (JWT, cookies, formatting), Config (DB connection, logger).

## Project Structure

```
src/
├── index.js              # Entry point — loads dotenv, starts server
├── server.js             # HTTP server bootstrap — app.listen(PORT)
├── app.js                # Express app setup — middleware, routes, health checks
├── config/
│   ├── database.js       # Neon + Drizzle connection singleton
│   └── logger.js         # Winston logger (file + console transports)
├── controllers/
│   └── auth.controller.js   # Auth request handlers
├── models/
│   └── user.model.js        # Drizzle ORM schema for users table
├── routes/
│   └── auth.routes.js       # Auth route definitions
├── services/
│   └── auth.service.js      # Auth business logic (createUser, hashPassword)
├── utils/
│   ├── cookies.js           # Cookie set/get/clear helpers
│   ├── format.js            # Zod error formatter
│   └── jwt.js               # JWT sign/verify helper
├── validations/
│   └── auth.validation.js   # Zod schemas (signup, signin)
└── middleware/               # Empty — no middleware implemented yet
```

## Getting Started

### Prerequisites

- Node.js 18+ (for `--watch` flag)
- A Neon Postgres database

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   Required variables:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `JWT_SECRET` — Secret key for signing JWT tokens
   - `PORT` — Server port (default: 3000)
   - `NODE_ENV` — `development` or `production`
   - `LOG_LEVEL` — Winston log level (default: `info`)

3. Run database migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

### Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `node --watch src/index.js` | Start dev server with file watching |
| `lint` | `eslint .` | Run ESLint |
| `lint:fix` | `eslint . --fix` | Run ESLint with auto-fix |
| `format` | `prettier --write .` | Format all files with Prettier |
| `format-check` | `prettier --check .` | Check formatting without writing |
| `db:generate` | `drizzle-kit generate` | Generate migration SQL from schema changes |
| `db:migrate` | `drizzle-kit migrate` | Run pending migrations |
| `db:studio` | `drizzle-kit studio` | Open Drizzle Studio (visual DB browser) |

## API Endpoints

### Health & Info

| Method | Path | Description |
|---|---|---|
| GET | `/` | Home — returns "Hello from Acquisitions!" |
| GET | `/health` | Health check — returns `{ status, timestamp, uptime }` |
| GET | `/api` | API info — returns `{ message, version, timestamp }` |

### Authentication

| Method | Path | Description | Status |
|---|---|---|---|
| POST | `/api/auth/sign-up` | Register a new user | Implemented |
| POST | `/api/auth/sign-in` | Sign in | Stub |
| POST | `/api/auth/sign-out` | Sign out | Stub |

#### POST /api/auth/sign-up

**Request body:**
```json
{
  "name": "string (2-255 chars)",
  "email": "string (valid email, max 255 chars)",
  "password": "string (6-128 chars)",
  "role": "user | admin (default: user)"
}
```

**Response (201):**
```json
{
  "message": "User Registered",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error responses:**
- `400` — Validation failed
- `409` — Email already exists

## Data Flow — Signup Request

```
POST /api/auth/sign-up
│
├─ Middleware (helmet → cors → json parser → cookie parser → morgan)
│
├─ Route match → auth.controller.js: signup
│
├─ Zod validation (signupSchema.safeParse)
│  ├─ Fail → 400 { error: "Validation Failed" }
│  └─ Pass ↓
│
├─ auth.service.js: createUser
│  ├─ Duplicate email check → 409 if exists
│  ├─ bcrypt.hash(password, 10)
│  ├─ INSERT INTO users RETURNING (id, name, email, role, created_at)
│  └─ Return user object
│
├─ jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '15m' })
│
├─ Set httpOnly cookie (token=<jwt>, 15min maxAge)
│
└─ 201 { message, user }
```

## Database Schema

### `users` table

| Column | Type | Constraints |
|---|---|---|
| `id` | serial | PRIMARY KEY |
| `name` | varchar(255) | NOT NULL |
| `email` | varchar(255) | NOT NULL, UNIQUE |
| `password` | varchar(255) | NOT NULL (bcrypt hash) |
| `role` | varchar(50) | NOT NULL, DEFAULT 'user' |
| `created_at` | timestamp | NOT NULL, DEFAULT now() |
| `updated_at` | timestamp | NOT NULL, DEFAULT now() |

## Coding Standards

- **Indentation:** 2 spaces
- **Quotes:** Single quotes
- **Semicolons:** Yes
- **Trailing commas:** ES5
- **Print width:** 80 chars
- **Line endings:** LF
- **Module system:** ESM (`"type": "module"`)
- **Import aliases:** Subpath imports (`#config/*`, `#controllers/*`, etc.)
