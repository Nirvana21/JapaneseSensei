import { NextRequest, NextResponse } from "next/server";
import { getSQL, q } from "@/lib/db";
import { getSessionUser } from "@/services/auth";

// GET /api/kanjis — retourne toute la collection de l'utilisateur
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getSQL();
  const rows = await q<{ data: unknown }>(sql`
    SELECT data FROM kanji_entries
    WHERE user_id = ${user.userId}
    ORDER BY created_at ASC
  `);

  return NextResponse.json(rows.map((r) => r.data));
}

// POST /api/kanjis — upsert un kanji (crée ou met à jour par id)
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kanji = await req.json();
  if (!kanji?.id || !kanji?.kanji) {
    return NextResponse.json({ error: "id and kanji fields are required" }, { status: 400 });
  }

  const sql = getSQL();
  const dataJson = JSON.stringify(kanji);

  await sql`
    INSERT INTO kanji_entries (id, user_id, kanji, data)
    VALUES (${kanji.id}, ${user.userId}, ${kanji.kanji}, ${dataJson}::jsonb)
    ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = NOW()
  `;

  return NextResponse.json({ ok: true });
}
