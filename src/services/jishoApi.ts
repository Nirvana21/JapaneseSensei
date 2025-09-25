import { JishoApiResponse, KanjiEntry, JishoEntry } from '@/types/kanji';

// Service pour l'API Jisho (dictionnaire japonais gratuit)
export class JishoApiService {
  private static readonly BASE_URL = 'https://jisho.org/api/v1';
  
  /**
   * Recherche un kanji ou mot dans Jisho
   */
  static async searchKanji(query: string): Promise<JishoEntry[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/search/words?keyword=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Erreur API Jisho: ${response.status}`);
      }
      
      const data: JishoApiResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur lors de la recherche Jisho:', error);
      throw error;
    }
  }
  
  /**
   * Convertit les données Jisho en notre format KanjiEntry
   */
  static convertJishoToKanjiEntry(jishoEntry: JishoEntry, customData?: Partial<KanjiEntry>): KanjiEntry {
    const now = new Date();
    
    // Récupérer le kanji principal (premier élément avec word ou reading)
    const mainJapanese = jishoEntry.japanese[0];
    const kanji = mainJapanese.word || mainJapanese.reading || '';
    
    // Extraire toutes les lectures disponibles dans japanese
    
    // Extraire toutes les significations
    const allMeanings = jishoEntry.senses.flatMap(s => s.english_definitions);
    
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
        difficulty: 'medium'
      },
      ...customData
    };
  }
}

// Service pour enrichir les données avec des informations de kanji détaillées
export class KanjiEnrichmentService {
  /**
   * Enrichit un KanjiEntry avec des données supplémentaires de kanji
   * Utilise des APIs publiques ou des données statiques
   */
  static async enrichKanjiData(entry: KanjiEntry): Promise<KanjiEntry> {
    try {
      // Pour l'instant, on va utiliser une logique simple
      // Plus tard on pourra intégrer KanjiAlive API ou d'autres sources
      
      const enrichedEntry = { ...entry };
      
      // Analyse basique des caractères pour séparer onyomi/kunyomi
      if (entry.kanji.length === 1) {
        // C'est un kanji individuel, on peut essayer d'enrichir
        enrichedEntry.radicals = this.extractRadicals();
      }
      
      return enrichedEntry;
    } catch (error) {
      console.error('Erreur enrichissement kanji:', error);
      return entry;
    }
  }
  
  /**
   * Extraction basique des radicaux (à améliorer plus tard)
   */
  private static extractRadicals(): string[] {
    // Pour l'instant, retour vide
    // Plus tard, on intégrera une vraie base de données de radicaux
    return [];
  }
  
  /**
   * Essaie de deviner les lectures onyomi/kunyomi à partir des données Jisho
   */
  static categorizeReadings(readings: string[]): { onyomi: string[], kunyomi: string[] } {
    const onyomi: string[] = [];
    const kunyomi: string[] = [];
    
    readings.forEach(reading => {
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