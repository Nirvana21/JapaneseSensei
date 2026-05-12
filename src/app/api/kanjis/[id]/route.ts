import { NextRequest, NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
import { getSessionUser } from "@/services/auth";

// PUT /api/kanjis/[id] — met à jour un kanji existant
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const kanji = await req.json();
  const sql = getSQL();
  const dataJson = JSON.stringify(kanji);

  await sql`
    UPDATE kanji_entries
    SET data = ${dataJson}::jsonb, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${user.userId}
  `;

  return NextResponse.json({ ok: true });
}

// DELETE /api/kanjis/[id] — supprime un kanji
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sql = getSQL();

  await sql`
    DELETE FROM kanji_entries
    WHERE id = ${id} AND user_id = ${user.userId}
  `;

  return NextResponse.json({ ok: true });
}
