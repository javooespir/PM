# PM Control Tower — Setup Guide

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL** and **anon key** from **Settings → API**

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Create your first account

- Click **Sign up** on the login page
- Create your account (check email for confirmation if enabled)
- Go to **Settings → Projects → New Project**

---

## Deployment

### Vercel

```bash
npm run build
vercel deploy --prod
```

Add environment variables in Vercel dashboard.

### Netlify

```bash
npm run build
netlify deploy --dir=dist --prod
```

---

## Architecture

```
src/
├── components/
│   ├── layout/         # Sidebar, Topbar, AppLayout
│   ├── shared/         # Badge, Button, Card, Modal, Table, Input
│   ├── tasks/          # TaskForm
│   └── ...
├── contexts/
│   ├── AuthContext.jsx # Supabase auth
│   └── ProjectContext.jsx
├── hooks/
│   └── useQuery.js     # Supabase query hooks
├── lib/
│   ├── supabase.js     # Supabase client
│   └── store.js        # Zustand global state
├── pages/
│   ├── Dashboard.jsx   # Executive dashboard
│   ├── Tasks.jsx       # Task management + scoring
│   ├── Risks.jsx       # FMEA risk management
│   ├── Milestones.jsx  # Gate/milestone tracking
│   ├── Suppliers.jsx   # Supplier management
│   ├── Meetings.jsx    # Meeting + action tracking
│   ├── Documents.jsx   # File management
│   ├── Escalations.jsx # Escalation engine
│   ├── Reports.jsx     # Executive reports
│   └── Settings.jsx    # Projects + config
└── utils/
    ├── scoring.js      # Auto-priority scoring
    └── format.js       # Date/status formatters
```

## Scoring System

Tasks receive an automatic priority score:

| Condition | Points |
|-----------|--------|
| Affects SOP | +40 |
| Safety issue | +50 |
| Task overdue | +30 |
| Supplier-linked | +20 |
| Blocks other tasks | +25 |
| Critical priority | +15 |

Score ≥80 → Critical | ≥50 → High | ≥25 → Medium | <25 → Low

## Auto-Escalation Rules

The system automatically creates escalations when:
- Critical task is overdue > 5 days
- SOP-impacting task is overdue > 5 days  
- Safety issue is overdue > 5 days

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **State**: Zustand + React Context
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Charts**: Recharts
- **Icons**: Lucide React
- **File upload**: React Dropzone
