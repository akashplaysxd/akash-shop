import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET - Get user's orders or all orders (admin)
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (session.role === "admin" && !userId) {
      // Admin can see all orders
      const orders = await db.order.findMany({
        include: {
          user: { select: { id: true, email: true } },
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
        product: {
          include: { shop: { select: { id: true, name: true } } },
        },
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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // Get product
    const product = await db.product.findUnique({ where: { id: productId } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if already purchased
    const existing = await db.order.findFirst({
      where: { userId: session.userId, productId },
    });

    if (existing) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    // Create order
    const order = await db.order.create({
      data: {
        userId: session.userId,
        productId,
        amount: product.price,
        status: "completed",
      },
      include: {
        product: true,
      },
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
