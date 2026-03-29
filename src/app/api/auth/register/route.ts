import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: { email, password: hashedPassword },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
