import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET - Get user's orders or all orders (admin)
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "admin") {
      // Admin sees all orders
      const orders = await db.order.findMany({
        include: {
          product: { select: { id: true, title: true, price: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orders);
    }

    // User sees their own orders
    const orders = await db.order.findMany({
      where: { userId: session.userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Failed to get orders" }, { status: 500 });
  }
}

// POST - Create a new order (purchase)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { productId, email } = await request.json();

    if (!productId || !email) {
      return NextResponse.json({ error: "Product ID and email required" }, { status: 400 });
    }

    // Get product
    const product = await db.product.findUnique({ where: { id: productId } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create or get user
    let userId = session?.userId;
    if (!userId) {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    // Check if already purchased
    if (userId) {
      const existing = await db.order.findFirst({
        where: { userId, productId },
      });
      if (existing) {
        return NextResponse.json({ error: "Already purchased" }, { status: 400 });
      }
    }

    // Create order
    const order = await db.order.create({
      data: {
        userId: userId || "guest",
        productId,
        amount: product.price,
        email,
        status: "completed",
      },
      include: { product: true },
    });

    // Create notification
    await db.notification.create({
      data: {
        message: `New purchase: ${product.title} for $${product.price}`,
        type: "admin",
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
