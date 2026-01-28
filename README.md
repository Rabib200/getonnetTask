# CSV Import System

A full-stack application for importing and managing large CSV files (2M+ rows) with real-time progress tracking.

## Tech Stack

**Backend:**
- NestJS with TypeScript
- MongoDB with Prisma ORM
- BullMQ + Redis for job queue
- Bull Board for queue monitoring

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Shadcn UI components
- TanStack Virtual for efficient rendering
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Redis server
- Yarn package manager

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
yarn install
```

3. Create `.env` file:
```env
DATABASE_URL="mongodb://username:password@host/csv_db?retryWrites=true&w=majority"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=5005
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Start Redis (if not running):
```bash
redis-server
```

6. Run the backend:
```bash
yarn start:dev
```

Backend will run on `http://localhost:5005`

Bull Board dashboard available at `http://localhost:5005/admin/queues`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
yarn add @tanstack/react-virtual
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5005
```

4. Run the development server:
```bash
yarn dev
```

Frontend will run on `http://localhost:3000`

## Features Completed

### Backend
- ✅ CSV streaming with backpressure handling
- ✅ BullMQ job queue for async processing
- ✅ Real-time progress tracking
- ✅ Batch insertions with duplicate checking
- ✅ Customer CRUD endpoints
- ✅ Recent customers endpoint
- ✅ Import sync and progress endpoints
- ✅ Bull Board dashboard integration
- ✅ Prisma with MongoDB
- ✅ Event-loop safe processing

### Frontend
- ✅ Import status page with real-time updates
- ✅ Progress visualization (percentage, rate, ETA)
- ✅ Recent customers display during import
- ✅ Customer list page with infinite scroll
- ✅ Virtual scrolling for efficient rendering
- ✅ Customer detail page
- ✅ Customer create page
- ✅ Customer edit page
- ✅ Responsive UI with Shadcn components

## API Endpoints

### Import
- `POST /import/sync` - Trigger CSV import
- `GET /import/progress` - Get current import progress

### Customer
- `GET /customer?page=1&limit=50` - Get paginated customers
- `GET /customer/recent?limit=20` - Get recent customers
- `GET /customer/:id` - Get customer by ID
- `POST /customer` - Create new customer
- `PATCH /customer/:id` - Update customer
- `DELETE /customer/:id` - Delete customer (endpoint exists but not implemented in UI)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── customer/          # Customer module
│   │   ├── imports/           # Import module with processor
│   │   ├── database/          # Prisma service
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Import dashboard
│   │   ├── customers/
│   │   │   ├── page.tsx       # Customer list
│   │   │   ├── new/page.tsx   # Create customer
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Customer detail
│   │   │       └── edit/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # Shadcn components
│   │   └── customer-form.tsx
│   ├── lib/
│   │   └── api.ts            # API client
│   └── package.json
│
└── README.md
```

## Performance Notes

- Handles 2M+ rows efficiently with streaming
- Batch size: 5000 rows per batch
- Average processing rate: 500-1000 rows/sec
- Virtual scrolling renders only visible rows
- Infinite scroll loads 50 customers per page
- Progress updates every 5 batches
- No duplicate checking on initial import (relies on unique index)

## Development Notes

Built from scratch to understand CSV processing, job queues, and efficient data rendering. Focused on performance and real-time updates throughout the implementation.
