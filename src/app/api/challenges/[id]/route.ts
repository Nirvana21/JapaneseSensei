import { NextRequest, NextResponse } from "next/server";
import { getSQL, q } from "@/lib/db";
import { getSessionUser } from "@/services/auth";

// PATCH /api/challenges/[id] — soumettre un score ou accepter/refuser
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, score } = body; // action: 'accept' | 'decline' | 'submit_score'

  const sql = getSQL();

  interface ChallengeRow {
    challenger_id: string;
    challenged_id: string;
    status: string;
  }

  const challenges = await q<ChallengeRow>(sql`
    SELECT * FROM challenges WHERE id = ${id}
      AND (challenger_id = ${user.userId} OR challenged_id = ${user.userId})
  `);

  if (challenges.length === 0) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const challenge = challenges[0];
  const isChallenger = challenge.challenger_id === user.userId;

  if (action === "decline") {
    if (isChallenger) return NextResponse.json({ error: "Cannot decline your own challenge" }, { status: 400 });
    await sql`UPDATE challenges SET status = 'declined' WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }

  if (action === "accept") {
    if (isChallenger) return NextResponse.json({ error: "Cannot accept your own challenge" }, { status: 400 });
    await sql`UPDATE challenges SET status = 'accepted' WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }

  if (action === "submit_score") {
    if (score === undefined) return NextResponse.json({ error: "score required" }, { status: 400 });

    if (isChallenger) {
      await sql`UPDATE challenges SET challenger_score = ${score} WHERE id = ${id}`;
    } else {
      await sql`UPDATE challenges SET challenged_score = ${score} WHERE id = ${id}`;
    }

    // Si les deux scores sont soumis → compléter
    interface ScoreRow { challenger_score: number | null; challenged_score: number | null; }
    const updated = await q<ScoreRow>(sql`SELECT challenger_score, challenged_score FROM challenges WHERE id = ${id}`);
    const c = updated[0];
    if (c.challenger_score !== null && c.challenged_score !== null) {
      await sql`
        UPDATE challenges
        SET status = 'completed', completed_at = NOW()
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
