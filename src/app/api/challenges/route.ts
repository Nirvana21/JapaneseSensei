import { NextRequest, NextResponse } from "next/server";
import { getSQL, q } from "@/lib/db";
import { getSessionUser } from "@/services/auth";

// GET /api/challenges — liste tous les défis de l'utilisateur
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getSQL();

  const rows = await q(sql`
    SELECT
      c.id,
      c.game_type,
      c.status,
      c.challenger_score,
      c.challenged_score,
      c.expires_at,
      c.created_at,
      c.completed_at,
      CASE WHEN c.challenger_id = ${user.userId} THEN 'challenger' ELSE 'challenged' END AS role,
      u_challenger.username AS challenger_username,
      u_challenger.display_name AS challenger_display,
      u_challenger.avatar_emoji AS challenger_emoji,
      u_challenged.username AS challenged_username,
      u_challenged.display_name AS challenged_display,
      u_challenged.avatar_emoji AS challenged_emoji
    FROM challenges c
    JOIN users u_challenger ON u_challenger.id = c.challenger_id
    JOIN users u_challenged ON u_challenged.id = c.challenged_id
    WHERE c.challenger_id = ${user.userId} OR c.challenged_id = ${user.userId}
    ORDER BY c.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(rows);
}

// POST /api/challenges — créer un défi
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengedId, gameType, challengerScore } = await req.json();

  if (!challengedId || !gameType) {
    return NextResponse.json({ error: "challengedId and gameType required" }, { status: 400 });
  }

  const VALID_GAMES = ["speed_match", "kana_rain", "memory", "sens_cache", "fill_blank"];
  if (!VALID_GAMES.includes(gameType)) {
    return NextResponse.json({ error: "Invalid game type" }, { status: 400 });
  }

  const sql = getSQL();

  // Vérifier que la cible est un ami accepté
  const friendship = await q(sql`
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
      AND ((requester_id = ${user.userId} AND addressee_id = ${challengedId})
        OR (requester_id = ${challengedId} AND addressee_id = ${user.userId}))
  `);
  if (friendship.length === 0) {
    return NextResponse.json({ error: "Can only challenge friends" }, { status: 403 });
  }

  const inserted = await q<{ id: string }>(sql`
    INSERT INTO challenges (challenger_id, challenged_id, game_type, challenger_score, status)
    VALUES (
      ${user.userId},
      ${challengedId},
      ${gameType},
      ${challengerScore ?? null},
      'pending'
    )
    RETURNING id
  `);

  return NextResponse.json({ ok: true, id: inserted[0].id });
}
