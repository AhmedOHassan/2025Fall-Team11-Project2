/**
 * SnapMeal AI - User signup API endpoint
 * Copyright (C) 2025 Team11-Project2
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
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
