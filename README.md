# Birthly

A birthday reminder app that makes sure you never forget a friend's birthday again. Create groups, invite friends, and get SMS reminders before every birthday.

## Features

- **Group Management** - Create groups for friends, family, or coworkers
- **Invite Links** - Share a link so others can join and add their birthday automatically
- **SMS Reminders** - Configurable reminders (1 week, 1 day before, etc.)
- **Birthday Countdown** - See live countdowns to upcoming birthdays
- **User Accounts** - Sign up with username/password, manage your profile
- **Dark Mode** - Full dark/light theme support

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: SQLite via Prisma v7 + better-sqlite3
- **Auth**: Custom (bcryptjs + jose JWT + httpOnly cookies)
- **UI**: Tailwind CSS + shadcn/ui
- **SMS**: Twilio (with console mock for development)
- **Scheduler**: node-cron for automated reminders

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed with test data
npx tsx scripts/seed.ts

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-at-least-32-characters"
SMS_PROVIDER="console"
```

For real SMS, set `SMS_PROVIDER="twilio"` and add your Twilio credentials:

```env
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

## Running the Scheduler

The SMS reminder scheduler runs as a separate process:

```bash
npx tsx scripts/scheduler.ts
```

Or run both the web app and scheduler together:

```bash
npx concurrently "npm run dev" "npx tsx watch scripts/scheduler.ts"
```
