import { NextRequest, NextResponse } from "next/server";
import { getSQL, q as dbQuery } from "@/lib/db";
import { getSessionUser } from "@/services/auth";

// GET /api/users/search?q=... — cherche des utilisateurs par username
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const search = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (search.length < 2) {
    return NextResponse.json([]);
  }

  const sql = getSQL();
  const rows = await dbQuery(sql`
    SELECT id, username, display_name, avatar_emoji
    FROM users
    WHERE username ILIKE ${"%" + search + "%"}
      AND id != ${user.userId}
    LIMIT 10
  `);

  return NextResponse.json(rows);
}
