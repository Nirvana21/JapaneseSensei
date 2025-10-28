import { KanjiEntry } from "@/types/kanji";

/**
 * Service de stockage local pour les kanjis
 * Utilise localStorage avec une couche d'abstraction pour faciliter
 * la migration vers IndexedDB plus tard si nécessaire
 */
export class KanjiStorageService {
  private static readonly STORAGE_KEY = "japanese-sensei-kanjis";
  private static readonly VERSION_KEY = "japanese-sensei-version";
  private static readonly CURRENT_VERSION = "1.0.0";

  /**
   * Initialise le stockage et vérifie la version
   */
  static async initialize(): Promise<void> {
    try {
      const version = localStorage.getItem(this.VERSION_KEY);
      if (version !== this.CURRENT_VERSION) {
        // Migration si nécessaire
        await this.migrate(version);
        localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
      }
    } catch (error) {
      console.error("Erreur initialisation stockage:", error);
    }
  }

  /**
   * Récupère tous les kanjis stockés
   */
  static async getAllKanjis(): Promise<KanjiEntry[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const kanjis: KanjiEntry[] = JSON.parse(data);

      // Convertir les dates string en Date objects
      return kanjis.map((kanji) => ({
        ...kanji,
        dateAdded: new Date(kanji.dateAdded),
        lastModified: new Date(kanji.lastModified),
        studyData: kanji.studyData
          ? {
              ...kanji.studyData,
              lastStudied: kanji.studyData.lastStudied
                ? new Date(kanji.studyData.lastStudied)
                : undefined,
            }
          : undefined,
      }));
    } catch (error) {
      console.error("Erreur récupération kanjis:", error);
      return [];
    }
  }

  /**
   * Récupère un kanji par son ID
   */
  static async getKanjiById(id: string): Promise<KanjiEntry | null> {
    const kanjis = await this.getAllKanjis();
    return kanjis.find((k) => k.id === id) || null;
  }

  /**
   * Récupère un kanji par son caractère
   */
  static async getKanjiByCharacter(
    character: string
  ): Promise<KanjiEntry | null> {
    const kanjis = await this.getAllKanjis();
    return kanjis.find((k) => k.kanji === character) || null;
  }

  /**
   * Sauvegarde un nouveau kanji
   */
  static async saveKanji(kanji: KanjiEntry): Promise<void> {
    try {
      const kanjis = await this.getAllKanjis();

      // Vérifier si le kanji existe déjà
      const existingIndex = kanjis.findIndex((k) => k.id === kanji.id);

      if (existingIndex >= 0) {
        // Mise à jour
        kanjis[existingIndex] = { ...kanji, lastModified: new Date() };
      } else {
        // Nouveau kanji
        kanjis.push(kanji);
      }

      await this.saveAllKanjis(kanjis);
    } catch (error) {
      console.error("Erreur sauvegarde kanji:", error);
      throw error;
    }
  }

  /**
   * Supprime un kanji
   */
  static async deleteKanji(id: string): Promise<void> {
    try {
      const kanjis = await this.getAllKanjis();
      const filteredKanjis = kanjis.filter((k) => k.id !== id);
      await this.saveAllKanjis(filteredKanjis);
    } catch (error) {
      console.error("Erreur suppression kanji:", error);
      throw error;
    }
  }

  /**
   * Met à jour les données d'étude d'un kanji
   */
  static async updateStudyData(
    id: string,
    studyData: KanjiEntry["studyData"]
  ): Promise<void> {
    try {
      const kanji = await this.getKanjiById(id);
      if (kanji) {
        kanji.studyData = studyData;
        kanji.lastModified = new Date();
        await this.saveKanji(kanji);
      }
    } catch (error) {
      console.error("Erreur mise à jour données étude:", error);
      throw error;
    }
  }

  /**
   * Recherche des kanjis par critères
   */
  static async searchKanjis(query: string): Promise<KanjiEntry[]> {
    try {
      const kanjis = await this.getAllKanjis();
      const lowerQuery = query.toLowerCase();

      return kanjis.filter(
        (kanji) =>
          kanji.kanji.includes(query) ||
          kanji.meanings.some((meaning) =>
            meaning.toLowerCase().includes(lowerQuery)
          ) ||
          kanji.onyomi.some((reading) => reading.includes(query)) ||
          kanji.kunyomi.some((reading) => reading.includes(query)) ||
          kanji.primaryMeaning?.toLowerCase().includes(lowerQuery) ||
          kanji.primaryReading?.includes(query) ||
          kanji.customNotes?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error("Erreur recherche kanjis:", error);
      return [];
    }
  }

  /**
   * Exporte tous les kanjis au format JSON
   */
  static async exportKanjis(): Promise<string> {
    const kanjis = await this.getAllKanjis();
    return JSON.stringify(kanjis, null, 2);
  }

  /**
   * Importe des kanjis depuis du JSON
   */
  static async importKanjis(
    jsonData: string,
    overwrite: boolean = false
  ): Promise<number> {
    try {
      const importedKanjis: KanjiEntry[] = JSON.parse(jsonData);
      const existingKanjis = overwrite ? [] : await this.getAllKanjis();

      // Fusionner ou remplacer
      const allKanjis = [...existingKanjis];
      let importCount = 0;

      importedKanjis.forEach((importedKanji) => {
        const existingIndex = allKanjis.findIndex(
          (k) => k.kanji === importedKanji.kanji
        );
        if (existingIndex >= 0) {
          if (overwrite) {
            allKanjis[existingIndex] = importedKanji;
            importCount++;
          }
        } else {
          allKanjis.push(importedKanji);
          importCount++;
        }
      });

      await this.saveAllKanjis(allKanjis);
      return importCount;
    } catch (error) {
      console.error("Erreur import kanjis:", error);
      throw error;
    }
  }

  /**
   * Obtient des statistiques sur la collection
   */
  static async getStats(): Promise<{
    totalKanjis: number;
    studiedKanjis: number;
    averageCorrectRate: number;
    lastStudyDate?: Date;
  }> {
    const kanjis = await this.getAllKanjis();
    const studiedKanjis = kanjis.filter(
      (k) => k.studyData && k.studyData.timesStudied > 0
    );

    const totalCorrect = studiedKanjis.reduce(
      (sum, k) => sum + (k.studyData?.correctAnswers || 0),
      0
    );
    const totalAttempts = studiedKanjis.reduce(
      (sum, k) => sum + (k.studyData?.timesStudied || 0),
      0
    );

    const lastStudyDates = studiedKanjis
      .map((k) => k.studyData?.lastStudied)
      .filter(Boolean) as Date[];

    return {
      totalKanjis: kanjis.length,
      studiedKanjis: studiedKanjis.length,
      averageCorrectRate:
        totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0,
      lastStudyDate:
        lastStudyDates.length > 0
          ? new Date(Math.max(...lastStudyDates.map((d) => d.getTime())))
          : undefined,
    };
  }

  /**
   * Sauvegarde tous les kanjis
   */
  private static async saveAllKanjis(kanjis: KanjiEntry[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(kanjis));
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        throw new Error(
          "Espace de stockage insuffisant. Veuillez libérer de l'espace."
        );
      }
      throw error;
    }
  }

  /**
   * Migration des données entre versions
   */
  private static async migrate(fromVersion: string | null): Promise<void> {
    // Ici on ajoutera la logique de migration si nécessaire
    console.log(
      `Migration du stockage depuis ${fromVersion || "nouveau"} vers ${
        this.CURRENT_VERSION
      }`
    );
  }

  /**
   * Efface toutes les données (avec confirmation)
   */
  static async clearAllData(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.VERSION_KEY);
  }
}
