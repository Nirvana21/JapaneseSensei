// Service pour gérer les données d'entraînement et de performance
import { KanjiEntry } from '@/types/kanji';

// Types pour les données d'entraînement
export interface StudySession {
  id: string;
  kanjiId: string;
  mode: 'fr-to-jp' | 'jp-to-fr';
  correct: boolean;
  timestamp: Date;
  responseTime?: number; // en millisecondes
  drawingData?: string; // données canvas pour le mode fr-to-jp
}

export interface KanjiPerformance {
  kanjiId: string;
  totalSessions: number;
  correctSessions: number;
  lastStudied: Date;
  averageResponseTime?: number;
  difficultyScore: number; // 0 = très facile, 1 = très difficile
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
}

export interface TrainingFilters {
  tags?: string[];
  jlptLevels?: string[];
  grades?: number[];
  difficultyRange?: [number, number]; // [min, max] sur échelle 0-1
  onlyDifficult?: boolean;
  excludeRecent?: boolean; // exclure ceux étudiés récemment
}

const STORAGE_KEYS = {
  STUDY_SESSIONS: 'japaneseSensei_studySessions',
  KANJI_PERFORMANCES: 'japaneseSensei_kanjiPerformances'
};

export class TrainingService {
  
  /**
   * Sauvegarde une session d'entraînement
   */
  static async saveStudySession(session: Omit<StudySession, 'id' | 'timestamp'>): Promise<StudySession> {
    try {
      const fullSession: StudySession = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...session
      };

      // Récupérer les sessions existantes
      const existingSessions = await this.getStudySessions();
      const updatedSessions = [...existingSessions, fullSession];

      // Garder seulement les 1000 dernières sessions pour éviter le surcharge
      const limitedSessions = updatedSessions.slice(-1000);

      // Sauvegarder
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(limitedSessions));

      // Mettre à jour les performances du kanji
      await this.updateKanjiPerformance(session.kanjiId, session.correct, session.responseTime);

      return fullSession;
    } catch (error) {
      console.error('Erreur sauvegarde session d\'entraînement:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les sessions d'entraînement
   */
  static async getStudySessions(): Promise<StudySession[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      if (!data) return [];

      const sessions = JSON.parse(data);
      return sessions.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp)
      }));
    } catch (error) {
      console.error('Erreur récupération sessions:', error);
      return [];
    }
  }

  /**
   * Met à jour les performances d'un kanji
   */
  static async updateKanjiPerformance(
    kanjiId: string, 
    wasCorrect: boolean, 
    responseTime?: number
  ): Promise<void> {
    try {
      const performances = await this.getKanjiPerformances();
      const existing = performances.find(p => p.kanjiId === kanjiId);

      if (existing) {
        // Mettre à jour les performances existantes
        existing.totalSessions++;
        if (wasCorrect) {
          existing.correctSessions++;
          existing.consecutiveCorrect++;
          existing.consecutiveIncorrect = 0;
        } else {
          existing.consecutiveIncorrect++;
          existing.consecutiveCorrect = 0;
        }
        existing.lastStudied = new Date();

        // Recalculer le score de difficulté (0 = facile, 1 = difficile)
        const successRate = existing.correctSessions / existing.totalSessions;
        existing.difficultyScore = 1 - successRate;

        // Mettre à jour le temps de réponse moyen
        if (responseTime && existing.averageResponseTime) {
          existing.averageResponseTime = (existing.averageResponseTime + responseTime) / 2;
        } else if (responseTime) {
          existing.averageResponseTime = responseTime;
        }
      } else {
        // Créer nouvelles performances
        const newPerformance: KanjiPerformance = {
          kanjiId,
          totalSessions: 1,
          correctSessions: wasCorrect ? 1 : 0,
          lastStudied: new Date(),
          difficultyScore: wasCorrect ? 0.2 : 0.8,
          consecutiveCorrect: wasCorrect ? 1 : 0,
          consecutiveIncorrect: wasCorrect ? 0 : 1,
          averageResponseTime: responseTime
        };
        performances.push(newPerformance);
      }

      // Sauvegarder
      localStorage.setItem(STORAGE_KEYS.KANJI_PERFORMANCES, JSON.stringify(performances));
    } catch (error) {
      console.error('Erreur mise à jour performances:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les performances de kanjis
   */
  static async getKanjiPerformances(): Promise<KanjiPerformance[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KANJI_PERFORMANCES);
      if (!data) return [];

      const performances = JSON.parse(data);
      return performances.map((perf: any) => ({
        ...perf,
        lastStudied: new Date(perf.lastStudied)
      }));
    } catch (error) {
      console.error('Erreur récupération performances:', error);
      return [];
    }
  }

  /**
   * Recommande des kanjis pour l'entraînement basé sur les performances
   */
  static async recommendKanjisForTraining(
    availableKanjis: KanjiEntry[], 
    filters: TrainingFilters = {},
    count: number = 20
  ): Promise<KanjiEntry[]> {
    try {
      const performances = await this.getKanjiPerformances();
      
      // Filtrer les kanjis selon les critères
      let filteredKanjis = availableKanjis.filter(kanji => {
        // Filtre par tags
        if (filters.tags && filters.tags.length > 0) {
          if (!kanji.tags || !filters.tags.some(tag => kanji.tags!.includes(tag))) {
            return false;
          }
        }

        // Filtre par niveaux JLPT
        if (filters.jlptLevels && filters.jlptLevels.length > 0) {
          if (!kanji.jlptLevel || !filters.jlptLevels.includes(kanji.jlptLevel)) {
            return false;
          }
        }

        // Filtre par grades scolaires
        if (filters.grades && filters.grades.length > 0) {
          if (!kanji.grade || !filters.grades.includes(kanji.grade)) {
            return false;
          }
        }

        return true;
      });

      // Associer les performances aux kanjis
      const kanjisWithScores = filteredKanjis.map(kanji => {
        const performance = performances.find(p => p.kanjiId === kanji.id);
        
        let priorityScore = 0.5; // Score par défaut pour les nouveaux kanjis

        if (performance) {
          // Plus le kanji est difficile, plus le score est élevé
          priorityScore = performance.difficultyScore;

          // Bonus pour les kanjis pas étudiés récemment
          const daysSinceLastStudy = (Date.now() - performance.lastStudied.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceLastStudy > 3) priorityScore += 0.2;

          // Malus pour les erreurs consécutives (ne pas marteler)
          if (performance.consecutiveIncorrect > 3) priorityScore -= 0.3;

          // Bonus pour les kanjis jamais réussis
          if (performance.correctSessions === 0 && performance.totalSessions > 0) {
            priorityScore += 0.3;
          }
        }

        return {
          kanji,
          priorityScore: Math.max(0, Math.min(1, priorityScore)) // Garder entre 0 et 1
        };
      });

      // Filtrer par plage de difficulté si spécifiée
      let scoredKanjis = kanjisWithScores;
      if (filters.difficultyRange) {
        const [min, max] = filters.difficultyRange;
        scoredKanjis = kanjisWithScores.filter(
          item => item.priorityScore >= min && item.priorityScore <= max
        );
      }

      // Filtrer seulement les difficiles si demandé
      if (filters.onlyDifficult) {
        scoredKanjis = scoredKanjis.filter(item => item.priorityScore > 0.7);
      }

      // Exclure les récents si demandé
      if (filters.excludeRecent) {
        const recentKanjiIds = new Set(
          performances
            .filter(p => (Date.now() - p.lastStudied.getTime()) < (1000 * 60 * 60 * 24)) // moins de 24h
            .map(p => p.kanjiId)
        );
        scoredKanjis = scoredKanjis.filter(item => !recentKanjiIds.has(item.kanji.id));
      }

      // Trier par score de priorité (plus élevé en premier) avec un peu de randomisation
      scoredKanjis.sort((a, b) => {
        const randomFactor = (Math.random() - 0.5) * 0.2; // ±0.1 de randomisation
        return (b.priorityScore - a.priorityScore) + randomFactor;
      });

      // Retourner les kanjis recommandés
      return scoredKanjis.slice(0, count).map(item => item.kanji);
    } catch (error) {
      console.error('Erreur recommandation kanjis:', error);
      // En cas d'erreur, retourner un mélange aléatoire
      return availableKanjis.sort(() => Math.random() - 0.5).slice(0, count);
    }
  }

  /**
   * Obtient les statistiques globales d'entraînement
   */
  static async getTrainingStats() {
    try {
      const sessions = await this.getStudySessions();
      const performances = await this.getKanjiPerformances();

      const totalSessions = sessions.length;
      const correctSessions = sessions.filter(s => s.correct).length;
      const averageSuccessRate = totalSessions > 0 ? (correctSessions / totalSessions) : 0;

      const studiedKanjis = performances.length;
      const averageDifficulty = performances.length > 0 
        ? performances.reduce((sum, p) => sum + p.difficultyScore, 0) / performances.length
        : 0;

      const recentSessions = sessions.filter(
        s => (Date.now() - s.timestamp.getTime()) < (1000 * 60 * 60 * 24 * 7) // 7 jours
      );

      return {
        totalSessions,
        correctSessions,
        averageSuccessRate,
        studiedKanjis,
        averageDifficulty,
        recentSessionsCount: recentSessions.length,
        lastStudyDate: sessions.length > 0 ? sessions[sessions.length - 1].timestamp : null
      };
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      return {
        totalSessions: 0,
        correctSessions: 0,
        averageSuccessRate: 0,
        studiedKanjis: 0,
        averageDifficulty: 0,
        recentSessionsCount: 0,
        lastStudyDate: null
      };
    }
  }
}