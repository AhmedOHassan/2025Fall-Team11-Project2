/**
 * This file handles all API endpoints for /api/sign-up (GET, POST, PUT, DELETE, etc.)
 * 
 * @author Ahmed Hassan
 */
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "~/server/db";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User exists" }, { status: 409 });
  }
  const passwordHash = await hash(password, 10);
  const user = await db.user.create({
    data: { email, name, password: passwordHash },
  });
  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
