import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Generate URL-friendly slug from name
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
}

// GET - Get all shops or user's shops
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Get user's shops
      const shops = await db.shop.findMany({
        where: { userId },
        include: { _count: { select: { products: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(shops);
    }

    // Get all public shops
    const shops = await db.shop.findMany({
      include: {
        user: { select: { id: true, email: true } },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error("Get shops error:", error);
    return NextResponse.json({ error: "Failed to get shops" }, { status: 500 });
  }
}

// POST - Create a new shop
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, logoUrl } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Shop name required" }, { status: 400 });
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db.shop.findUnique({ where: { slug } });
      if (!existing) break;
      slug = generateSlug(name);
      attempts++;
    }

    const shop = await db.shop.create({
      data: {
        userId: session.userId,
        name,
        slug,
        description,
        logoUrl,
      },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Create shop error:", error);
    return NextResponse.json({ error: "Failed to create shop" }, { status: 500 });
  }
}

// PUT - Update shop
export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, description, logoUrl } = await request.json();

    // Check ownership
    const shop = await db.shop.findUnique({ where: { id } });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.shop.update({
      where: { id },
      data: { name, description, logoUrl },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update shop error:", error);
    return NextResponse.json({ error: "Failed to update shop" }, { status: 500 });
  }
}

// DELETE - Delete shop
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Shop ID required" }, { status: 400 });
    }

    // Check ownership
    const shop = await db.shop.findUnique({ where: { id } });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.shop.delete({ where: { id } });

    return NextResponse.json({ message: "Shop deleted" });
  } catch (error) {
    console.error("Delete shop error:", error);
    return NextResponse.json({ error: "Failed to delete shop" }, { status: 500 });
  }
}
