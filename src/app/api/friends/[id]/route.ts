import { NextRequest, NextResponse } from "next/server";
import { getSQL, q } from "@/lib/db";
import { getSessionUser } from "@/services/auth";

// PATCH /api/friends/[id] — accepter ou refuser une demande
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: requesterId } = await params;
  const { action } = await req.json(); // 'accept' | 'decline'

  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }

  const sql = getSQL();
  const newStatus = action === "accept" ? "accepted" : "declined";

  const result = await q(sql`
    UPDATE friendships
    SET status = ${newStatus}, updated_at = NOW()
    WHERE requester_id = ${requesterId}
      AND addressee_id = ${user.userId}
      AND status = 'pending'
    RETURNING *
  `);

  if (result.length === 0) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}

// DELETE /api/friends/[id] — supprimer un ami ou annuler une demande
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: friendId } = await params;
  const sql = getSQL();

  await sql`
    DELETE FROM friendships
    WHERE (requester_id = ${user.userId} AND addressee_id = ${friendId})
       OR (requester_id = ${friendId} AND addressee_id = ${user.userId})
  `;

  return NextResponse.json({ ok: true });
}
