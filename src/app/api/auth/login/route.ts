import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/services/auth";
import { getSQL, q } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    const expectedUsername = process.env.AUTH_USERNAME;
    const expectedPassword = process.env.AUTH_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json(
        { error: "Auth is not configured on the server" },
        { status: 500 }
      );
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Look up the user's UUID from the DB (needed for kanji storage and social features)
    const sql = getSQL();
    const rows = await q<{ id: string }>(sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `);
    const userId = rows[0]?.id ?? null;

    await createSession({ username, userId });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
