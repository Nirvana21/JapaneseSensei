"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useKanjis } from "../../hooks/useKanjis";
import SwipeCard from "../../components/SwipeCard";
import KanjiCanvas from "../../components/KanjiCanvas";
import KanjiDetailModal from "../../components/KanjiDetailModal";
import SessionCompleteModal from "../../components/SessionCompleteModal";
import TagSelector from "../../components/TagSelector";
import SurvivalCard from "../../components/SurvivalCard";
import SurvivalHUD from "../../components/SurvivalHUD";
import SurvivalGameOverModal from "../../components/SurvivalGameOverModal";
import {
  simpleAdaptiveLearningService,
  SimpleLearningKanji,
} from "../../services/adaptiveLearningService";
import {
  survivalService,
  SurvivalState,
  SurvivalStats,
} from "../../services/survivalService";
import { ALL_JLPT_KANJI } from "../../data/jlptData";
import { KanjiEntry } from "../../types/kanji";

/** Converts a JLPT entry to a minimal KanjiEntry for use in training */
function jlptToKanjiEntry(j: (typeof ALL_JLPT_KANJI)[0]): KanjiEntry {
  return {
    id: `jlpt-${j.kanji}`,
    kanji: j.kanji,
    onyomi: j.onyomi,
    kunyomi: j.kunyomi,
    meanings: j.meanings,
    primaryMeaning: j.meanings[0],
    primaryReading: j.onyomi[0] ?? j.kunyomi[0],
    tags: j.tags ?? [],
    strokeCount: j.strokeCount,
    jlptLevel: j.level,
    dateAdded: new Date(0),
    lastModified: new Date(0),
  };
}

// Composant interne qui utilise useSearchParams
function TrainingPageContent() {
  const searchParams = useSearchParams();
  const { kanjis } = useKanjis();

  // États généraux
  const [allLearningKanjis, setAllLearningKanjis] = useState<SimpleLearningKanji[]>([]);
  const [selectedKanjis, setSelectedKanjis] = useState<SimpleLearningKanji[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0, sessionComplete: false });
  const [trainingMode, setTrainingMode] = useState<"fr-to-jp" | "jp-to-fr">("fr-to-jp");
  const [difficultyMode, setDifficultyMode] = useState<"normal" | "hard" | "hardcore">("normal");
  const [isHardcoreModeAvailable, setIsHardcoreModeAvailable] = useState(false);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [clearCanvas, setClearCanvas] = useState(0);
  const [gameMode, setGameMode] = useState<'normal' | 'survival'>('normal');
  
  // États pour les modaux
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<SimpleLearningKanji | null>(null);

  // États pour le mode Survival
  const [survivalState, setSurvivalState] = useState<SurvivalState | null>(null);
  const [survivalStats, setSurvivalStats] = useState<SurvivalStats | null>(null);
  const [currentSurvivalKanji, setCurrentSurvivalKanji] = useState<SimpleLearningKanji | null>(null);
  const [survivalStrokeScale, setSurvivalStrokeScale] = useState(1);
  const [trainingStrokeScale, setTrainingStrokeScale] = useState(1);

  // Initialisation au montage
  useEffect(() => {
    // Si la collection personnelle est vide, utiliser les kanjis JLPT N5+N4
    const baseKanjis: KanjiEntry[] =
      kanjis.length > 0 ? kanjis : ALL_JLPT_KANJI.map(jlptToKanjiEntry);

    const learningKanjis = baseKanjis.map((kanji) => {
      const savedData = localStorage.getItem(`simple_learning_${kanji.id}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          ...kanji,
          learningData: parsed.learningData,
          studyData: parsed.studyData || kanji.studyData,
        };
      }
      return simpleAdaptiveLearningService.initializeLearningData(kanji);
    });

    setAllLearningKanjis(learningKanjis);
    const tags = simpleAdaptiveLearningService.getAvailableTags(learningKanjis);
    setAvailableTags(tags);

    if (learningKanjis.length > 0) {
      generateNewSession(learningKanjis, []);
    }

    // Charger le mode survival si demandé dans l'URL
    const mode = searchParams.get('mode');
    if (mode === 'survival' && learningKanjis.length > 0) {
      setGameMode('survival');
      const newSurvivalState = survivalService.initializeGame();
      setSurvivalState(newSurvivalState);
      setSurvivalStats(survivalService.getSurvivalStats());
      const firstKanji = survivalService.selectKanjiForSurvival(learningKanjis, 1);
      setCurrentSurvivalKanji(firstKanji);
    }
  }, [searchParams, kanjis]);

  // Générer une nouvelle session selon les tags sélectionnés
  const generateNewSession = (
    allKanjis: SimpleLearningKanji[],
    tags: string[],
    mode?: "normal" | "hard" | "hardcore"
  ) => {
    // Filtrer les kanjis par tags si spécifiés
    let availableKanjis = allKanjis;
    if (tags.length > 0) {
      availableKanjis = allKanjis.filter((kanji) =>
        tags.some((tag) => kanji.tags?.includes(tag))
      );
    }

    const maxPossible = availableKanjis.length;
    const sessionSize = Math.min(20, maxPossible);

    // Utiliser le mode passé en paramètre ou celui du state
    const currentMode = mode || difficultyMode;
    const sessionKanjis = simpleAdaptiveLearningService.selectKanjisForSession(
      allKanjis,
      tags,
      sessionSize,
      currentMode
    );
    setSelectedKanjis(sessionKanjis);
    setCurrentIndex(0);
    setShowAnswer(false);
    setStats({ correct: 0, total: 0, sessionComplete: false });

    // Calculer les nouvelles statistiques
    const stats = simpleAdaptiveLearningService.getLearningStats(allKanjis);
    setLearningStats(stats);

    // Vérifier la disponibilité du mode hardcore
    const hardcoreAvailable =
      simpleAdaptiveLearningService.isHardcoreModeAvailable(allKanjis, tags);
    setIsHardcoreModeAvailable(hardcoreAvailable);

    // Si le mode hardcore n'est plus disponible et qu'on était en hardcore, basculer en hard
    const finalMode =
      currentMode === "hardcore" && !hardcoreAvailable ? "hard" : currentMode;
    if (finalMode !== currentMode) {
      setDifficultyMode(finalMode);
    }
  };

  // Gestionnaire pour les changements de tags
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    generateNewSession(allLearningKanjis, tags);
  };

  // Gestionnaire pour le changement de mode de difficulté
  const handleDifficultyModeChange = (mode: "normal" | "hard" | "hardcore") => {
    // Vérifier si le mode hardcore est disponible avant de l'activer
    if (mode === "hardcore" && !isHardcoreModeAvailable) {
      console.warn(
        "Mode hardcore non disponible - tous les kanjis sont maîtrisés !"
      );
      return;
    }

    setDifficultyMode(mode);
    // Passer le nouveau mode directement pour éviter les problèmes de timing du state
    generateNewSession(allLearningKanjis, selectedTags, mode);
  };

  const handleSwipe = (direction: "left" | "right") => {
    // Empêcher les swipes si la session est déjà terminée
    if (stats.sessionComplete) {
      return;
    }

    const isCorrect = direction === "right";
    const currentKanji = selectedKanjis[currentIndex];

    // Mettre à jour les statistiques de session
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      total: stats.total + 1,
      sessionComplete: false,
    };

    // Déclencher le nettoyage du canvas
    setClearCanvas((prev) => prev + 1);

    // Mettre à jour les données d'apprentissage du kanji
    const updatedKanji = simpleAdaptiveLearningService.updateLearningData(
      currentKanji,
      isCorrect
    );

    // Sauvegarder les données d'apprentissage
    localStorage.setItem(
      `simple_learning_${updatedKanji.id}`,
      JSON.stringify({
        learningData: updatedKanji.learningData,
        studyData: updatedKanji.studyData,
      })
    );

    // Mettre à jour la liste des kanjis
    const updatedAllKanjis = allLearningKanjis.map((k) =>
      k.id === updatedKanji.id ? updatedKanji : k
    );
    setAllLearningKanjis(updatedAllKanjis);

    // Mettre à jour les statistiques
    const learningStatsUpdate =
      simpleAdaptiveLearningService.getLearningStats(updatedAllKanjis);
    setLearningStats(learningStatsUpdate);

    // Vérifier si c'est la fin de session (on vient de répondre à la dernière carte)
    // La session est terminée quand le nombre total de réponses égale le nombre de cartes
    if (newStats.total >= selectedKanjis.length) {
      // Fin de session - marquer comme terminée
      setStats({
        ...newStats,
        sessionComplete: true,
      });
      // Ne pas incrémenter currentIndex pour rester sur la dernière carte
    } else {
      // Continuer la session - passer à la carte suivante
      setStats(newStats);
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const openModal = (kanji: SimpleLearningKanji) => {
    setSelectedKanji(kanji);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedKanji(null);
  };

  const startNewSession = () => {
    generateNewSession(allLearningKanjis, selectedTags);
  };

  const closeSessionModal = () => {
    // Optionnel: remettre à zéro pour permettre un nouveau modal
    setStats((prev) => ({ ...prev, sessionComplete: false }));
  };

  // (logs de debug retirés)

  // ===== FONCTIONS MODE SURVIVAL =====
  
  const startSurvivalMode = () => {
    if (allLearningKanjis.length === 0) return;
    
    setGameMode('survival');
    const newSurvivalState = survivalService.initializeGame();
    setSurvivalState(newSurvivalState);
    setSurvivalStats(survivalService.getSurvivalStats());
    
    // Sélectionner le premier kanji
    const firstKanji = survivalService.selectKanjiForSurvival(allLearningKanjis, 1);
    setCurrentSurvivalKanji(firstKanji);
  };

  const handleSurvivalAnswer = (isCorrect: boolean) => {
    if (!survivalState || !currentSurvivalKanji) return;

    // Mettre à jour les données d'apprentissage du kanji
    const updatedKanji = simpleAdaptiveLearningService.updateLearningData(
      currentSurvivalKanji, 
      isCorrect
    );
    
    // Sauvegarder les données d'apprentissage
    localStorage.setItem(`simple_learning_${updatedKanji.id}`, JSON.stringify({
      learningData: updatedKanji.learningData,
      studyData: updatedKanji.studyData
    }));

    // Mettre à jour la liste des kanjis
    const updatedAllKanjis = allLearningKanjis.map(k => 
      k.id === updatedKanji.id ? updatedKanji : k
    );
    setAllLearningKanjis(updatedAllKanjis);

    // Traiter la réponse dans le contexte Survival
  const newSurvivalState = survivalService.processAnswer(survivalState, isCorrect);
    
    // Force React à détecter le changement en créant un nouvel objet
    setSurvivalState({...newSurvivalState});

    // Déclencher le nettoyage du canvas
    setClearCanvas(prev => prev + 1);

    if (newSurvivalState.isGameOver) {
      // Fin du jeu - sauvegarder les stats
      survivalService.saveSurvivalSession(newSurvivalState);
      setSurvivalStats(survivalService.getSurvivalStats());
    } else {
      // Continuer - sélectionner le prochain kanji
      const nextKanji = survivalService.selectKanjiForSurvival(
        updatedAllKanjis, 
        newSurvivalState.level
      );
      setCurrentSurvivalKanji(nextKanji);
    }
  };

  const exitSurvivalMode = () => {
    setGameMode('normal');
    setSurvivalState(null);
    setCurrentSurvivalKanji(null);
  };

  const startNewSurvivalGame = () => {
    if (allLearningKanjis.length === 0) return;
    
    const newSurvivalState = survivalService.initializeGame();
    setSurvivalState(newSurvivalState);
    
    // Sélectionner le premier kanji
    const firstKanji = survivalService.selectKanjiForSurvival(allLearningKanjis, 1);
    setCurrentSurvivalKanji(firstKanji);
  };

  if (selectedKanjis.length === 0 && allLearningKanjis.length === 0) {
    return (
      <div className="min-h-screen bg-[#100c08] text-[#f5ede0]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.08] max-w-md">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-white/[0.08] shadow-md">
              <img
                src="/sprites/logo_lecteur.png"
                alt="Collection vide"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-[#f5ede0] mb-4">
              コレクション空 Collection vide
            </h2>
            <p className="text-[#f5ede0]/60 mb-6">
              Ajoutez des kanjis depuis la page d'accueil pour commencer
              l'entraînement.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#c41e1e] text-[#f5ede0] font-semibold rounded-xl shadow-lg hover:bg-[#c41e1e]/80 transition-all duration-200"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden bg-white/[0.10]">
                <img
                  src="/sprites/logo_maison.png"
                  alt="Retour au menu"
                  className="w-full h-full object-cover"
                />
              </span>
              <span>戻る Menu</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentKanji = selectedKanjis[currentIndex];

  return (
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0]">
      {/* Header zen avec sélecteur de tags */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Première ligne : Navigation et titre */}
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.10] text-[#f5ede0] font-medium rounded-lg transition-colors border border-white/[0.10]"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden bg-white/[0.08]">
                <img
                  src="/sprites/logo_maison.png"
                  alt="Menu principal"
                  className="w-full h-full object-cover"
                />
              </span>
              <span className="hidden sm:inline">戻る Menu</span>
            </Link>

            <h1 className="text-xl font-bold text-red-800 text-center flex flex-col items-center gap-1">
              <span className="inline-flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-2xl overflow-hidden bg-red-200/90">
                  <img
                    src="/sprites/logo_sport.png"
                    alt="Mode entraînement"
                    className="w-full h-full object-cover"
                  />
                </span>
                <span>
                  練習 Entraînement ({selectedKanjis.length} carte
                  {selectedKanjis.length > 1 ? "s" : ""})
                </span>
              </span>
              {selectedKanjis.length < 20 && (
                  <span className="text-sm text-[#f5ede0]/50 block">
                  ℹ️ Toutes les cartes disponibles incluses
                </span>
              )}
            </h1>

            <button
              onClick={startNewSession}
              className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
            >
              🔄 新セッション
            </button>
          </div>

          {/* Deuxième ligne : Contrôles zen - uniquement en mode normal */}
          {gameMode === 'normal' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={trainingMode}
                onChange={(e) =>
                  setTrainingMode(e.target.value as "fr-to-jp" | "jp-to-fr")
                }
                className="px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-lg text-sm font-medium text-[#f5ede0] focus:outline-none focus:ring-2 focus:ring-[#c41e1e]"
              >
                <option value="fr-to-jp">🇫🇷 → 🇯🇵</option>
                <option value="jp-to-fr">🇯🇵 → 🇫🇷</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl overflow-hidden bg-white/[0.08]">
                  <img
                    src={
                      difficultyMode === "normal"
                        ? "/sprites/logo_party.png"
                        : difficultyMode === "hard"
                        ? "/sprites/logo_gamer.png"
                        : "/sprites/logo_colere.png"
                    }
                    alt={
                      difficultyMode === "normal"
                        ? "Mode normal (party)"
                        : difficultyMode === "hard"
                        ? "Mode difficile (gamer)"
                        : "Mode hardcore (colère)"
                    }
                    className="w-full h-full object-cover"
                  />
                </span>
                <select
                  value={difficultyMode}
                  onChange={(e) =>
                    handleDifficultyModeChange(
                      e.target.value as "normal" | "hard" | "hardcore"
                    )
                  }
                  className={`px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-lg text-sm font-medium text-[#f5ede0] focus:outline-none focus:ring-2 transition-all ${
                    difficultyMode === "hardcore"
                      ? "focus:ring-purple-500 border-purple-500/50"
                      : "focus:ring-[#c41e1e]"
                  }`}
                >
                  <option value="normal">普通 Normal</option>
                  <option value="hard">難しい Difficile</option>
                  <option
                    value="hardcore"
                    disabled={!isHardcoreModeAvailable}
                    className={
                      !isHardcoreModeAvailable
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    HARDCORE {""}
                    {!isHardcoreModeAvailable ? "(tout maîtrisé!)" : ""}
                  </option>
                </select>
              </div>
            </div>

            {/* Statistiques centrées zen - masquées pendant la session */}
            <div className="flex items-center gap-3">
                {/* Score masqué pendant la session pour éviter de spoiler */}
                {stats.sessionComplete && (
                  <div className="px-3 py-1 bg-green-100/90 text-green-700 rounded-lg text-sm border border-green-300/50">
                    ✅ {stats.correct}/{stats.total}
                  </div>
                )}
                <div className="px-3 py-1 bg-blue-100/90 text-blue-700 rounded-lg text-sm border border-blue-300/50">
                  📈 {currentIndex + 1}/{selectedKanjis.length}
                </div>
              </div>

              {/* Progression visuelle zen */}
              <div className="hidden sm:block w-24">
                <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-600 transition-all duration-300"
                    style={{
                      width: `${
                        ((currentIndex + 1) / selectedKanjis.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Troisième ligne : Statistiques d'apprentissage zen - uniquement en mode normal */}
          {gameMode === 'normal' && learningStats && (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 text-xs">
                <div className="px-2 py-1 bg-blue-100/90 text-blue-700 rounded border border-blue-300/50 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-blue-200/80">
                    <img
                      src="/sprites/logo_sans_fond.png"
                      alt="Nouveaux kanjis"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span>{learningStats.byScore[0]}</span>
                </div>
                  <div className="px-2 py-1 bg-red-900/20 text-red-400 rounded border border-red-500/30 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-red-200/80">
                    <img
                      src="/sprites/logo_triste.png"
                      alt="Kanjis difficiles"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span>{learningStats.byScore[1]}</span>
                </div>
                  <div className="px-2 py-1 bg-[#c9a84c]/10 text-[#c9a84c]/80 rounded border border-[#c9a84c]/20 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-yellow-200/80">
                    <img
                      src="/sprites/logo_sport.png"
                      alt="Kanjis en entraînement"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span>{learningStats.byScore[2]}</span>
                </div>
                  <div className="px-2 py-1 bg-green-900/20 text-green-400 rounded border border-green-500/30 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-green-200/80">
                    <img
                      src="/sprites/logo_victoire.png"
                      alt="Kanjis maîtrisés"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span>{learningStats.byScore[3]}</span>
                </div>
                {learningStats.needsReview > 0 && (
                  <div className="px-2 py-1 bg-[#c41e1e]/20 text-[#c41e1e]/80 rounded border border-[#c41e1e]/30 animate-pulse">
                    ⏰ {learningStats.needsReview}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      {/* Sélecteur de tags */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <TagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
        />
      </div>
      {/* Zone principale d'entraînement */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* MODE SURVIVAL */}
        {gameMode === 'survival' && survivalState && currentSurvivalKanji && (
          <div className="animate-fade-in">
            {/* HUD Survival */}
            <SurvivalHUD 
              survivalState={survivalState}
              encouragementMessage={survivalService.getEncouragementMessage(survivalState.streak)}
            />
            
            {/* Carte Survival */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-full max-w-lg">
                <SurvivalCard
                  kanji={currentSurvivalKanji}
                  direction={survivalState.currentDirection}
                  onAnswer={handleSurvivalAnswer}
                  disabled={survivalState.isGameOver}
                  clearCanvas={clearCanvas}
                  onClearCanvas={() => setClearCanvas(prev => prev + 1)}
                  strokeScale={survivalStrokeScale}
                />
                
                {/* Bouton effacer en dehors de la carte pour éviter les conflits */}
                {survivalState.currentDirection === 'fr-to-jp' && (
                  <div className="flex flex-col items-center gap-2 mt-3">
                    <div className="inline-flex items-center gap-1 bg-white/[0.06] rounded-lg p-1 border border-white/[0.08]">
                      <button
                        onClick={() => setSurvivalStrokeScale(0.8)}
                        className={`px-3 py-1 text-sm rounded-md ${ survivalStrokeScale < 0.9 ? 'bg-white/[0.12] text-[#f5ede0] shadow-sm' : 'text-[#f5ede0]/50 hover:bg-white/[0.08]'}`}
                        aria-label="Trait fin"
                      >
                        Fin
                      </button>
                      <button
                        onClick={() => setSurvivalStrokeScale(1)}
                        className={`px-3 py-1 text-sm rounded-md ${ survivalStrokeScale >= 0.9 && survivalStrokeScale < 1.15 ? 'bg-white/[0.12] text-[#f5ede0] shadow-sm' : 'text-[#f5ede0]/50 hover:bg-white/[0.08]'}`}
                        aria-label="Trait moyen"
                      >
                        Moyen
                      </button>
                      <button
                        onClick={() => setSurvivalStrokeScale(1.3)}
                        className={`px-3 py-1 text-sm rounded-md ${ survivalStrokeScale >= 1.15 ? 'bg-white/[0.12] text-[#f5ede0] shadow-sm' : 'text-[#f5ede0]/50 hover:bg-white/[0.08]'}`}
                        aria-label="Trait épais"
                      >
                        Épais
                      </button>
                    </div>
                    <button
                      onClick={() => setClearCanvas(prev => prev + 1)}
                      className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.10] text-[#f5ede0]/70 text-sm rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      🗑️ Effacer le dessin
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Boutons d'action Survival */}
            <div className="flex justify-center gap-4 mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <button
                onClick={exitSurvivalMode}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-[#f5ede0] font-medium rounded-lg transition-all"
              >
                ↩️ Quitter Survival
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#c41e1e] text-[#f5ede0] font-medium rounded-lg hover:bg-[#c41e1e]/80 transition-all"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden bg-white/[0.08]">
                  <img
                    src="/sprites/logo_maison.png"
                    alt="Menu principal"
                    className="w-full h-full object-cover"
                  />
                </span>
                <span>Menu</span>
              </Link>
            </div>
          </div>
        )}

        {/* MODE NORMAL */}
        {gameMode === 'normal' && selectedKanjis.length > 0 && currentKanji && (
          <>
            {/* Carte flashcard */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <SwipeCard
                onSwipeLeft={() => handleSwipe("left")}
                onSwipeRight={() => handleSwipe("right")}
                onTap={() => setShowAnswer(!showAnswer)}
                className="w-full max-w-lg"
              >
                <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-white/[0.08]">
                  {trainingMode === "fr-to-jp" ? (
                    // Mode: Français → Japonais
                    <div className="text-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] rounded-full mb-4 border border-white/[0.10]">
                          <span className="text-lg">🇫🇷</span>
                          <span className="text-sm font-medium text-[#f5ede0]/60">
                            翻訳してください
                          </span>
                          <span className="text-lg">🇯🇵</span>
                        </div>
                        <p className="text-2xl sm:text-4xl font-bold text-[#f5ede0] leading-relaxed">
                          {currentKanji.primaryMeaning ||
                            currentKanji.meanings[0]}
                        </p>
                      </div>

                      {showAnswer && (
                        <div className="space-y-4">
                          {/* Score et difficulté */}
                          <div className="flex justify-center mb-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.06] rounded-lg border border-white/[0.10]">
                              <span className="text-xs text-[#f5ede0]/40">
                                スコア Score:
                              </span>
                              <div
                                className={`flex items-center gap-1.5 text-sm font-medium ${
                                  currentKanji.learningData.score === 0
                                    ? "text-blue-600"
                                    : currentKanji.learningData.score === 1
                                    ? "text-red-600"
                                    : currentKanji.learningData.score === 2
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }`}
                              >
                                {currentKanji.learningData.score === 0 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-blue-200/80">
                                    <img
                                      src="/sprites/logo_sans_fond.png"
                                      alt="Nouveau kanji"
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                {currentKanji.learningData.score === 1 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-red-200/80">
                                    <img
                                      src="/sprites/logo_triste.png"
                                      alt="Kanji difficile"
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                {currentKanji.learningData.score === 2 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-yellow-200/80">
                                    <img
                                      src="/sprites/logo_sport.png"
                                      alt="Kanji en entraînement"
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                {currentKanji.learningData.score === 3 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-green-200/80">
                                    <img
                                      src="/sprites/logo_victoire.png"
                                      alt="Kanji maîtrisé"
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                <span>{currentKanji.learningData.score}/3</span>
                              </div>
                            </div>
                          </div>

                          {/* Kanji cliquable */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(currentKanji);
                            }}
                            data-no-tap="true"
                            className="w-full p-4 bg-white/[0.06] hover:bg-white/[0.10] rounded-xl border border-white/[0.10] hover:border-white/[0.20] transition-all group"
                          >
                            <p className="text-sm text-[#f5ede0]/40 mb-2">
                              漢字詳細 Détails du kanji
                            </p>
                            <div className="flex items-center justify-center gap-3">
                              <p className="text-4xl sm:text-6xl font-bold text-[#c9a84c] group-hover:scale-110 transition-transform">
                                {currentKanji.kanji}
                              </p>
                              <div className="text-[#f5ede0]/30 group-hover:text-[#f5ede0]/60 transition-colors">
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                            </div>
                            
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Mode: Japonais → Français
                    <div className="text-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-full mb-4 border border-purple-700/30">
                          <span className="text-lg">🇯🇵</span>
                          <span className="text-sm font-medium text-slate-300">
                            Traduisez en français
                          </span>
                          <span className="text-lg">🇫🇷</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(currentKanji);
                          }}
                          data-no-tap="true"
                          className="inline-block p-3 hover:bg-slate-700/30 rounded-xl transition-all group"
                        >
                          <p className="text-4xl sm:text-6xl font-bold text-slate-100 mb-2 group-hover:scale-110 transition-transform">
                            {currentKanji.kanji}
                          </p>
                          {(currentKanji.onyomi?.length > 0 ||
                            currentKanji.kunyomi?.length > 0) && (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {currentKanji.onyomi
                                ?.slice(0, 2)
                                .map((reading: string, index: number) => (
                                  <span
                                    key={`on-${index}`}
                                    className="text-sm text-slate-400"
                                  >
                                    {reading}
                                  </span>
                                ))}
                              {currentKanji.kunyomi
                                ?.slice(0, 2)
                                .map((reading: string, index: number) => (
                                  <span
                                    key={`kun-${index}`}
                                    className="text-sm text-slate-400"
                                  >
                                    {reading}
                                  </span>
                                ))}
                            </div>
                          )}
                        </button>
                      </div>

                      {showAnswer && (
                        <div className="space-y-4">
                          {/* Score */}
                          <div className="flex justify-center mb-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg border border-slate-600/30">
                              <span className="text-xs text-slate-400">
                                Score:
                              </span>
                              <div
                                className={`flex items-center gap-1.5 text-sm font-medium ${
                                  currentKanji.learningData.score === 0
                                    ? "text-blue-400"
                                    : currentKanji.learningData.score === 1
                                    ? "text-red-400"
                                    : currentKanji.learningData.score === 2
                                    ? "text-yellow-400"
                                    : "text-green-400"
                                }`}
                              >
                                {currentKanji.learningData.score === 0 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-blue-300/50">
                                    <img
                                      src="/sprites/logo_sans_fond.png"
                                      alt="Nouveau kanji"
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                {currentKanji.learningData.score === 1 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-red-300/40">
                                    <img
                                      src="/sprites/logo_triste.png"
                                      alt="Kanji difficile"
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                {currentKanji.learningData.score === 2 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-yellow-300/40">
                                    <img
                                      src="/sprites/logo_sport.png"
                                      alt="Kanji en entraînement"
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                {currentKanji.learningData.score === 3 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-green-300/40">
                                    <img
                                      src="/sprites/logo_victoire.png"
                                      alt="Kanji maîtrisé"
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                <span>{currentKanji.learningData.score}/3</span>
                              </div>
                            </div>
                          </div>

                          {/* Significations */}
                          <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-700/30">
                            <p className="text-sm text-emerald-400 mb-2">
                              Significations :
                            </p>
                            <p className="text-xl font-bold text-emerald-200 mb-2">
                              {currentKanji.primaryMeaning ||
                                currentKanji.meanings[0]}
                            </p>
                            {currentKanji.meanings.length > 1 && (
                              <p className="text-sm text-emerald-300">
                                Autres :{" "}
                                {currentKanji.meanings.slice(1).join(", ")}
                              </p>
                            )}
                          </div>

                          {/* Lectures détaillées */}
                          {(currentKanji.onyomi?.length > 0 ||
                            currentKanji.kunyomi?.length > 0) && (
                            <div className="p-4 bg-indigo-900/30 rounded-xl border border-indigo-700/30">
                              <p className="text-sm text-indigo-400 mb-2">
                                Lectures :
                              </p>
                              <div className="space-y-2">
                                {currentKanji.onyomi?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-indigo-500 mb-1">
                                      On'yomi:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {currentKanji.onyomi.map(
                                        (reading: string, index: number) => (
                                          <span
                                            key={`on-${index}`}
                                            className="px-2 py-1 bg-indigo-800/50 text-indigo-300 rounded text-sm"
                                          >
                                            {reading}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                                {currentKanji.kunyomi?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-indigo-500 mb-1">
                                      Kun'yomi:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {currentKanji.kunyomi.map(
                                        (reading: string, index: number) => (
                                          <span
                                            key={`kun-${index}`}
                                            className="px-2 py-1 bg-indigo-700/50 text-indigo-300 rounded text-sm"
                                          >
                                            {reading}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SwipeCard>
            </div>

            {/* Zone Canvas pour le mode Français → Japonais */}
            {trainingMode === "fr-to-jp" && (
              <div className="flex justify-center mb-6">
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/[0.08]">
                  <p className="text-center text-[#f5ede0]/50 mb-3 text-sm flex items-center justify-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-white/[0.08]">
                      <img
                        src="/sprites/logo_pensif.png"
                        alt="Entraînement écriture"
                        className="w-full h-full object-cover"
                      />
                    </span>
                    <span>Entraînez-vous à écrire</span>
                  </p>
                  <div className="flex justify-center">
                    <div className="w-72 h-72 sm:w-96 sm:h-96">
                      <KanjiCanvas 
                        fitToParent 
                        clearTrigger={clearCanvas}
                        showControls={false}
                        strokeScale={trainingStrokeScale}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-3">
                    <div className="inline-flex items-center gap-1 bg-white/[0.06] rounded-lg p-1 border border-white/[0.08]">
                      <button
                        onClick={() => setTrainingStrokeScale(0.8)}
                        className={`px-3 py-1 text-sm rounded-md ${ trainingStrokeScale < 0.9 ? 'bg-white/[0.12] text-[#f5ede0] shadow-sm' : 'text-[#f5ede0]/50 hover:bg-white/[0.08]'}`}
                        aria-label="Trait fin"
                      >
                        Fin
                      </button>
                      <button
                        onClick={() => setTrainingStrokeScale(1)}
                        className={`px-3 py-1 text-sm rounded-md ${ trainingStrokeScale >= 0.9 && trainingStrokeScale < 1.15 ? 'bg-white/[0.12] text-[#f5ede0] shadow-sm' : 'text-[#f5ede0]/50 hover:bg-white/[0.08]'}`}
                        aria-label="Trait moyen"
                      >
                        Moyen
                      </button>
                      <button
                        onClick={() => setTrainingStrokeScale(1.3)}
                        className={`px-3 py-1 text-sm rounded-md ${ trainingStrokeScale >= 1.15 ? 'bg-white/[0.12] text-[#f5ede0] shadow-sm' : 'text-[#f5ede0]/50 hover:bg-white/[0.08]'}`}
                        aria-label="Trait épais"
                      >
                        Épais
                      </button>
                    </div>
                    <button
                      onClick={() => setClearCanvas(prev => prev + 1)}
                      className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.10] text-[#f5ede0]/60 text-sm rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      🗑️ Effacer le dessin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Instructions ou écran final */}
        <div className="text-center">
          {/* Debug temporaire */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-2 bg-yellow-900/30 text-yellow-300 text-xs rounded border border-yellow-700/30">
              Debug: sessionComplete={String(stats.sessionComplete)}, total=
              {stats.total}, currentIndex={currentIndex}, selectedLength=
              {selectedKanjis.length}
            </div>
          )}

          {/* Le modal SessionCompleteModal gère désormais l'affichage de fin de session */}
          {!stats.sessionComplete ? (
            <div className="h-4"></div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl p-8">
              {/* Icône et titre selon la performance */}
              <div className="mb-6">
                {(() => {
                  const percentage = Math.round(
                    (stats.correct / stats.total) * 100
                  );
                  const note = Math.round((stats.correct / stats.total) * 20);

                  if (percentage >= 90) {
                    return (
                      <>
                        <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-yellow-300/30 shadow-lg">
                          <img
                            src="/sprites/logo_victoire.png"
                            alt="Excellent"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-yellow-300 mb-2">
                          Excellent !
                        </h3>
                      </>
                    );
                  } else if (percentage >= 75) {
                    return (
                      <>
                        <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-green-300/20 shadow-lg">
                          <img
                            src="/sprites/logo_sport.png"
                            alt="Très bien"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-green-300 mb-2">
                          Très bien !
                        </h3>
                      </>
                    );
                  } else if (percentage >= 50) {
                    return (
                      <>
                        <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-blue-300/20 shadow-lg">
                          <img
                            src="/sprites/logo_lecteur.png"
                            alt="Bon travail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-blue-300 mb-2">
                          Bon travail !
                        </h3>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-orange-300/20 shadow-lg">
                          <img
                            src="/sprites/logo_triste.png"
                            alt="Continue tes efforts"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-orange-300 mb-2">
                          Continue tes efforts !
                        </h3>
                      </>
                    );
                  }
                })()}
              </div>

              {/* Score et note */}
              <div className="mb-6 space-y-4">
                {/* Statistiques */}
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-100">
                      {stats.correct}/{stats.total}
                    </p>
                    <p className="text-sm text-slate-400">Bonnes réponses</p>
                  </div>
                  <div className="h-12 w-px bg-slate-600"></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-100">
                      {Math.round((stats.correct / stats.total) * 100)}%
                    </p>
                    <p className="text-sm text-slate-400">Réussite</p>
                  </div>
                  <div className="h-12 w-px bg-slate-600"></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-100">
                      {Math.round((stats.correct / stats.total) * 20)}/20
                    </p>
                    <p className="text-sm text-slate-400">Note</p>
                  </div>
                </div>

                {/* Barre de progression visuelle */}
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      Math.round((stats.correct / stats.total) * 100) >= 90
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : Math.round((stats.correct / stats.total) * 100) >= 75
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : Math.round((stats.correct / stats.total) * 100) >= 50
                        ? "bg-gradient-to-r from-blue-400 to-blue-500"
                        : "bg-gradient-to-r from-orange-400 to-orange-500"
                    }`}
                    style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Commentaire personnalisé */}
              <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/30">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {(() => {
                    const percentage = Math.round(
                      (stats.correct / stats.total) * 100
                    );
                    const totalCards = stats.total;

                    if (percentage >= 90) {
                      return `🌟 Performance exceptionnelle ! Tu maîtrises vraiment bien ces ${totalCards} kanjis. Continue comme ça !`;
                    } else if (percentage >= 75) {
                      return `👏 Très bonne performance ! Tu es sur la bonne voie pour maîtriser ces ${totalCards} kanjis. Encore quelques révisions et ce sera parfait !`;
                    } else if (percentage >= 50) {
                      return `📈 Tu progresses bien ! Ces ${totalCards} kanjis commencent à rentrer. Continue à t'entraîner régulièrement !`;
                    } else {
                      return `� Ne te décourage pas ! Ces ${totalCards} kanjis sont nouveaux pour toi. Avec de la pratique régulière, tu vas y arriver !`;
                    }
                  })()}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={startNewSession}
                  className="w-full px-6 py-3 bg-[#c41e1e] text-[#f5ede0] font-semibold rounded-xl hover:bg-[#c41e1e]/80 transition-all shadow-lg"
                >
                  🔄 Nouvelle session
                </button>
                <Link
                  href="/"
                  className="block w-full px-6 py-3 bg-white/[0.06] text-[#f5ede0]/60 font-medium text-center rounded-xl hover:bg-white/[0.10] transition-all border border-white/[0.08]"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-slate-600/80 mr-2 align-middle">
                    <img
                      src="/sprites/logo_maison.png"
                      alt="Retour au menu"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  Retour au menu
                </Link>
              </div>

              {/* Encouragement selon l'heure */}
                <div className="mt-6 text-xs text-[#f5ede0]/20">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour >= 6 && hour < 12) {
                    return "☀️ Bonne matinée d'étude !";
                  } else if (hour >= 12 && hour < 17) {
                    return "🌤️ Bon après-midi d'apprentissage !";
                  } else if (hour >= 17 && hour < 22) {
                    return "🌆 Bonne soirée de révisions !";
                  } else {
                    return "🌙 Bonne séance de nuit !";
                  }
                })()}
              </div>
            </div>
            </div>
          )}
        </div>
      </main>{" "}
      {/* Modal des détails */}
      {selectedKanji && (
        <KanjiDetailModal
          kanji={selectedKanji}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
      {/* Modal de fin de session */}
      <SessionCompleteModal
        isOpen={stats.sessionComplete}
        stats={stats}
        onNewSession={startNewSession}
        onClose={closeSessionModal}
      />
      
      {/* Modal de fin de partie Survival */}
      {survivalState && survivalStats && (
        <SurvivalGameOverModal
          isOpen={survivalState.isGameOver}
          survivalState={survivalState}
          stats={survivalStats}
          onNewGame={startNewSurvivalGame}
          onClose={exitSurvivalMode}
        />
      )}
    </div>
  );
}

// Composant principal avec Suspense
export default function TrainingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-white/[0.06] shadow-lg">
            <img
              src="/sprites/logo_sport.png"
              alt="Entraînement en cours de chargement"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-[#f5ede0] mb-2">
            Chargement...
          </h2>
          <p className="text-[#f5ede0]/50">
            準備中 - Préparation en cours
          </p>
        </div>
      </div>
    }>
      <TrainingPageContent />
    </Suspense>
  );
}
