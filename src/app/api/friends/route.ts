import { NextRequest, NextResponse } from "next/server";
import { getSQL, q } from "@/lib/db";
import { getSessionUser } from "@/services/auth";

// GET /api/friends — liste des amis + demandes en attente
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getSQL();

  const rows = await q(sql`
    SELECT
      CASE WHEN requester_id = ${user.userId} THEN addressee_id ELSE requester_id END AS friend_id,
      u.username,
      u.display_name,
      u.avatar_emoji,
      f.status,
      CASE WHEN requester_id = ${user.userId} THEN 'sent' ELSE 'received' END AS direction,
      f.created_at
    FROM friendships f
    JOIN users u ON u.id = CASE WHEN requester_id = ${user.userId} THEN addressee_id ELSE requester_id END
    WHERE requester_id = ${user.userId} OR addressee_id = ${user.userId}
    ORDER BY f.updated_at DESC
  `);

  return NextResponse.json(rows);
}

// POST /api/friends — envoyer une demande d'ami
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { friendId } = await req.json();
  if (!friendId) return NextResponse.json({ error: "friendId required" }, { status: 400 });
  if (friendId === user.userId) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  const sql = getSQL();

  // Vérifier que l'utilisateur existe
  const target = await q(sql`SELECT id FROM users WHERE id = ${friendId}`);
  if (target.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Vérifier qu'une relation n'existe pas déjà
  const existing = await q(sql`
    SELECT status FROM friendships
    WHERE (requester_id = ${user.userId} AND addressee_id = ${friendId})
       OR (requester_id = ${friendId} AND addressee_id = ${user.userId})
  `);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Already friends or request pending" }, { status: 409 });
  }

  await sql`
    INSERT INTO friendships (requester_id, addressee_id)
    VALUES (${user.userId}, ${friendId})
  `;

  return NextResponse.json({ ok: true });
}
