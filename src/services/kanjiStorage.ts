import { KanjiEntry } from "@/types/kanji";

export interface ImportResult {
  count: number;
  skipped: number;
  errors: string[];
}

function parseKanji(raw: unknown): KanjiEntry {
  const k = raw as Record<string, unknown>;
  return {
    ...(k as unknown as KanjiEntry),
    dateAdded: k.dateAdded ? new Date(k.dateAdded as string) : new Date(),
    lastModified: k.lastModified ? new Date(k.lastModified as string) : new Date(),
    studyData: k.studyData
      ? ({
          ...(k.studyData as unknown as KanjiEntry["studyData"]),
          lastStudied:
            (k.studyData as Record<string, unknown>).lastStudied
              ? new Date((k.studyData as Record<string, unknown>).lastStudied as string)
              : undefined,
        } as unknown as KanjiEntry["studyData"])
      : undefined,
  };
}

export class KanjiStorageService {
  /** no-op — kept for hook compatibility */
  static async initialize(): Promise<void> {}

  static async getAllKanjis(): Promise<KanjiEntry[]> {
    const res = await fetch("/api/kanjis");
    if (!res.ok) throw new Error("Impossible de charger les kanjis");
    const data: unknown[] = await res.json();
    return data.map(parseKanji);
  }

  static async getKanjiById(id: string): Promise<KanjiEntry | null> {
    const all = await this.getAllKanjis();
    return all.find((k) => k.id === id) ?? null;
  }

  static async getKanjiByCharacter(character: string): Promise<KanjiEntry | null> {
    const all = await this.getAllKanjis();
    return all.find((k) => k.kanji === character) ?? null;
  }

  static async saveKanji(kanji: KanjiEntry): Promise<void> {
    const res = await fetch("/api/kanjis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kanji),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Erreur sauvegarde kanji");
    }
  }

  static async updateKanji(kanji: KanjiEntry): Promise<void> {
    const res = await fetch(`/api/kanjis/${kanji.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kanji),
    });
    if (!res.ok) throw new Error("Erreur mise à jour kanji");
  }

  static async deleteKanji(id: string): Promise<void> {
    const res = await fetch(`/api/kanjis/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur suppression kanji");
  }

  static async updateStudyData(
    id: string,
    studyData: KanjiEntry["studyData"]
  ): Promise<void> {
    const kanji = await this.getKanjiById(id);
    if (kanji) {
      await this.saveKanji({ ...kanji, studyData, lastModified: new Date() });
    }
  }

  static async searchKanjis(query: string): Promise<KanjiEntry[]> {
    const all = await this.getAllKanjis();
    const q = query.toLowerCase();
    return all.filter(
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

  /**
   * Importe un tableau de kanjis depuis du JSON.
   * Envoie chaque entrée à l'API séparément (upsert par kanji).
   * Retourne le nombre importés, les doublons ignorés et les erreurs.
   */
  static async importKanjis(
    jsonData: string,
    _overwrite: boolean = false
  ): Promise<ImportResult> {
    let parsed: unknown[];
    try {
      parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed)) throw new Error("Le JSON doit être un tableau");
    } catch (e) {
      throw new Error("JSON invalide : " + (e instanceof Error ? e.message : String(e)));
    }

    let count = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const raw of parsed) {
      const entry = raw as Partial<KanjiEntry>;
      if (!entry.kanji) {
        errors.push("Entrée sans champ 'kanji' ignorée");
        skipped++;
        continue;
      }
      // Générer un UUID si absent
      if (!entry.id) {
        entry.id = crypto.randomUUID();
      }
      // Normaliser les dates
      entry.dateAdded = entry.dateAdded ? new Date(entry.dateAdded) : new Date();
      entry.lastModified = new Date();

      try {
        await this.saveKanji(entry as KanjiEntry);
        count++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${entry.kanji}: ${msg}`);
        skipped++;
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
    const studied = kanjis.filter((k) => k.studyData && k.studyData.timesStudied > 0);
    const totalCorrect = studied.reduce((s, k) => s + (k.studyData?.correctAnswers ?? 0), 0);
    const totalAttempts = studied.reduce((s, k) => s + (k.studyData?.timesStudied ?? 0), 0);
    const dates = studied.map((k) => k.studyData?.lastStudied).filter(Boolean) as Date[];
    return {
      totalKanjis: kanjis.length,
      studiedKanjis: studied.length,
      averageCorrectRate: totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0,
      lastStudyDate: dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined,
    };
  }
}
