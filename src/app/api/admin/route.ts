import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET - Admin dashboard stats
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [users, shops, products, orders, revenue, notifications] = await Promise.all([
      db.user.count(),
      db.shop.count(),
      db.product.count(),
      db.order.count(),
      db.order.aggregate({
        _sum: { amount: true },
        where: { status: "completed" },
      }),
      db.notification.count({ where: { isRead: false, type: "admin" } }),
    ]);

    return NextResponse.json({
      users,
      shops,
      products,
      orders,
      revenue: revenue._sum.amount || 0,
      unreadNotifications: notifications,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
