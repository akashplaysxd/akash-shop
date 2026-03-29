import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ashop.qzz.io";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Akash@2012";

const secretKey = new TextEncoder().encode(SECRET_KEY);

export async function createToken(payload: { userId: string; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return verifyToken(token);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

// Initialize admin user on first run
export async function initializeAdmin() {
  const adminExists = await db.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!adminExists) {
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    await db.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("Admin user created:", ADMIN_EMAIL);
  }
}
