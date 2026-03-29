import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET - Get all hire requests (admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await db.hireRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get hire requests error:", error);
    return NextResponse.json({ error: "Failed to get requests" }, { status: 500 });
  }
}

// POST - Submit a hire request
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { name, email, projectName, description, budget, timeline } = await request.json();

    if (!name || !email || !projectName || !description || !budget) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const hireRequest = await db.hireRequest.create({
      data: {
        userId: session?.userId || null,
        name,
        email,
        projectName,
        description,
        budget: parseFloat(budget),
        timeline,
      },
    });

    // Create notification for admin
    await db.notification.create({
      data: {
        message: `New hire request from ${name}: ${projectName} ($$${budget})`,
        type: "admin",
      },
    });

    return NextResponse.json(hireRequest);
  } catch (error) {
    console.error("Create hire request error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}

// PUT - Update hire request status (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    const hireRequest = await db.hireRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(hireRequest);
  } catch (error) {
    console.error("Update hire request error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
