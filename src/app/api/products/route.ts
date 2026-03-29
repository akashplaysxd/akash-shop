import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET - Get all products
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to get products" }, { status: 500 });
  }
}
