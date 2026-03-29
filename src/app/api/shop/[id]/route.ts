import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const shop = await db.shop.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
        },
        user: { select: { id: true, email: true } },
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Get shop error:", error);
    return NextResponse.json({ error: "Failed to get shop" }, { status: 500 });
  }
}
