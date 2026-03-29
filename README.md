# Ashop - Personal Source Code Marketplace

A personal marketplace for selling source code and accepting hire requests.

## Features

- 🔐 Admin Login
- 📦 Sell Source Code & Templates
- 💼 Hire Me Feature (with budget)
- 📊 Admin Dashboard
- 🎨 Modern Dark UI

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: JWT
- **Styling**: Tailwind CSS

## Getting Started

### 1. Environment Variables

Create `.env`:

```env
DATABASE_URL="your-neon-connection-string"
DIRECT_DATABASE_URL="your-neon-direct-connection-string"
JWT_SECRET="your-secret-key-min-32-chars"
ADMIN_EMAIL="admin@ashop.qzz.io"
ADMIN_PASSWORD="Akash@2012"
```

### 2. Database Setup

Run this SQL in Neon SQL Editor:

```sql
-- Users
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Products
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'source-code',
  "fileUrl" TEXT,
  "thumbnailUrl" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Orders
CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'completed',
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_productId_idx" ON "Order"("productId");

-- Hire Requests
CREATE TABLE IF NOT EXISTS "HireRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "projectName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "budget" DOUBLE PRECISION NOT NULL,
  "timeline" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HireRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HireRequest_status_idx" ON "HireRequest"("status");

-- Notifications
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'admin',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HireRequest" ADD CONSTRAINT "HireRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### 3. Install & Run

```bash
bun install
bun run dev
```

## Default Admin Login

- **Email**: admin@ashop.qzz.io
- **Password**: Akash@2012

## How It Works

1. **Admin** logs in and adds products (source code, templates)
2. **Visitors** browse and buy products
3. **Visitors** can submit "Hire Me" requests with project details and budget
4. **Admin** sees all hire requests in dashboard, accepts/rejects them

## License

MIT
