import { JishoApiResponse, KanjiEntry, JishoEntry } from "@/types/kanji";

// Service pour l'API Jisho (dictionnaire japonais gratuit)
export class JishoApiService {
  private static readonly BASE_URL = "/api/jisho"; // Utilise notre API route

  /**
   * Recherche un kanji ou mot dans Jisho
   */
  static async searchKanji(query: string): Promise<JishoEntry[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}?keyword=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Erreur API Jisho: ${response.status}`);
      }

      const data: JishoApiResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error("Erreur lors de la recherche Jisho:", error);
      throw error;
    }
  }

  /**
   * Convertit les données Jisho en notre format KanjiEntry
   */
  static convertJishoToKanjiEntry(
    jishoEntry: JishoEntry,
    customData?: Partial<KanjiEntry>
  ): KanjiEntry {
    const now = new Date();

    // Récupérer le kanji principal (premier élément avec word ou reading)
    const mainJapanese = jishoEntry.japanese[0];
    const kanji = mainJapanese.word || mainJapanese.reading || "";

    // Extraire toutes les lectures disponibles dans japanese

    // Extraire toutes les significations
    const allMeanings = jishoEntry.senses.flatMap((s) => s.english_definitions);

    return {
      id: crypto.randomUUID(),
      kanji,
      onyomi: [], // Sera enrichi par l'API KanjiAlive si disponible
      kunyomi: [], // Sera enrichi par l'API KanjiAlive si disponible
      meanings: allMeanings,
      dateAdded: now,
      lastModified: now,
      isCommon: jishoEntry.is_common,
      jlptLevel: jishoEntry.jlpt[0] || undefined,
      studyData: {
        timesStudied: 0,
        correctAnswers: 0,
        difficulty: "medium",
      },
      ...customData,
    };
  }
}

// Service pour enrichir les données avec des informations de kanji détaillées
export class KanjiEnrichmentService {
  /**
   * Enrichit un KanjiEntry avec des données supplémentaires de kanji
   * Décompose les mots composés et récupère les informations des kanjis individuels
   */
  static async enrichKanjiData(entry: KanjiEntry): Promise<KanjiEntry> {
    try {
      const enrichedEntry = { ...entry };

      // Décomposer le mot en kanjis individuels
      const kanjiCharacters = this.extractKanjiCharacters(entry.kanji);

      if (kanjiCharacters.length > 0) {
        // Pour chaque kanji, récupérer les informations détaillées
        const kanjiDetails = await Promise.all(
          kanjiCharacters.map((char) => this.getKanjiDetails(char))
        );

        // Compiler les radicaux/clés
        const allRadicals = kanjiDetails
          .flatMap((details) => details.radicals)
          .filter(Boolean);
        enrichedEntry.radicals = [...new Set(allRadicals)]; // Supprimer les doublons

        // Ajouter des informations de décomposition
        enrichedEntry.kanjiComponents = kanjiCharacters.map((char, index) => {
          const radicalAnalysis = this.analyzeRadicals(char);
          return {
            character: char,
            radicals:
              kanjiDetails[index]?.radicals ||
              radicalAnalysis.map((r) => `${r.radical} (${r.meaning})`),
            meaning: kanjiDetails[index]?.meaning || "",
            strokeCount: kanjiDetails[index]?.strokeCount,
          };
        });

        // Moyenne des traits si c'est un mot composé
        const totalStrokes = kanjiDetails.reduce(
          (sum, details) => sum + (details.strokeCount || 0),
          0
        );
        if (totalStrokes > 0) {
          enrichedEntry.strokeCount = totalStrokes;
        }
      }

      return enrichedEntry;
    } catch (error) {
      console.error("Erreur enrichissement kanji:", error);
      return entry;
    }
  }

  /**
   * Extrait les caractères kanji d'un mot (ignore hiragana/katakana)
   */
  private static extractKanjiCharacters(word: string): string[] {
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    return word.match(kanjiRegex) || [];
  }

  /**
   * Récupère les détails d'un kanji individuel via l'API Jisho
   */
  private static async getKanjiDetails(kanjiChar: string): Promise<{
    radicals: string[];
    meaning: string;
    strokeCount?: number;
  }> {
    try {
      // Rechercher le kanji individuel
      const results = await JishoApiService.searchKanji(kanjiChar);

      if (results.length === 0) {
        return { radicals: [], meaning: "" };
      }

      // Prendre le premier résultat le plus pertinent
      const result =
        results.find((entry) =>
          entry.japanese.some((jp) => jp.word === kanjiChar)
        ) || results[0];

      // Extraire les significations
      const meanings = result.senses.flatMap((s) => s.english_definitions);

      // Pour les radicaux, on utilise les tags qui peuvent contenir cette info
      const radicals = this.extractRadicalsFromTags(result.tags);

      return {
        radicals,
        meaning: meanings[0] || "",
        strokeCount: this.extractStrokeCount(result.tags),
      };
    } catch (error) {
      console.error(`Erreur récupération détails pour ${kanjiChar}:`, error);
      return { radicals: [], meaning: "" };
    }
  }

  /**
   * Extrait les informations de radicaux depuis les tags Jisho
   */
  private static extractRadicalsFromTags(tags: string[]): string[] {
    const radicals: string[] = [];

    // Jisho peut avoir des tags avec des informations de radicaux
    tags.forEach((tag) => {
      // Chercher des patterns comme "radical_X" ou des informations de composition
      if (tag.includes("radical") || tag.includes("component")) {
        radicals.push(tag);
      }
    });

    return radicals;
  }

  /**
   * Extrait le nombre de traits depuis les tags ou autres sources
   */
  private static extractStrokeCount(tags: string[]): number | undefined {
    // Jisho n'a pas toujours cette info directement
    // On pourrait l'ajouter depuis une autre source plus tard
    return undefined;
  }

  /**
   * Base de données basique de radicaux communs
   */
  private static getCommonRadicals(): {
    [key: string]: { name: string; meaning: string };
  } {
    return {
      人: { name: "ninben", meaning: "personne" },
      口: { name: "kuchi", meaning: "bouche" },
      日: { name: "nichi", meaning: "soleil/jour" },
      月: { name: "tsuki", meaning: "lune/mois" },
      木: { name: "ki", meaning: "arbre" },
      水: { name: "mizu", meaning: "eau" },
      火: { name: "hi", meaning: "feu" },
      土: { name: "tsuchi", meaning: "terre" },
      金: { name: "kane", meaning: "métal" },
      手: { name: "te", meaning: "main" },
      心: { name: "kokoro", meaning: "cœur" },
      田: { name: "ta", meaning: "champ" },
      目: { name: "me", meaning: "œil" },
      耳: { name: "mimi", meaning: "oreille" },
      車: { name: "kuruma", meaning: "voiture" },
      魚: { name: "sakana", meaning: "poisson" },
      鳥: { name: "tori", meaning: "oiseau" },
      雨: { name: "ame", meaning: "pluie" },
      風: { name: "kaze", meaning: "vent" },
      食: { name: "shoku", meaning: "manger" },
    };
  }

  /**
   * Analyse les radicaux présents dans un kanji
   */
  static analyzeRadicals(
    kanjiChar: string
  ): Array<{ radical: string; name: string; meaning: string }> {
    const commonRadicals = this.getCommonRadicals();
    const found: Array<{ radical: string; name: string; meaning: string }> = [];

    // Vérifier si le kanji contient des radicaux connus
    Object.keys(commonRadicals).forEach((radical) => {
      if (kanjiChar.includes(radical)) {
        found.push({
          radical,
          name: commonRadicals[radical].name,
          meaning: commonRadicals[radical].meaning,
        });
      }
    });

    return found;
  }

  /**
   * Essaie de deviner les lectures onyomi/kunyomi à partir des données Jisho
   */
  static categorizeReadings(readings: string[]): {
    onyomi: string[];
    kunyomi: string[];
  } {
    const onyomi: string[] = [];
    const kunyomi: string[] = [];

    readings.forEach((reading) => {
      // Règles basiques pour catégoriser les lectures
      // Onyomi sont généralement plus courtes et sans hiragana
      // Kunyomi ont souvent des hiragana

      if (reading.length <= 2 && !/[ひらがな]/.test(reading)) {
        onyomi.push(reading);
      } else {
        kunyomi.push(reading);
      }
    });

    return { onyomi, kunyomi };
  }
}
