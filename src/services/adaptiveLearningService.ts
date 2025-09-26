'use client';

import { KanjiEntry } from '@/types/kanji';

// Interface pour les données d'apprentissage enrichies
export interface LearningKanji extends KanjiEntry {
  learningData: {
    level: 'new' | 'learning' | 'difficult' | 'mastered';
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
    lastSeen: Date;
    nextReview: Date;
    totalReviews: number;
    successRate: number;
    difficulty: number; // 0-1, plus élevé = plus difficile
  };
}

class AdaptiveLearningService {
  private readonly DIFFICULTY_THRESHOLDS = {
    MASTERED: 0.9, // 90% de réussite
    LEARNING: 0.6, // 60% de réussite
    DIFFICULT: 0.4, // Moins de 40% de réussite
  };

  private readonly REVIEW_INTERVALS = {
    NEW: 1, // 1 minute pour les nouveaux
    LEARNING: 10, // 10 minutes pour les en apprentissage
    DIFFICULT: 5, // 5 minutes pour les difficiles (plus fréquent)
    MASTERED: 60, // 1 heure pour les maîtrisés
  };

  /**
   * Initialise les données d'apprentissage pour un kanji
   */
  initializeLearningData(kanji: KanjiEntry): LearningKanji {
    return {
      ...kanji,
      learningData: {
        level: 'new',
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        lastSeen: new Date(),
        nextReview: new Date(Date.now() + this.REVIEW_INTERVALS.NEW * 60000),
        totalReviews: 0,
        successRate: 0,
        difficulty: 0.5, // Commencer avec une difficulté moyenne
      },
    };
  }

  /**
   * Met à jour les données d'apprentissage après une réponse
   */
  updateLearningData(kanji: LearningKanji, isCorrect: boolean): LearningKanji {
    const now = new Date();
    const learningData = { ...kanji.learningData };

    // Mettre à jour les statistiques de base
    learningData.totalReviews++;
    learningData.lastSeen = now;

    if (isCorrect) {
      learningData.consecutiveCorrect++;
      learningData.consecutiveIncorrect = 0;
    } else {
      learningData.consecutiveIncorrect++;
      learningData.consecutiveCorrect = 0;
    }

    // Calculer le nouveau taux de réussite
    const studyData = kanji.studyData || { correctAnswers: 0, timesStudied: 0 };
    const totalCorrect = studyData.correctAnswers + (isCorrect ? 1 : 0);
    const totalAttempts = studyData.timesStudied + 1;
    learningData.successRate = totalCorrect / totalAttempts;

    // Ajuster la difficulté basée sur les performances récentes
    if (isCorrect) {
      learningData.difficulty = Math.max(0, learningData.difficulty - 0.1);
    } else {
      learningData.difficulty = Math.min(1, learningData.difficulty + 0.2);
    }

    // Déterminer le nouveau niveau
    learningData.level = this.calculateLevel(learningData);

    // Calculer le prochain moment de révision
    learningData.nextReview = this.calculateNextReview(learningData, isCorrect);

    return {
      ...kanji,
      learningData,
      studyData: {
        timesStudied: totalAttempts,
        correctAnswers: totalCorrect,
        lastStudied: now,
        difficulty: learningData.difficulty > 0.7 ? 'hard' : 
                   learningData.difficulty > 0.4 ? 'medium' : 'easy'
      }
    };
  }

  /**
   * Calcule le niveau d'apprentissage basé sur les performances
   */
  private calculateLevel(learningData: any): 'new' | 'learning' | 'difficult' | 'mastered' {
    if (learningData.totalReviews === 0) return 'new';
    
    if (learningData.successRate >= this.DIFFICULTY_THRESHOLDS.MASTERED && 
        learningData.consecutiveCorrect >= 3) {
      return 'mastered';
    }
    
    if (learningData.successRate < this.DIFFICULTY_THRESHOLDS.DIFFICULT || 
        learningData.consecutiveIncorrect >= 2) {
      return 'difficult';
    }
    
    return 'learning';
  }

  /**
   * Calcule le prochain moment de révision
   */
  private calculateNextReview(learningData: any, isCorrect: boolean): Date {
    let intervalMinutes: number;

    if (isCorrect) {
      // Augmenter l'intervalle si correct
      switch (learningData.level) {
        case 'new':
          intervalMinutes = this.REVIEW_INTERVALS.LEARNING;
          break;
        case 'learning':
          intervalMinutes = this.REVIEW_INTERVALS.LEARNING * (learningData.consecutiveCorrect + 1);
          break;
        case 'difficult':
          intervalMinutes = this.REVIEW_INTERVALS.LEARNING;
          break;
        case 'mastered':
          intervalMinutes = this.REVIEW_INTERVALS.MASTERED * (learningData.consecutiveCorrect + 1);
          break;
        default:
          intervalMinutes = this.REVIEW_INTERVALS.NEW;
      }
    } else {
      // Réduire l'intervalle si incorrect
      switch (learningData.level) {
        case 'new':
          intervalMinutes = this.REVIEW_INTERVALS.NEW;
          break;
        case 'learning':
        case 'difficult':
          intervalMinutes = this.REVIEW_INTERVALS.DIFFICULT;
          break;
        case 'mastered':
          // Rétrogradé à learning
          intervalMinutes = this.REVIEW_INTERVALS.LEARNING;
          break;
        default:
          intervalMinutes = this.REVIEW_INTERVALS.NEW;
      }
    }

    return new Date(Date.now() + intervalMinutes * 60000);
  }

  /**
   * Sélectionne les kanjis pour une session d'entraînement
   */
  selectKanjisForSession(kanjis: LearningKanji[], maxCount: number = 10): LearningKanji[] {
    const now = new Date();
    
    // Séparer les kanjis par priorité
    const overdue = kanjis.filter(k => k.learningData.nextReview <= now);
    const difficult = kanjis.filter(k => k.learningData.level === 'difficult');
    const learning = kanjis.filter(k => k.learningData.level === 'learning');
    const newKanjis = kanjis.filter(k => k.learningData.level === 'new');
    const mastered = kanjis.filter(k => k.learningData.level === 'mastered');

    // Priorité de sélection
    let selected: LearningKanji[] = [];

    // 1. Prendre les kanjis en retard (priorité absolue)
    selected = selected.concat(overdue.slice(0, maxCount));

    // 2. Compléter avec les difficiles si place disponible
    if (selected.length < maxCount) {
      const remaining = maxCount - selected.length;
      const difficultNotSelected = difficult.filter(k => !selected.includes(k));
      selected = selected.concat(difficultNotSelected.slice(0, Math.min(remaining, Math.ceil(remaining * 0.4))));
    }

    // 3. Ajouter des kanjis en apprentissage
    if (selected.length < maxCount) {
      const remaining = maxCount - selected.length;
      const learningNotSelected = learning.filter(k => !selected.includes(k));
      selected = selected.concat(learningNotSelected.slice(0, Math.min(remaining, Math.ceil(remaining * 0.4))));
    }

    // 4. Ajouter de nouveaux kanjis
    if (selected.length < maxCount) {
      const remaining = maxCount - selected.length;
      const newNotSelected = newKanjis.filter(k => !selected.includes(k));
      selected = selected.concat(newNotSelected.slice(0, Math.min(remaining, Math.ceil(remaining * 0.3))));
    }

    // 5. Compléter avec des kanjis maîtrisés si nécessaire
    if (selected.length < maxCount) {
      const remaining = maxCount - selected.length;
      const masteredNotSelected = mastered.filter(k => !selected.includes(k));
      selected = selected.concat(masteredNotSelected.slice(0, remaining));
    }

    // Mélanger la liste pour éviter la prévisibilité
    return this.shuffleArray(selected);
  }

  /**
   * Mélange un tableau de façon aléatoire
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Obtient des statistiques sur l'apprentissage
   */
  getLearningStats(kanjis: LearningKanji[]) {
    const stats = {
      total: kanjis.length,
      new: 0,
      learning: 0,
      difficult: 0,
      mastered: 0,
      overdue: 0,
    };

    const now = new Date();
    
    kanjis.forEach(kanji => {
      const level = kanji.learningData.level;
      stats[level]++;
      
      if (kanji.learningData.nextReview <= now) {
        stats.overdue++;
      }
    });

    return stats;
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();