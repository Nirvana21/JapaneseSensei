import { KanjiEntry } from "@/types/kanji";

/**
 * Service de stockage des kanjis via l'API (Neon DB).
 */
export class KanjiStorageService {
  // No-op: kept for hook compatibility
  static async initialize(): Promise<void> {}

  static async getAllKanjis(): Promise<KanjiEntry[]> {
    const res = await fetch("/api/kanjis");
    if (res.status === 401) {
      if (typeof window !== "undefined") window.location.href = "/login";
      return [];
    }
    if (!res.ok) throw new Error(`Erreur chargement kanjis: ${res.status}`);
    const data: KanjiEntry[] = await res.json();
    return data.map((k) => ({
      ...k,
      dateAdded: new Date(k.dateAdded),
      lastModified: new Date(k.lastModified),
      studyData: k.studyData
        ? {
            ...k.studyData,
            lastStudied: k.studyData.lastStudied
              ? new Date(k.studyData.lastStudied)
              : undefined,
          }
        : undefined,
    }));
  }

  static async getKanjiById(id: string): Promise<KanjiEntry | null> {
    const kanjis = await this.getAllKanjis();
    return kanjis.find((k) => k.id === id) ?? null;
  }

  static async getKanjiByCharacter(character: string): Promise<KanjiEntry | null> {
    const kanjis = await this.getAllKanjis();
    return kanjis.find((k) => k.kanji === character) ?? null;
  }

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

  static async updateStudyData(
    id: string,
    studyData: KanjiEntry["studyData"]
  ): Promise<void> {
    const kanji = await this.getKanjiById(id);
    if (kanji) {
      kanji.studyData = studyData;
      kanji.lastModified = new Date();
      await this.saveKanji(kanji);
    }
  }

  static async searchKanjis(query: string): Promise<KanjiEntry[]> {
    const kanjis = await this.getAllKanjis();
    const lower = query.toLowerCase();
    return kanjis.filter(
      (k) =>
        k.kanji.includes(query) ||
        k.meanings.some((m) => m.toLowerCase().includes(lower)) ||
        k.onyomi.some((r) => r.includes(query)) ||
        k.kunyomi.some((r) => r.includes(query)) ||
        k.primaryMeaning?.toLowerCase().includes(lower) ||
        k.customNotes?.toLowerCase().includes(lower)
    );
  }

  static async exportKanjis(): Promise<string> {
    const kanjis = await this.getAllKanjis();
    return JSON.stringify(kanjis, null, 2);
  }

  /**
   * Importe des kanjis depuis un JSON exporté.
   * Retourne le nombre importés, ignorés et en erreur.
   */
  static async importKanjis(
    jsonData: string,
    overwrite = false
  ): Promise<{ count: number; skipped: number; errors: number }> {
    const imported: KanjiEntry[] = JSON.parse(jsonData);
    const existing = overwrite ? [] : await this.getAllKanjis();
    const existingChars = new Set(existing.map((k) => k.kanji));

    let count = 0,
      skipped = 0,
      errors = 0;

    for (const kanji of imported) {
      if (!overwrite && existingChars.has(kanji.kanji)) {
        skipped++;
        continue;
      }
      // Générer un id si manquant
      const entry: KanjiEntry = kanji.id
        ? kanji
        : { ...kanji, id: crypto.randomUUID() };
      try {
        await this.saveKanji(entry);
        count++;
      } catch (e) {
        console.warn("Erreur import kanji:", entry.kanji, e);
        errors++;
      }
    }
    return { count, skipped, errors };
  }

  static async getStats(): Promise<{
    totalKanjis: number;
    studiedKanjis: number;
    averageCorrectRate: number;
    lastStudyDate?: Date;
  }> {
    const kanjis = await this.getAllKanjis();
    const studied = kanjis.filter(
      (k) => k.studyData && k.studyData.timesStudied > 0
    );
    const totalCorrect = studied.reduce(
      (s, k) => s + (k.studyData?.correctAnswers ?? 0),
      0
    );
    const totalAttempts = studied.reduce(
      (s, k) => s + (k.studyData?.timesStudied ?? 0),
      0
    );
    const dates = studied
      .map((k) => k.studyData?.lastStudied)
      .filter(Boolean) as Date[];
    return {
      totalKanjis: kanjis.length,
      studiedKanjis: studied.length,
      averageCorrectRate:
        totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0,
      lastStudyDate:
        dates.length > 0
          ? new Date(Math.max(...dates.map((d) => d.getTime())))
          : undefined,
    };
  }

  // Legacy – no-op
  static async clearAllData(): Promise<void> {}
}
