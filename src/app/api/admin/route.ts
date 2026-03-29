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

    const [products, orders, hireRequests, revenue, notifications] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.hireRequest.count({ where: { status: "pending" } }),
      db.order.aggregate({
        _sum: { amount: true },
        where: { status: "completed" },
      }),
      db.notification.count({ where: { isRead: false, type: "admin" } }),
    ]);

    const pendingHireRequests = await db.hireRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const recentOrders = await db.order.findMany({
      include: { product: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      products,
      orders,
      hireRequests,
      revenue: revenue._sum.amount || 0,
      unreadNotifications: notifications,
      pendingHireRequests,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
