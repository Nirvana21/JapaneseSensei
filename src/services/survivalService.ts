import { SimpleLearningKanji } from "./adaptiveLearningService";

export interface SurvivalState {
  level: number;
  streak: number;
  lives: number;
  maxLives: number;
  score: number;
  isGameOver: boolean;
  currentDirection: "jp-to-fr" | "fr-to-jp";
  difficultyMultiplier: number;
}

export interface SurvivalStats {
  bestStreak: number;
  totalSessions: number;
  totalQuestions: number;
  averageStreak: number;
  livesLost: number;
}

class SurvivalService {
  private readonly STORAGE_KEY = "survival_stats";
  private readonly INITIAL_LIVES = 3;

  /**
   * Initialise un nouveau jeu Survival
   */
  initializeGame(): SurvivalState {
    return {
      level: 1,
      streak: 0,
      lives: this.INITIAL_LIVES,
      maxLives: this.INITIAL_LIVES,
      score: 0,
      isGameOver: false,
      currentDirection: Math.random() > 0.5 ? "jp-to-fr" : "fr-to-jp",
      difficultyMultiplier: 1.0,
    };
  }

  /**
   * Calcule les probabilités de sélection selon le niveau
   */
  private getDifficultyDistribution(level: number): {
    easy: number;
    medium: number;
    hard: number;
    unknown: number;
  } {
    // Ramps up sooner to feel progression within the first dozen answers
    if (level <= 1) {
      return { easy: 0.7, medium: 0.3, hard: 0.0, unknown: 0.0 };
    } else if (level <= 3) {
      return { easy: 0.5, medium: 0.4, hard: 0.1, unknown: 0.0 };
    } else if (level <= 6) {
      return { easy: 0.35, medium: 0.45, hard: 0.2, unknown: 0.0 };
    } else if (level <= 10) {
      return { easy: 0.2, medium: 0.45, hard: 0.3, unknown: 0.05 };
    } else {
      return { easy: 0.1, medium: 0.3, hard: 0.4, unknown: 0.2 };
    }
  }

  /**
   * Sélectionne un kanji selon la difficulté progressive
   */
  selectKanjiForSurvival(
    allKanjis: SimpleLearningKanji[],
    level: number
  ): SimpleLearningKanji | null {
    if (allKanjis.length === 0) return null;

    const distribution = this.getDifficultyDistribution(level);

    // Grouper les kanjis par niveau de maîtrise
    const easyKanjis = allKanjis.filter((k) => k.learningData.score === 3);
    const mediumKanjis = allKanjis.filter((k) => k.learningData.score === 2);
    const hardKanjis = allKanjis.filter((k) => k.learningData.score === 1);
    const unknownKanjis = allKanjis.filter((k) => k.learningData.score === 0);

    // Calculer les poids effectifs
    const totalEasy = easyKanjis.length;
    const totalMedium = mediumKanjis.length;
    const totalHard = hardKanjis.length;
    const totalUnknown = unknownKanjis.length;

    // Si pas assez de kanjis dans certaines catégories, redistribuer
    const availableCategories: Array<{
      kanjis: SimpleLearningKanji[];
      weight: number;
    }> = [];

    if (totalEasy > 0)
      availableCategories.push({
        kanjis: easyKanjis,
        weight: distribution.easy,
      });
    if (totalMedium > 0)
      availableCategories.push({
        kanjis: mediumKanjis,
        weight: distribution.medium,
      });
    if (totalHard > 0)
      availableCategories.push({
        kanjis: hardKanjis,
        weight: distribution.hard,
      });
    if (totalUnknown > 0)
      availableCategories.push({
        kanjis: unknownKanjis,
        weight: distribution.unknown,
      });

    if (availableCategories.length === 0) return allKanjis[0];

    // Normaliser les poids
    const totalWeight = availableCategories.reduce(
      (sum, cat) => sum + cat.weight,
      0
    );
    availableCategories.forEach((cat) => (cat.weight /= totalWeight));

    // Sélection pondérée
    const random = Math.random();
    let cumulative = 0;

    for (const category of availableCategories) {
      cumulative += category.weight;
      if (random <= cumulative) {
        const randomIndex = Math.floor(Math.random() * category.kanjis.length);
        return category.kanjis[randomIndex];
      }
    }

    // Fallback
    return availableCategories[0].kanjis[0];
  }

  /**
   * Traite une réponse et met à jour l'état du jeu
   */
  processAnswer(
    currentState: SurvivalState,
    isCorrect: boolean
  ): SurvivalState {
    // Créer un nouvel objet état complètement nouveau
    const newState: SurvivalState = {
      level: currentState.level,
      streak: currentState.streak,
      lives: currentState.lives,
      maxLives: currentState.maxLives,
      score: currentState.score,
      isGameOver: currentState.isGameOver,
      currentDirection: currentState.currentDirection,
      difficultyMultiplier: currentState.difficultyMultiplier,
    };

    if (isCorrect) {
      // Bonne réponse
      newState.streak += 1;
      newState.score += Math.floor(10 * newState.difficultyMultiplier);

      // Augmentation de niveau plus fréquente (tous les 5 bonnes réponses cumulées)
      const newLevel = Math.floor(newState.streak / 5) + 1;
      if (newLevel > newState.level) {
        newState.level = newLevel;
        newState.difficultyMultiplier = 1 + (newLevel - 1) * 0.1; // +10% par niveau
      }
    } else {
      // Mauvaise réponse - FORCAGE de la diminution des vies
      newState.lives = Math.max(0, newState.lives - 1);
      if (newState.lives <= 0) {
        newState.isGameOver = true;
      }
    }

    // Changer la direction aléatoirement pour la prochaine question
    newState.currentDirection = Math.random() > 0.5 ? "jp-to-fr" : "fr-to-jp";

    return newState;
  }

  /**
   * Récupère les statistiques de Survival
   */
  getSurvivalStats(): SurvivalStats {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return {
        bestStreak: 0,
        totalSessions: 0,
        totalQuestions: 0,
        averageStreak: 0,
        livesLost: 0,
      };
    }
    return JSON.parse(stored);
  }

  /**
   * Sauvegarde les statistiques après une session
   */
  saveSurvivalSession(finalState: SurvivalState): void {
    const stats = this.getSurvivalStats();

    // Mettre à jour les stats
    stats.totalSessions += 1;
    stats.totalQuestions += finalState.streak;
    stats.livesLost += this.INITIAL_LIVES - finalState.lives;

    if (finalState.streak > stats.bestStreak) {
      stats.bestStreak = finalState.streak;
    }

    stats.averageStreak = stats.totalQuestions / stats.totalSessions;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
  }

  /**
   * Obtient le message d'encouragement selon le streak
   */
  getEncouragementMessage(streak: number): { emoji: string; message: string } {
    if (streak === 0) {
      return { emoji: "🌱", message: "Premier pas vers la maîtrise !" };
    } else if (streak < 5) {
      return { emoji: "🔥", message: "Bon début ! Continue !" };
    } else if (streak < 10) {
      return { emoji: "⚡", message: "Tu chauffes ! Excellent !" };
    } else if (streak < 20) {
      return { emoji: "🚀", message: "Fantastique ! Tu voles !" };
    } else if (streak < 50) {
      return { emoji: "🌟", message: "Incroyable série ! Maître en devenir !" };
    } else if (streak < 100) {
      return { emoji: "👑", message: "Legendary ! Tu es un vrai sensei !" };
    } else {
      return {
        emoji: "🐉",
        message: "竜 Dragon ! Niveau légendaire atteint !",
      };
    }
  }

  /**
   * Calcule le niveau de difficulté actuel en pourcentage
   */
  getDifficultyPercentage(level: number): number {
    // Avec une progression plus rapide des niveaux, augmenter le pourcentage par niveau
    return Math.min(100, level * 8); // 8% par niveau, max 100%
  }

  /**
   * Obtient la description du niveau actuel
   */
  getLevelDescription(level: number): string {
    if (level === 1) return "初心者 Débutant";
    if (level <= 5) return "学生 Étudiant";
    if (level <= 10) return "練習生 Apprenti";
    if (level <= 20) return "達人 Expert";
    if (level <= 50) return "師範 Maître";
    return "伝説 Légende";
  }
}

export const survivalService = new SurvivalService();
