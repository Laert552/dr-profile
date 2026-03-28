"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterResult =
  | { ok: true }
  | { ok: false; error: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function classifyPrismaError(e: unknown): string | null {
  if (typeof e !== "object" || e === null) return null;

  const name = "name" in e ? String((e as { name: unknown }).name) : "";
  const message = "message" in e ? String((e as { message: unknown }).message) : "";

  if (name === "PrismaClientInitializationError") {
    return "Cannot connect to the database. Check DATABASE_URL in your .env file.";
  }

  if (
    name === "PrismaClientUnknownRequestError" &&
    message.includes("42P05")
  ) {
    return "Database query error (42P05). Restart the dev server — this usually self-resolves.";
  }

  if ("code" in e) {
    const code = String((e as { code: unknown }).code);
    if (code === "P2002") return "User already exists";
    if (code === "P1001") return "Cannot reach the database server. Check DATABASE_URL.";
    if (code === "P1008") return "Database operation timed out. Try again.";
  }

  return null;
}

export async function registerUser(
  email: string,
  password: string
): Promise<RegisterResult> {
  const trimmedEmail = email?.trim() ?? "";
  const pwd = password ?? "";

  if (!trimmedEmail || !pwd) {
    return { ok: false, error: "Email and password are required." };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (pwd.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  const normalizedEmail = normalizeEmail(trimmedEmail);

  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { ok: false, error: "User already exists" };
    }

    const hashed = await bcrypt.hash(pwd, 10);

    await prisma.user.create({
      data: { email: normalizedEmail, password: hashed },
    });

    return { ok: true };
  } catch (e: unknown) {
    const friendly = classifyPrismaError(e);
    if (friendly) return { ok: false, error: friendly };
    throw e;
  }
}
