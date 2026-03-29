# Ashop - Digital Product Marketplace

A Gumroad-like marketplace for selling digital products.

## Features

- 🔐 User Registration & Login (JWT Auth)
- 🏪 Shop Creation & Management
- 📦 Product Upload & Sales
- 🛒 Instant Purchase System
- 📥 Download Management
- 📊 Admin Dashboard
- 🎨 Modern Dark UI

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: JWT (jose)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/akashplaysxd/ashop.git
cd ashop
bun install
```

### 2. Environment Variables

Create `.env`:

```env
DATABASE_URL="your-neon-connection-string"
DIRECT_DATABASE_URL="your-neon-direct-connection-string"
JWT_SECRET="your-secret-key-min-32-chars-long!"
ADMIN_EMAIL="admin@ashop.qzz.io"
ADMIN_PASSWORD="Akash@2012"
```

### 3. Database Setup

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

-- Shops
CREATE TABLE IF NOT EXISTS "Shop" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "logoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Shop_userId_idx" ON "Shop"("userId");

-- Products
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT NOT NULL,
  "shopId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "fileUrl" TEXT,
  "thumbnailUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Product_shopId_idx" ON "Product"("shopId");

-- Orders
CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'completed',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_productId_idx" ON "Order"("productId");

-- Notifications
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'user',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 4. Run

```bash
bun run dev
```

## Default Admin Login

- **Email**: admin@ashop.qzz.io
- **Password**: Akash@2012

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/me` | GET | Get current user |
| `/api/shop` | GET/POST | List/Create shops |
| `/api/shop/[id]` | GET | Get shop details |
| `/api/products` | GET/POST | List/Create products |
| `/api/products/[id]` | GET | Get product details |
| `/api/orders` | GET/POST | List/Create orders |
| `/api/admin` | GET | Admin dashboard stats |

## License

MIT
