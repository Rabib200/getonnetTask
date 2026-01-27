# Large CSV Import – Full-Stack Plan

## Goal

Build a small full-stack application that:

- Imports very large CSV files (2GB+) from the local filesystem (no HTTP upload)
- Processes data in an event-loop safe way
- Shows real-time import progress in the UI
- Restores progress after browser refresh or server restart
- Shows partial imported rows during import
- Supports efficient Customer CRUD & listing

## Stack

- **Backend:** NestJS + TypeScript
- **Frontend:** React + TypeScript
- **Database:** MongoDB (via Prisma)
- **Background processing:** Node.js Worker Threads
- **Authentication:** Not required

---

## High-Level Architecture

```
React UI
 ├── CSV Upload
 ├── Import Progress View
 └── Customer CRUD

NestJS API (Main Thread)
 ├── Upload endpoint
 ├── ImportJob APIs
 ├── Progress APIs
 └── Customer CRUD APIs

Worker Thread
 ├── Stream CSV file
 ├── Parse rows
 ├── Batch insert into MongoDB
 └── Update progress

MongoDB
 ├── customers
 └── import_jobs
```

---

## Key Design Decisions

### Why Streams?

- CSV file is too large to fit in memory
- Node.js streams allow row-by-row processing
- Built-in backpressure prevents memory spikes

### Why Worker Threads?

- CSV parsing and data transformation are CPU-heavy
- Worker threads isolate heavy computation
- Main API thread stays responsive
- No extra infrastructure (Redis / queues) required

### Why Persist Progress in DB?

- UI progress must survive refresh
- Avoid in-memory state
- Enables fault visibility and retry

---

## Data Models (MongoDB via Prisma)

### ImportJob

Tracks a CSV sync/import lifecycle

**Fields:**

- `id`
- `filePath`
- `status` (IDLE | RUNNING | COMPLETED | FAILED)
- `totalRows` (fixed: 2,000,000)
- `processedRows`
- `startedAt`
- `finishedAt`
- `error` (nullable)

---

### Customer

Customer record imported from CSV or manually created

**Fields:**

- `id`
- `externalId` (from CSV, used for dedup / bonus logic)
- `name`
- `email`
- `phone`
- `updatedAt`
- `createdAt`

---

### ImportedRow (optional)

Stores last N successfully processed rows for partial UI display

**Fields:**

- `id`
- `importJobId`
- `customerId`
- `rowNumber`
- `createdAt`

---

## Backend Implementation Plan (NestJS)

### 1. CSV Import Trigger (Main Thread)

**Endpoint:**

```
POST /customers/sync
```

**Behavior:**

- Reads CSV directly from local filesystem (configured path)
- If a sync is already running:
  - Reject request
  - Disable UI interaction

**Flow:**

1. Check if an ImportJob with status RUNNING exists
2. Create new ImportJob
3. Spawn worker thread with filePath + jobId
4. Return current job state

---

### 2. Worker Thread Responsibilities

The worker thread:

- Opens file using `fs.createReadStream`
- Pipes to CSV parser
- Processes rows incrementally
- Inserts customers in batches (e.g. 1k–5k)
- Updates `processedRows` in DB
- Updates job status on completion or failure

**Important:**

- Prisma client is initialized inside the worker
- Worker communicates minimal info to main thread
- Progress is written directly to MongoDB

---

### 3. CSV Processing Logic

**Processing strategy:**

- Stream CSV rows
- Transform each row into Customer object
- Push into batch array
- When batch size reached:
  - `insertMany`
  - Increment `processedRows`
  - Persist progress

**On end of file:**

- Insert remaining batch
- Mark job as COMPLETED

**On error:**

- Mark job as FAILED
- Store error message

---

### 4. Progress & Realtime APIs

**Progress Endpoint:**

```
GET /customers/progress
```

**Returns:**

- `status`
- `processedRows`
- `totalRows`
- `percent`
- `rate` (rows/sec)
- `elapsed time`
- `ETA`

**Realtime Strategy:**

- Polling (default) every 1–2s
- SSE optional if implemented

Progress is always read from DB, never memory.

---

### 5. Customer CRUD APIs

Standard REST endpoints:

```
POST   /customers
GET    /customers
GET    /customers/:id
PUT    /customers/:id
DELETE /customers/:id
```

No special logic required.

---

## Frontend Implementation Plan (React)

### Import Status Page

- Trigger sync
- Display realtime progress
- Progress bar + metrics (rows/sec, ETA)
- Partial rows table (last N imported)
- Restore progress after refresh

### Customer List Page

- Infinite scroll
- Page cache in memory
- Already fetched pages render instantly
- Efficient rendering (windowing / virtualization)

---

### Import Flow (Frontend)

1. User clicks "Sync Customers"
2. UI calls `POST /customers/sync`
3. UI starts polling `GET /customers/progress`
4. Progress state stored in server
5. On refresh:
   - UI refetches progress
   - Continues from last known state

---

## Failure & Resilience Handling

- ImportJob status persisted
- On worker crash or restart:
  - Progress remains in DB
  - UI reflects last known state

**Optional:**

- Resume logic can skip already imported rows
- Temp resources cleaned on completion

---

## Folder Structure (Suggested)

```
src/
 ├── imports/
 │   ├── imports.controller.ts
 │   ├── imports.service.ts
 │   ├── import.worker.ts
 │   └── import-job.model.ts
 ├── customers/
 │   ├── customers.controller.ts
 │   └── customers.service.ts
 ├── prisma/
 └── main.ts
```

---

## Scaling Considerations (Discussion Only)

- Worker threads isolate CPU load
- For higher scale or distributed imports:
  - Move workers to separate service
  - Use a job queue

For current scope, worker threads are sufficient and simpler.

---

## Summary

This design demonstrates:

- Event-loop safe large file processing
- Worker-based CPU isolation
- Persistent progress tracking
- Realtime UX with refresh safety
- Efficient frontend rendering

Focus is correctness, performance, and clarity — not over-engineering.