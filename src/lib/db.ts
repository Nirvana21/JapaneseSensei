import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

/** Lazy-loaded SQL client — ne se connecte qu'à la première requête. */
export function getSQL() {
  if (!_sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL / POSTGRES_URL non défini. " +
          "Ajoutez DATABASE_URL dans .env.local (disponible dans le dashboard Neon)."
      );
    }
    _sql = neon(url);
  }
  return _sql;
}

/**
 * Exécute une requête SQL et retourne les résultats typés.
 * Usage: const rows = await q<{ id: string }>(sql`SELECT id FROM users`);
 */
export async function q<T = Record<string, unknown>>(
  query: Promise<unknown>
): Promise<T[]> {
  return (await query) as unknown as T[];
}

