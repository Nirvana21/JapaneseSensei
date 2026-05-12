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

    const sql = getSQL();

    // 1. Vérifier si l'utilisateur existe en DB avec le bon mot de passe
    const dbUsers = await q<{ id: string }>(sql`
      SELECT id FROM users
      WHERE username = ${username}
        AND password_hash = crypt(${password}, password_hash)
    `);

    let userId: string;

    if (dbUsers.length > 0) {
      // Utilisateur DB trouvé
      userId = dbUsers[0].id;
      // Mettre à jour last_seen_at
      await sql`UPDATE users SET last_seen_at = NOW() WHERE id = ${userId}`;
    } else {
      // Fallback : vérifier les variables d'env (utilisateur principal)
      const expectedUsername = process.env.AUTH_USERNAME;
      const expectedPassword = process.env.AUTH_PASSWORD;

      if (
        !expectedUsername ||
        !expectedPassword ||
        username !== expectedUsername ||
        password !== expectedPassword
      ) {
        return NextResponse.json(
          { error: "Invalid username or password" },
          { status: 401 }
        );
      }

      // Auto-créer l'utilisateur principal depuis les env vars (première connexion)
      const inserted = await q<{ id: string }>(sql`
        INSERT INTO users (username, password_hash, display_name)
        VALUES (
          ${username},
          crypt(${password}, gen_salt('bf', 8)),
          ${username}
        )
        ON CONFLICT (username) DO UPDATE SET last_seen_at = NOW()
        RETURNING id
      `);
      userId = inserted[0].id;
    }

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
