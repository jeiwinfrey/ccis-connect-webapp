# CCIS Connect

Equipment borrowing and room reservation system for CCIS.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL (hosted on Railway) with Drizzle ORM
- **UI**: Tailwind CSS, shadcn/ui
- **Authentication**: Session-based with cookies

## Prerequisites

- Node.js 18+
- npm or yarn
- Access to the shared Railway PostgreSQL database (ask a teammate for the `.env.local` file)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and add the Railway database URL:

```env
DATABASE_URL=postgresql://postgres:<password>@<public-host>:<port>/railway
```

> Ask a teammate for the actual `.env.local` values. Do NOT commit this file to Git.

### 3. Run Migrations

Apply the database schema to the Railway PostgreSQL instance:

```bash
npm run db:migrate
```

### 4. Seed Test Data

Populate the database with test users, rooms, and equipment:

```bash
npm run db:seed
```

This creates:

**Test Users:**
| Role | Username | Password |
|------|----------|----------|
| Student | `23-14000` | `23-14000` |
| Student | `23-14001` | `23-14001` |
| Faculty | `fac-01` | `fac-01` |
| Faculty | `fac-02` | `fac-02` |
| Admin | `admin` | `admin` |

**Sample Rooms:**
- CCIS-301 (1st Floor, Lecture, capacity 20)
- CCIS-302 (2nd Floor, Lab Room, capacity 8)
- Both available Monday–Friday, 8 AM – 5 PM

**Sample Equipment:**
- Cameras category → Sony A7 IV (unit: `CAM-A7IV-01`)
- Laptops category → MacBook Pro M3 (unit: `MBP-M3-01`)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Database Management

### Drizzle Studio (Visual DB GUI)

```bash
npm run db:studio
```

Then open [https://local.drizzle.studio](https://local.drizzle.studio) in your browser.

### Available Database Scripts

```bash
# Run existing migration files (use this for production/shared DB)
npm run db:migrate

# Push schema directly to DB (use only for local experimentation)
npm run db:push

# Generate new migration files from schema changes
npm run db:generate

# Seed the database with test data
npm run db:seed

# Open Drizzle Studio
npm run db:studio
```

> **migrate vs push:**
> - Use `db:migrate` when working with the shared Railway database — it runs versioned SQL files safely.
> - Use `db:push` only for quick local prototyping — it skips migration files and can cause data loss.

---

## Railway PostgreSQL Setup (For Reference)

The project uses a shared PostgreSQL database hosted on [Railway](https://railway.app).

### Connecting Locally

The internal Railway host (`postgres.railway.internal`) only works inside Railway's servers. To connect from your local machine:

1. Go to Railway → PostgreSQL service → **Settings** → **Networking**
2. Click **"Generate Domain"** to get a public host and port
3. Use that public host in your `DATABASE_URL`

### Sharing Credentials with Teammates

Share the `.env.local` file privately (via chat or a shared doc). Never push it to GitHub — it's already listed in `.gitignore`.

---

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── (user)/            # User-facing pages
├── components/            # React components
│   ├── features/         # Feature-specific components
│   ├── shared/           # Shared components
│   └── ui/               # UI components (shadcn)
├── drizzle/               # Migration SQL files
├── lib/
│   ├── db/               # Database (Drizzle ORM)
│   │   ├── schema.ts    # Database schema
│   │   ├── types.ts     # TypeScript types
│   │   └── index.ts     # Database connection
│   └── auth/             # Authentication
├── hooks/                # React hooks
└── scripts/              # Utility scripts
    ├── seed.ts           # Main seed script
    └── seed-activities.ts # Activity log seed script
```

---

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | User accounts (students, faculty, admin) |
| `equipment_categories` | Equipment categories (Cameras, Laptops, etc.) |
| `equipment_models` | Equipment models (Sony A7 IV, etc.) |
| `equipment_units` | Individual equipment units |
| `rooms` | Available rooms |
| `room_availability` | Room availability schedules |
| `room_reservations` | Room reservation requests |
| `borrow_requests` | Equipment borrow requests |
| `activity_log` | System activity logs |

---

## Features

- 📦 Equipment browsing and borrowing
- 🏢 Room reservation system
- 👥 User management (students, faculty, admin)
- 📊 Admin dashboard with analytics
- 📝 Activity logging
- 🔐 Role-based access control

---

## Development

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Production build
npm run build
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@host:port/railway` |
| `NODE_ENV` | Node environment | `development` or `production` |

---

## Troubleshooting

### `DATABASE_URL environment variable is not set`

Make sure you have a `.env.local` file in the root directory with the correct `DATABASE_URL`. Ask a teammate if you don't have it.

### `ENOTFOUND postgres.railway.internal`

You're using the internal Railway host, which only works inside Railway's network. Replace it with the **public host** from Railway's Networking settings.

### Port 3000 Already in Use

```bash
# macOS/Linux — kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

---

## License

MIT