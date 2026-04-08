# CCIS Connect

Equipment borrowing and room reservation system for CCIS.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS, shadcn/ui
- **Authentication**: Session-based with cookies

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

#### Option A: Install PostgreSQL Locally

**macOS:**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb ccis_connect
```

**Windows:**
```powershell
# Download and install PostgreSQL from:
# https://www.postgresql.org/download/windows/

# After installation, PostgreSQL should start automatically
# Open Command Prompt or PowerShell and create database:
createdb -U postgres ccis_connect

# Or use pgAdmin (GUI tool installed with PostgreSQL)
```

**Linux (Ubuntu/Debian):**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb ccis_connect
```

#### Option B: Use Existing PostgreSQL Server

If you already have PostgreSQL running, just create a new database:

**macOS/Linux:**
```bash
createdb ccis_connect
```

**Windows:**
```powershell
createdb -U postgres ccis_connect
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database connection string
DATABASE_URL=postgresql://username@localhost:5432/ccis_connect

# Node environment
NODE_ENV=development
```

**Connection String Examples:**

- **macOS/Linux**: `postgresql://yourusername@localhost:5432/ccis_connect`
- **Windows**: `postgresql://postgres:yourpassword@localhost:5432/ccis_connect`

Replace:
- `yourusername` with your PostgreSQL username (usually your system username on macOS/Linux)
- `yourpassword` with the password you set during PostgreSQL installation (Windows)
- `postgres` is the default superuser on Windows

### 4. Push Database Schema

```bash
npm run db:push
```

This will create all the necessary tables in your database.

### 5. Seed Test Data

Seed the database with test users, sample rooms, and equipment:

**macOS/Linux:**
```bash
DATABASE_URL="postgresql://username@localhost:5432/ccis_connect" npx tsx scripts/seed.ts
```

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ccis_connect"; npx tsx scripts/seed.ts
```

**Windows (Command Prompt):**
```cmd
set DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ccis_connect && npx tsx scripts/seed.ts
```

This creates:

**Test Users:**
- **Student 1**: username: `23-14000`, password: `23-14000`
- **Student 2**: username: `23-14001`, password: `23-14001`
- **Faculty 1**: username: `fac-01`, password: `fac-01`
- **Faculty 2**: username: `fac-02`, password: `fac-02`
- **Admin**: username: `admin`, password: `admin`

**Sample Rooms:**
- CCIS-301 (1st Floor, Lecture, capacity 20)
- CCIS-302 (2nd Floor, Lab Room, capacity 8)
- Both with availability Monday-Friday, 8 AM - 5 PM

**Sample Equipment:**
- Cameras category with Sony A7 IV model (1 unit: CAM-A7IV-01)
- Laptops category with MacBook Pro M3 model (1 unit: MBP-M3-01)

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Management

### Drizzle Studio (Database GUI)

Access your database with a visual interface:

```bash
npm run db:studio
```

Then open [https://local.drizzle.studio](https://local.drizzle.studio) in your browser.

### Database Scripts

```bash
# Push schema changes to database (development)
npm run db:push

# Generate migrations from schema changes
npm run db:generate

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── (user)/            # User-facing pages
├── components/            # React components
│   ├── features/         # Feature-specific components
│   ├── shared/           # Shared components
│   └── ui/               # UI components (shadcn)
├── lib/
│   ├── db/               # Database (Drizzle ORM)
│   │   ├── schema.ts    # Database schema
│   │   ├── types.ts     # TypeScript types
│   │   └── index.ts     # Database connection
│   └── auth/             # Authentication
├── hooks/                # React hooks
└── scripts/              # Utility scripts
```

## Database Schema

### Tables

- **users** - User accounts (students, faculty, admin)
- **equipment_categories** - Equipment categories (Cameras, Audio, etc.)
- **equipment_models** - Equipment models (Sony A7 IV, etc.)
- **equipment_units** - Individual equipment units
- **rooms** - Available rooms
- **room_availability** - Room availability schedules
- **room_reservations** - Room reservation requests
- **borrow_requests** - Equipment borrow requests
- **activity_log** - System activity logs

## Features

- 📦 Equipment browsing and borrowing
- 🏢 Room reservation system
- 👥 User management (students, faculty, admin)
- 📊 Admin dashboard with analytics
- 📝 Activity logging
- 🔐 Role-based access control

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user@localhost:5432/ccis_connect` |
| `NODE_ENV` | Node environment | `development` or `production` |

## Troubleshooting

### Database Connection Issues

If you get connection errors:

**macOS:**
1. Check PostgreSQL is running: `brew services list`
2. Verify database exists: `psql -l`
3. Check your `DATABASE_URL` in `.env.local`

**Windows:**
1. Check PostgreSQL is running: Open Services (services.msc) and look for "postgresql-x64-15"
2. Verify database exists: Open pgAdmin or run `psql -U postgres -l`
3. Check your `DATABASE_URL` in `.env.local`
4. Make sure you're using the correct password

**Linux:**
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify database exists: `sudo -u postgres psql -l`
3. Check your `DATABASE_URL` in `.env.local`

### Port Already in Use

If port 3000 is already in use:

**macOS/Linux:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

**Windows (PowerShell):**
```powershell
# Find and kill the process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or run on a different port
$env:PORT=3001; npm run dev
```

**Windows (Command Prompt):**
```cmd
# Find the process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F

# Or run on a different port
set PORT=3001 && npm run dev
```

## License

MIT
