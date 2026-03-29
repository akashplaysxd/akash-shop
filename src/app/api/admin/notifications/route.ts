import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET - Get notifications
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to get notifications" }, { status: 500 });
  }
}

// PUT - Mark notifications as read
export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();

    if (ids && ids.length > 0) {
      await db.notification.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true },
      });
    } else {
      // Mark all as read
      await db.notification.updateMany({
        where: { type: "admin", isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark notifications error:", error);
    return NextResponse.json({ error: "Failed to mark notifications" }, { status: 500 });
  }
}

// POST - Create notification (alert)
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, type } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const notification = await db.notification.create({
      data: { message, type: type || "admin" },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
