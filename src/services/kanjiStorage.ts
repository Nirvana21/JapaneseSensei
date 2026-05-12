import { KanjiEntry } from "@/types/kanji";

const MIGRATION_FLAG = "js_migrated_to_db_v1";
const LEGACY_STORAGE_KEY = "japanese-sensei-kanjis";

function deserialize(raw: KanjiEntry & { dateAdded: string; lastModified: string }): KanjiEntry {
  return {
    ...raw,
    dateAdded: new Date(raw.dateAdded),
    lastModified: new Date(raw.lastModified),
    studyData: raw.studyData
      ? {
          ...raw.studyData,
          lastStudied: raw.studyData.lastStudied
            ? new Date(raw.studyData.lastStudied as unknown as string)
            : undefined,
        }
      : undefined,
  };
}

/**
 * Service de stockage pour les kanjis â€” maintenant sauvegardÃ© via l'API REST (/api/kanjis).
 * Migration automatique depuis localStorage au premier chargement.
 */
export class KanjiStorageService {
  /** Lance la migration localStorage â†’ DB si pas encore faite. */
  static async initialize(): Promise<void> {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) {
      localStorage.setItem(MIGRATION_FLAG, "1");
      return;
    }

    try {
      const kanjis: KanjiEntry[] = JSON.parse(legacyRaw);
      if (kanjis.length === 0) {
        localStorage.setItem(MIGRATION_FLAG, "1");
        return;
      }

      // VÃ©rifier si la DB a dÃ©jÃ  des kanjis (migration dÃ©jÃ  faite)
      const existing = await this.getAllKanjis().catch(() => null);
      if (existing && existing.length > 0) {
        localStorage.setItem(MIGRATION_FLAG, "1");
        return;
      }

      // Importer kanji par kanji en prÃ©servant les UUIDs existants
      for (const kanji of kanjis) {
        await fetch("/api/kanjis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(kanji),
        }).catch(console.error);
      }

      localStorage.setItem(MIGRATION_FLAG, "1");
      console.info(`Migration: ${kanjis.length} kanjis importÃ©s en DB.`);
    } catch (e) {
      console.error("Migration localStorage â†’ DB Ã©chouÃ©e :", e);
    }
  }

  static async getAllKanjis(): Promise<KanjiEntry[]> {
    const res = await fetch("/api/kanjis");
    if (!res.ok) throw new Error(`Erreur API kanjis: ${res.status}`);
    const data = await res.json();
    return (data as (KanjiEntry & { dateAdded: string; lastModified: string })[]).map(deserialize);
  }

  static async getKanjiById(id: string): Promise<KanjiEntry | null> {
    const kanjis = await this.getAllKanjis();
    return kanjis.find((k) => k.id === id) ?? null;
  }

  static async getKanjiByCharacter(character: string): Promise<KanjiEntry | null> {
    const kanjis = await this.getAllKanjis();
    return kanjis.find((k) => k.kanji === character) ?? null;
  }

  /** CrÃ©e ou met Ã  jour un kanji (upsert par id). */
  static async saveKanji(kanji: KanjiEntry): Promise<void> {
    const res = await fetch("/api/kanjis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...kanji, lastModified: new Date() }),
    });
    if (!res.ok) throw new Error(`Erreur sauvegarde kanji: ${res.status}`);
  }

  static async deleteKanji(id: string): Promise<void> {
    const res = await fetch(`/api/kanjis/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Erreur suppression kanji: ${res.status}`);
  }

  static async updateStudyData(id: string, studyData: KanjiEntry["studyData"]): Promise<void> {
    const kanji = await this.getKanjiById(id);
    if (kanji) {
      await this.saveKanji({ ...kanji, studyData, lastModified: new Date() });
    }
  }

  static async searchKanjis(query: string): Promise<KanjiEntry[]> {
    const kanjis = await this.getAllKanjis();
    const q = query.toLowerCase();
    return kanjis.filter(
      (k) =>
        k.kanji.includes(query) ||
        k.meanings.some((m) => m.toLowerCase().includes(q)) ||
        k.onyomi.some((r) => r.includes(query)) ||
        k.kunyomi.some((r) => r.includes(query)) ||
        k.primaryMeaning?.toLowerCase().includes(q) ||
        k.primaryReading?.includes(query) ||
        k.customNotes?.toLowerCase().includes(q)
    );
  }

  static async exportKanjis(): Promise<string> {
    const kanjis = await this.getAllKanjis();
    return JSON.stringify(kanjis, null, 2);
  }

  static async importKanjis(jsonData: string, overwrite = false): Promise<number> {
    const imported: KanjiEntry[] = JSON.parse(jsonData);
    const existing = overwrite ? [] : await this.getAllKanjis();
    const existingChars = new Set(existing.map((k) => k.kanji));

    let count = 0;
    for (const kanji of imported) {
      if (!overwrite && existingChars.has(kanji.kanji)) continue;
      await this.saveKanji(kanji);
      count++;
    }
    return count;
  }
}
