import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET - Get all products or products by shop
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shopId");

    if (shopId) {
      const products = await db.product.findMany({
        where: { shopId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(products);
    }

    // Get all products
    const products = await db.product.findMany({
      include: {
        shop: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to get products" }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId, title, description, price, fileUrl, thumbnailUrl } = await request.json();

    if (!shopId || !title || price === undefined) {
      return NextResponse.json({ error: "Shop ID, title and price required" }, { status: 400 });
    }

    // Check shop ownership
    const shop = await db.shop.findUnique({ where: { id: shopId } });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const product = await db.product.create({
      data: {
        shopId,
        title,
        description,
        price: parseFloat(price),
        fileUrl,
        thumbnailUrl,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, price, fileUrl, thumbnailUrl } = await request.json();

    // Check ownership via shop
    const product = await db.product.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.shop.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.product.update({
      where: { id },
      data: { title, description, price: parseFloat(price), fileUrl, thumbnailUrl },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // Check ownership via shop
    const product = await db.product.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.shop.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
