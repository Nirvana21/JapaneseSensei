"use client";

import { KanjiEntry } from "@/types/kanji";

// Interface simplifiée pour les données d'apprentissage
export interface SimpleLearningKanji extends KanjiEntry {
  learningData: {
    score: 0 | 1 | 2 | 3; // 0=Nouveau, 1=Raté/pas connu, 2=Pas trop mal, 3=Vraiment connu
    lastSeen: Date;
    totalAttempts: number;
    correctAttempts: number;
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
  };
}

class SimpleAdaptiveLearningService {
  private readonly PROBABILITY_FACTORS = {
    0: 2.0, // Nouveaux - priorité maximale
    1: 1.66, // Ratés régulièrement
    2: 1.33, // Pas trop mal
    3: 1.0, // Vraiment connus - priorité minimale
  };

  private readonly DEGRADATION_THRESHOLDS = {
    DAYS_TO_DEGRADE_3_TO_2: 7, // 1 semaine sans voir un score 3 → devient 2
    DAYS_TO_DEGRADE_2_TO_1: 14, // 2 semaines sans voir un score 2 → devient 1
    DAYS_TO_DEGRADE_ANY_TO_1: 30, // 1 mois sans voir → devient 1 (minimum)
  };

  /**
   * Initialise un nouveau kanji avec des données d'apprentissage par défaut
   */
  initializeLearningData(kanji: KanjiEntry): SimpleLearningKanji {
    return {
      ...kanji,
      learningData: {
        score: 0, // Nouveau par défaut
        lastSeen: new Date(),
        totalAttempts: 0,
        correctAttempts: 0,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
      },
    };
  }

  /**
   * Met à jour les données d'apprentissage après une réponse
   */
  updateLearningData(
    kanji: SimpleLearningKanji,
    isCorrect: boolean
  ): SimpleLearningKanji {
    const learningData = { ...kanji.learningData };

    learningData.lastSeen = new Date();
    learningData.totalAttempts++;

    if (isCorrect) {
      learningData.correctAttempts++;
      learningData.consecutiveCorrect++;
      learningData.consecutiveIncorrect = 0;

      // Logique d'amélioration du score
      if (learningData.consecutiveCorrect >= 3 && learningData.score < 3) {
        learningData.score = Math.min(3, learningData.score + 1) as
          | 0
          | 1
          | 2
          | 3;
      } else if (
        learningData.consecutiveCorrect >= 2 &&
        learningData.score === 0
      ) {
        learningData.score = 1;
      }
    } else {
      learningData.consecutiveIncorrect++;
      learningData.consecutiveCorrect = 0;

      // Logique de dégradation du score
      if (learningData.consecutiveIncorrect >= 2 && learningData.score > 1) {
        learningData.score = Math.max(1, learningData.score - 1) as
          | 0
          | 1
          | 2
          | 3;
      } else if (learningData.score === 0) {
        learningData.score = 1; // Premier échec d'un nouveau kanji
      }
    }

    return {
      ...kanji,
      learningData,
      studyData: {
        timesStudied: learningData.totalAttempts,
        correctAnswers: learningData.correctAttempts,
        lastStudied: learningData.lastSeen,
        difficulty:
          learningData.score <= 1
            ? "hard"
            : learningData.score === 2
            ? "medium"
            : "easy",
      },
    };
  }

  /**
   * Applique la dégradation temporelle des scores
   */
  applyTemporalDegradation(kanji: SimpleLearningKanji): SimpleLearningKanji {
    const now = new Date();
    const daysSinceLastSeen = Math.floor(
      (now.getTime() - kanji.learningData.lastSeen.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let newScore = kanji.learningData.score;

    // Appliquer la dégradation selon les seuils
    if (
      daysSinceLastSeen >= this.DEGRADATION_THRESHOLDS.DAYS_TO_DEGRADE_ANY_TO_1
    ) {
      newScore = 1; // Après 1 mois, tout descend à 1
    } else if (
      kanji.learningData.score === 3 &&
      daysSinceLastSeen >= this.DEGRADATION_THRESHOLDS.DAYS_TO_DEGRADE_3_TO_2
    ) {
      newScore = 2; // Score 3 devient 2 après 1 semaine
    } else if (
      kanji.learningData.score === 2 &&
      daysSinceLastSeen >= this.DEGRADATION_THRESHOLDS.DAYS_TO_DEGRADE_2_TO_1
    ) {
      newScore = 1; // Score 2 devient 1 après 2 semaines
    }

    if (newScore !== kanji.learningData.score) {
      return {
        ...kanji,
        learningData: {
          ...kanji.learningData,
          score: newScore as 0 | 1 | 2 | 3,
        },
      };
    }

    return kanji;
  }

  /**
   * Sélectionne 20 kanjis pour une session selon les probabilités pondérées
   */
  selectKanjisForSession(
    allKanjis: SimpleLearningKanji[],
    selectedTags: string[] = [],
    sessionSize: number = 20,
    difficultyMode: "normal" | "hard" | "hardcore" = "normal"
  ): SimpleLearningKanji[] {
    // Filtrer par tags si spécifiés
    let availableKanjis = allKanjis;
    if (selectedTags.length > 0) {
      availableKanjis = allKanjis.filter((kanji) =>
        selectedTags.some((tag) => kanji.tags?.includes(tag))
      );
    }

    // Appliquer la dégradation temporelle
    availableKanjis = availableKanjis.map((kanji) =>
      this.applyTemporalDegradation(kanji)
    );

    // Mode hardcore : SEULEMENT les kanjis les moins maîtrisés (score 0-1)
    if (difficultyMode === "hardcore") {
      const hardcoreKanjis = availableKanjis.filter(
        (kanji) => kanji.learningData.score <= 1
      );

      // Si pas assez de kanjis hardcore, on en répète pour remplir la session
      if (hardcoreKanjis.length === 0) {
        console.warn("Aucun kanji hardcore disponible pour la session");
        return [];
      }

      const selected: SimpleLearningKanji[] = [];

      // Prioriser les kanjis score 0 (nouveaux/inconnus) puis score 1 (ratés)
      const score0Kanjis = hardcoreKanjis.filter(
        (k) => k.learningData.score === 0
      );
      const score1Kanjis = hardcoreKanjis.filter(
        (k) => k.learningData.score === 1
      );

      // Pool pondéré pour les répétitions : 70% score 0, 30% score 1
      const weightedHardcorePool: SimpleLearningKanji[] = [];
      score0Kanjis.forEach((kanji) => {
        for (let i = 0; i < 7; i++) weightedHardcorePool.push(kanji); // Poids 7
      });
      score1Kanjis.forEach((kanji) => {
        for (let i = 0; i < 3; i++) weightedHardcorePool.push(kanji); // Poids 3
      });

      // Remplir la session avec répétitions autorisées
      const usedIds = new Set<string>();
      const repetitionCounts = new Map<string, number>();

      while (selected.length < sessionSize && weightedHardcorePool.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * weightedHardcorePool.length
        );
        const candidate = weightedHardcorePool[randomIndex];

        // Autoriser jusqu'à 3 répétitions du même kanji
        const currentCount = repetitionCounts.get(candidate.id) || 0;
        if (currentCount < 3) {
          selected.push(candidate);
          repetitionCounts.set(candidate.id, currentCount + 1);
          usedIds.add(candidate.id);
        }

        // Si tous les kanjis ont été utilisés 3 fois, recommencer
        if (
          usedIds.size === hardcoreKanjis.length &&
          Array.from(repetitionCounts.values()).every((count) => count >= 3)
        ) {
          repetitionCounts.clear(); // Reset pour permettre plus de répétitions
        }
      }

      return this.shuffleArray(selected);
    }

    // Mode difficile : prioriser les kanjis mal maîtrisés (score 0-1)
    if (difficultyMode === "hard") {
      // Filtrer d'abord pour avoir principalement des kanjis difficiles
      const hardKanjis = availableKanjis.filter(
        (kanji) => kanji.learningData.score <= 1
      );
      const mediumKanjis = availableKanjis.filter(
        (kanji) => kanji.learningData.score === 2
      );

      // Si on a assez de kanjis difficiles, en prendre 80% difficiles + 20% moyens
      if (hardKanjis.length >= sessionSize * 0.8) {
        const hardCount = Math.ceil(sessionSize * 0.8);
        const mediumCount = sessionSize - hardCount;

        const selectedHard = this.shuffleArray(hardKanjis).slice(0, hardCount);
        const selectedMedium = this.shuffleArray(mediumKanjis).slice(
          0,
          mediumCount
        );

        return this.shuffleArray([...selectedHard, ...selectedMedium]);
      }

      // Sinon, priorité absolue aux difficiles
      if (hardKanjis.length > 0) {
        availableKanjis = [
          ...hardKanjis,
          ...mediumKanjis,
          ...availableKanjis.filter((k) => k.learningData.score === 3),
        ];
      }
    }

    // Si on a moins de kanjis que la taille de session, retourner tous
    if (availableKanjis.length <= sessionSize) {
      return this.shuffleArray(availableKanjis);
    }

    // Créer un pool pondéré (logique normale ou ajustée pour le mode difficile)
    const weightedPool: SimpleLearningKanji[] = [];

    availableKanjis.forEach((kanji) => {
      let factor = this.PROBABILITY_FACTORS[kanji.learningData.score];

      // En mode difficile, amplifier encore plus les kanjis difficiles
      if (difficultyMode === "hard") {
        if (kanji.learningData.score <= 1) {
          factor *= 3; // Triple la probabilité pour les scores 0-1
        } else if (kanji.learningData.score === 2) {
          factor *= 1.5; // Un peu plus pour les scores 2
        }
        // Les scores 3 gardent leur facteur normal (très faible)
      }

      const weight = Math.ceil(factor * 10); // Multiplier par 10 pour avoir des entiers

      // Ajouter le kanji 'weight' fois dans le pool
      for (let i = 0; i < weight; i++) {
        weightedPool.push(kanji);
      }
    });

    // Sélectionner aléatoirement sans répétition
    const selected: SimpleLearningKanji[] = [];
    const usedIds = new Set<string>();

    while (
      selected.length < sessionSize &&
      usedIds.size < availableKanjis.length
    ) {
      const randomIndex = Math.floor(Math.random() * weightedPool.length);
      const candidate = weightedPool[randomIndex];

      if (!usedIds.has(candidate.id)) {
        selected.push(candidate);
        usedIds.add(candidate.id);
      }
    }

    return this.shuffleArray(selected);
  }

  /**
   * Obtient les tags disponibles dans la collection
   */
  getAvailableTags(kanjis: SimpleLearningKanji[]): string[] {
    const tagSet = new Set<string>();

    kanjis.forEach((kanji) => {
      kanji.tags?.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  /**
   * Obtient des statistiques sur la collection
   */
  getLearningStats(kanjis: SimpleLearningKanji[]) {
    // Appliquer la dégradation temporelle avant le calcul
    const updatedKanjis = kanjis.map((kanji) =>
      this.applyTemporalDegradation(kanji)
    );

    const stats = {
      total: updatedKanjis.length,
      byScore: {
        0: 0, // Nouveaux
        1: 0, // Ratés/pas connus
        2: 0, // Pas trop mal
        3: 0, // Vraiment connus
      },
      needsReview: 0, // Kanjis non vus depuis plus d'une semaine
    };

    const now = new Date();

    updatedKanjis.forEach((kanji) => {
      stats.byScore[kanji.learningData.score]++;

      const daysSinceLastSeen = Math.floor(
        (now.getTime() - kanji.learningData.lastSeen.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastSeen >= 7) {
        stats.needsReview++;
      }
    });

    return stats;
  }

  /**
   * Obtient des statistiques par tag
   */
  getTagStats(kanjis: SimpleLearningKanji[], tag: string) {
    const tagKanjis = kanjis.filter((kanji) => kanji.tags?.includes(tag));
    return this.getLearningStats(tagKanjis);
  }

  /**
   * Vérifie si le mode hardcore est disponible (il faut des kanjis score 0-1)
   */
  isHardcoreModeAvailable(
    allKanjis: SimpleLearningKanji[],
    selectedTags: string[] = []
  ): boolean {
    // Filtrer par tags si spécifiés
    let availableKanjis = allKanjis;
    if (selectedTags.length > 0) {
      availableKanjis = allKanjis.filter((kanji) =>
        selectedTags.some((tag) => kanji.tags?.includes(tag))
      );
    }

    // Appliquer la dégradation temporelle
    availableKanjis = availableKanjis.map((kanji) =>
      this.applyTemporalDegradation(kanji)
    );

    // Vérifier s'il y a des kanjis score 0-1 disponibles
    const hardcoreKanjis = availableKanjis.filter(
      (kanji) => kanji.learningData.score <= 1
    );
    return hardcoreKanjis.length > 0;
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
}

export const simpleAdaptiveLearningService =
  new SimpleAdaptiveLearningService();
