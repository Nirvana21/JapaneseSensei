'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useKanjis } from '../../hooks/useKanjis';
import SwipeCard from '../../components/SwipeCard';
import KanjiCanvas from '../../components/KanjiCanvas';
import KanjiDetailModal from '../../components/KanjiDetailModal';
import SessionCompleteModal from '../../components/SessionCompleteModal';
import TagSelector from '../../components/TagSelector';
import { simpleAdaptiveLearningService, SimpleLearningKanji } from '../../services/adaptiveLearningService';

export default function TrainingPage() {
  const { kanjis } = useKanjis();
  const [selectedKanjis, setSelectedKanjis] = useState<SimpleLearningKanji[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [trainingMode, setTrainingMode] = useState<'fr-to-jp' | 'jp-to-fr'>('fr-to-jp');
  const [difficultyMode, setDifficultyMode] = useState<'normal' | 'hard' | 'hardcore'>('normal');
  const [isHardcoreModeAvailable, setIsHardcoreModeAvailable] = useState(true);
  const [stats, setStats] = useState({ correct: 0, total: 0, sessionComplete: false });
  const [selectedKanji, setSelectedKanji] = useState<SimpleLearningKanji | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clearCanvas, setClearCanvas] = useState(0);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allLearningKanjis, setAllLearningKanjis] = useState<SimpleLearningKanji[]>([]);

  // Initialiser avec les kanjis et le nouveau système simple
  useEffect(() => {
    if (kanjis.length > 0) {
      // Convertir les kanjis en SimpleLearningKanji
      const learningKanjis = kanjis.map(kanji => {
        // Charger les données existantes depuis localStorage
        const existingData = localStorage.getItem(`simple_learning_${kanji.id}`);
        if (existingData) {
          const parsed = JSON.parse(existingData);
          return {
            ...kanji,
            learningData: {
              ...parsed.learningData,
              lastSeen: new Date(parsed.learningData.lastSeen)
            },
            studyData: parsed.studyData
          };
        }
        return simpleAdaptiveLearningService.initializeLearningData(kanji);
      });

      setAllLearningKanjis(learningKanjis);

      // Extraire les tags disponibles
      const tags = simpleAdaptiveLearningService.getAvailableTags(learningKanjis);
      setAvailableTags(tags);

      // Générer une nouvelle session (20 cartes par défaut)
      generateNewSession(learningKanjis, []);
    }
  }, [kanjis]);

  // Générer une nouvelle session selon les tags sélectionnés
  const generateNewSession = (allKanjis: SimpleLearningKanji[], tags: string[], mode?: 'normal' | 'hard' | 'hardcore') => {
    // Filtrer les kanjis par tags si spécifiés
    let availableKanjis = allKanjis;
    if (tags.length > 0) {
      availableKanjis = allKanjis.filter(kanji => 
        tags.some(tag => kanji.tags?.includes(tag))
      );
    }
    
    const maxPossible = availableKanjis.length;
    const sessionSize = Math.min(20, maxPossible);
    
    // Utiliser le mode passé en paramètre ou celui du state
    const currentMode = mode || difficultyMode;
    const sessionKanjis = simpleAdaptiveLearningService.selectKanjisForSession(allKanjis, tags, sessionSize, currentMode);
    setSelectedKanjis(sessionKanjis);
    setCurrentIndex(0);
    setShowAnswer(false);
    setStats({ correct: 0, total: 0, sessionComplete: false });

    // Calculer les nouvelles statistiques
    const stats = simpleAdaptiveLearningService.getLearningStats(allKanjis);
    setLearningStats(stats);
    
    // Vérifier la disponibilité du mode hardcore
    const hardcoreAvailable = simpleAdaptiveLearningService.isHardcoreModeAvailable(allKanjis, tags);
    setIsHardcoreModeAvailable(hardcoreAvailable);
    
    // Si le mode hardcore n'est plus disponible et qu'on était en hardcore, basculer en hard
    const finalMode = currentMode === 'hardcore' && !hardcoreAvailable ? 'hard' : currentMode;
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
  const handleDifficultyModeChange = (mode: 'normal' | 'hard' | 'hardcore') => {
    // Vérifier si le mode hardcore est disponible avant de l'activer
    if (mode === 'hardcore' && !isHardcoreModeAvailable) {
      console.warn('Mode hardcore non disponible - tous les kanjis sont maîtrisés !');
      return;
    }
    
    setDifficultyMode(mode);
    // Passer le nouveau mode directement pour éviter les problèmes de timing du state
    generateNewSession(allLearningKanjis, selectedTags, mode);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    // Empêcher les swipes si la session est déjà terminée
    if (stats.sessionComplete) {
      return;
    }
    
    const isCorrect = direction === 'right';
    const currentKanji = selectedKanjis[currentIndex];
    
    // Mettre à jour les statistiques de session
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      total: stats.total + 1,
      sessionComplete: false
    };

    // Déclencher le nettoyage du canvas
    setClearCanvas(prev => prev + 1);

    // Mettre à jour les données d'apprentissage du kanji
    const updatedKanji = simpleAdaptiveLearningService.updateLearningData(currentKanji, isCorrect);
    
    // Sauvegarder les données d'apprentissage
    localStorage.setItem(`simple_learning_${updatedKanji.id}`, JSON.stringify({
      learningData: updatedKanji.learningData,
      studyData: updatedKanji.studyData
    }));

    // Mettre à jour la liste des kanjis
    const updatedAllKanjis = allLearningKanjis.map(k => k.id === updatedKanji.id ? updatedKanji : k);
    setAllLearningKanjis(updatedAllKanjis);

    // Mettre à jour les statistiques
    const learningStatsUpdate = simpleAdaptiveLearningService.getLearningStats(updatedAllKanjis);
    setLearningStats(learningStatsUpdate);

    // Vérifier si c'est la fin de session (on vient de répondre à la dernière carte)
    // La session est terminée quand le nombre total de réponses égale le nombre de cartes
    if (newStats.total >= selectedKanjis.length) {
      // Fin de session - marquer comme terminée
      setStats({
        ...newStats,
        sessionComplete: true
      });
      // Ne pas incrémenter currentIndex pour rester sur la dernière carte
    } else {
      // Continuer la session - passer à la carte suivante
      setStats(newStats);
      setCurrentIndex(prev => prev + 1);
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
    setStats(prev => ({ ...prev, sessionComplete: false }));
  };

  if (selectedKanjis.length === 0 && allLearningKanjis.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-gradient-to-br from-orange-100/90 to-red-100/90 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200/50 max-w-md">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">コレクション空 Collection vide</h2>
            <p className="text-amber-700 mb-6">Ajoutez des kanjis depuis la page d'accueil pour commencer l'entraînement.</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span>🏠</span>
              <span>戻る Menu</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentKanji = selectedKanjis[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header zen avec sélecteur de tags */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md border-b border-amber-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Première ligne : Navigation et titre */}
          <div className="flex items-center justify-between mb-3">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-3 py-2 bg-amber-200/50 hover:bg-orange-200/50 text-amber-800 font-medium rounded-lg transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">戻る</span>
            </Link>
            
            <h1 className="text-xl font-bold text-red-800 text-center">
              🎯 練習 Entraînement ({selectedKanjis.length} carte{selectedKanjis.length > 1 ? 's' : ''})
              {selectedKanjis.length < 20 && (
                <span className="text-sm text-amber-700 block mt-1">
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
          
          {/* Deuxième ligne : Contrôles et statistiques zen */}
          <div className="flex items-center justify-between mb-3">
            {/* Sélecteurs de mode zen */}
            <div className="flex items-center gap-2">
              <select
                value={trainingMode}
                onChange={(e) => setTrainingMode(e.target.value as 'fr-to-jp' | 'jp-to-fr')}
                className="px-3 py-2 bg-amber-100/90 border border-amber-300/50 rounded-lg text-sm font-medium text-amber-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="fr-to-jp">🇫🇷 → 🇯🇵</option>
                <option value="jp-to-fr">🇯🇵 → 🇫🇷</option>
              </select>
              
              <select
                value={difficultyMode}
                onChange={(e) => handleDifficultyModeChange(e.target.value as 'normal' | 'hard' | 'hardcore')}
                className={`px-3 py-2 bg-amber-100/90 border border-amber-300/50 rounded-lg text-sm font-medium text-amber-800 focus:outline-none focus:ring-2 transition-all ${
                  difficultyMode === 'hardcore' ? 'focus:ring-purple-500 border-purple-500/50' : 'focus:ring-red-500'
                }`}
              >
                <option value="normal">😊 普通 Normal</option>
                <option value="hard">💀 難しい Difficile</option>
                <option 
                  value="hardcore" 
                  disabled={!isHardcoreModeAvailable}
                  className={!isHardcoreModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  🔥 HARDCORE {!isHardcoreModeAvailable ? '(tout maîtrisé!)' : ''}
                </option>
              </select>
            </div>
            
            {/* Statistiques centrées zen */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-green-100/90 text-green-700 rounded-lg text-sm border border-green-300/50">
                ✅ {stats.correct}/{stats.total}
              </div>
              <div className="px-3 py-1 bg-blue-100/90 text-blue-700 rounded-lg text-sm border border-blue-300/50">
                📈 {currentIndex + 1}/{selectedKanjis.length}
              </div>
            </div>
            
            {/* Progression visuelle zen */}
            <div className="hidden sm:block w-24">
              <div className="h-2 bg-amber-200/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / selectedKanjis.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Message explicatif pour le mode hardcore zen */}
          {difficultyMode === 'hardcore' && (
            <div className="mb-2 text-center">
              <span className="px-3 py-1 bg-purple-100/90 text-purple-700 text-xs rounded-full border border-purple-300/50">
                🔥 Mode HARDCORE : Seulement tes pires kanjis (répétitions autorisées)
              </span>
            </div>
          )}
          {!isHardcoreModeAvailable && difficultyMode !== 'hardcore' && (
            <div className="mb-2 text-center">
              <span className="px-3 py-1 bg-green-100/90 text-green-700 text-xs rounded-full border border-green-300/50">
                🎉 Bravo ! Tous tes kanjis sont maîtrisés - Mode hardcore indisponible
              </span>
            </div>
          )}
          
          {/* Troisième ligne : Statistiques d'apprentissage zen */}
          {learningStats && (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 text-xs">
                <div className="px-2 py-1 bg-blue-100/90 text-blue-700 rounded border border-blue-300/50">
                  🆕 {learningStats.byScore[0]}
                </div>
                <div className="px-2 py-1 bg-red-100/90 text-red-700 rounded border border-red-300/50">
                  😓 {learningStats.byScore[1]}
                </div>
                <div className="px-2 py-1 bg-yellow-100/90 text-yellow-700 rounded border border-yellow-300/50">
                  📚 {learningStats.byScore[2]}
                </div>
                <div className="px-2 py-1 bg-green-100/90 text-green-700 rounded border border-green-300/50">
                  ✨ {learningStats.byScore[3]}
                </div>
                {learningStats.needsReview > 0 && (
                  <div className="px-2 py-1 bg-orange-100/90 text-orange-700 rounded border border-orange-300/50 animate-pulse">
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
        {selectedKanjis.length > 0 && currentKanji && (
          <>
            {/* Carte flashcard */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <SwipeCard
                onSwipeLeft={() => handleSwipe('left')}
                onSwipeRight={() => handleSwipe('right')}
                onTap={() => setShowAnswer(!showAnswer)}
                className="w-full max-w-lg"
              >
                <div className="bg-gradient-to-br from-orange-100/90 to-red-100/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-orange-200/50">
                  {trainingMode === 'fr-to-jp' ? (
                    // Mode: Français → Japonais
                    <div className="text-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-200/80 to-orange-200/80 rounded-full mb-4 border border-red-300/50">
                          <span className="text-lg">🇫🇷</span>
                          <span className="text-sm font-medium text-red-800">翻訳してください</span>
                          <span className="text-lg">🇯🇵</span>
                        </div>
                        <p className="text-2xl sm:text-4xl font-bold text-red-800 leading-relaxed">
                          {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                        </p>
                      </div>

                      {showAnswer && (
                        <div className="space-y-4">
                          {/* Score et difficulté */}
                          <div className="flex justify-center mb-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-orange-200/90 rounded-lg border border-orange-300">
                              <span className="text-xs text-orange-700">スコア Score:</span>
                              <div className={`flex items-center gap-1 text-sm font-medium ${
                                currentKanji.learningData.score === 0 ? 'text-blue-600' :
                                currentKanji.learningData.score === 1 ? 'text-red-600' :
                                currentKanji.learningData.score === 2 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {currentKanji.learningData.score === 0 && '🆕'}
                                {currentKanji.learningData.score === 1 && '😓'}
                                {currentKanji.learningData.score === 2 && '📚'}
                                {currentKanji.learningData.score === 3 && '✨'}
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
                            className="w-full p-4 bg-orange-200/80 hover:bg-orange-300/80 rounded-xl border border-orange-300 hover:border-orange-400 transition-all group"
                          >
                            <p className="text-sm text-orange-700 mb-2">漢字詳細 Kanji (cliquez pour les détails) :</p>
                            <div className="flex items-center justify-center gap-3">
                              <p className="text-4xl sm:text-6xl font-bold text-red-900 group-hover:scale-110 transition-transform">{currentKanji.kanji}</p>
                              <div className="text-orange-600 group-hover:text-red-700 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                            <p className="text-xs text-orange-600 mt-2">筆順・読み方・詳細を見るためにクリック Cliquez pour voir l'ordre des traits, lectures et plus de détails</p>
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
                          <span className="text-sm font-medium text-slate-300">Traduisez en français</span>
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
                          <p className="text-4xl sm:text-6xl font-bold text-slate-100 mb-2 group-hover:scale-110 transition-transform">{currentKanji.kanji}</p>
                          {(currentKanji.onyomi?.length > 0 || currentKanji.kunyomi?.length > 0) && (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {currentKanji.onyomi?.slice(0, 2).map((reading: string, index: number) => (
                                <span key={`on-${index}`} className="text-sm text-slate-400">
                                  {reading}
                                </span>
                              ))}
                              {currentKanji.kunyomi?.slice(0, 2).map((reading: string, index: number) => (
                                <span key={`kun-${index}`} className="text-sm text-slate-400">
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
                              <span className="text-xs text-slate-400">Score:</span>
                              <div className={`flex items-center gap-1 text-sm font-medium ${
                                currentKanji.learningData.score === 0 ? 'text-blue-400' :
                                currentKanji.learningData.score === 1 ? 'text-red-400' :
                                currentKanji.learningData.score === 2 ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {currentKanji.learningData.score === 0 && '🆕'}
                                {currentKanji.learningData.score === 1 && '😓'}
                                {currentKanji.learningData.score === 2 && '📚'}
                                {currentKanji.learningData.score === 3 && '✨'}
                                <span>{currentKanji.learningData.score}/3</span>
                              </div>
                            </div>
                          </div>

                          {/* Significations */}
                          <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-700/30">
                            <p className="text-sm text-emerald-400 mb-2">Significations :</p>
                            <p className="text-xl font-bold text-emerald-200 mb-2">
                              {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                            </p>
                            {currentKanji.meanings.length > 1 && (
                              <p className="text-sm text-emerald-300">
                                Autres : {currentKanji.meanings.slice(1).join(', ')}
                              </p>
                            )}
                          </div>

                          {/* Lectures détaillées */}
                          {(currentKanji.onyomi?.length > 0 || currentKanji.kunyomi?.length > 0) && (
                            <div className="p-4 bg-indigo-900/30 rounded-xl border border-indigo-700/30">
                              <p className="text-sm text-indigo-400 mb-2">Lectures :</p>
                              <div className="space-y-2">
                                {currentKanji.onyomi?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-indigo-500 mb-1">On'yomi:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {currentKanji.onyomi.map((reading: string, index: number) => (
                                        <span key={`on-${index}`} className="px-2 py-1 bg-indigo-800/50 text-indigo-300 rounded text-sm">
                                          {reading}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {currentKanji.kunyomi?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-indigo-500 mb-1">Kun'yomi:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {currentKanji.kunyomi.map((reading: string, index: number) => (
                                        <span key={`kun-${index}`} className="px-2 py-1 bg-indigo-700/50 text-indigo-300 rounded text-sm">
                                          {reading}
                                        </span>
                                      ))}
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
            {trainingMode === 'fr-to-jp' && (
              <div className="flex justify-center mb-6">
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-lg">
                  <p className="text-center text-slate-300 mb-3 text-sm">✏️ Entraînez-vous à écrire</p>
                  <KanjiCanvas clearTrigger={clearCanvas} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Instructions ou écran final */}
        <div className="text-center">
          {/* Debug temporaire */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-yellow-900/30 text-yellow-300 text-xs rounded border border-yellow-700/30">
              Debug: sessionComplete={String(stats.sessionComplete)}, total={stats.total}, currentIndex={currentIndex}, selectedLength={selectedKanjis.length}
            </div>
          )}
          
          {/* Le modal SessionCompleteModal gère désormais l'affichage de fin de session */}
          <div className="inline-block p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-700/30 backdrop-blur-sm">
            <p className="text-sm text-indigo-300 font-medium">
              👆 Touchez la carte pour révéler la réponse • Swipez doucement ← (pas sûr) ou → (je connais)
            </p>
          </div>
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl p-8">
                {/* Icône et titre selon la performance */}
                <div className="mb-6">
                  {(() => {
                    const percentage = Math.round((stats.correct / stats.total) * 100);
                    const note = Math.round((stats.correct / stats.total) * 20);
                    
                    if (percentage >= 90) {
                      return (
                        <>
                          <div className="text-6xl mb-4">🏆</div>
                          <h3 className="text-2xl font-bold text-yellow-300 mb-2">Excellent !</h3>
                        </>
                      );
                    } else if (percentage >= 75) {
                      return (
                        <>
                          <div className="text-6xl mb-4">�</div>
                          <h3 className="text-2xl font-bold text-green-300 mb-2">Très bien !</h3>
                        </>
                      );
                    } else if (percentage >= 50) {
                      return (
                        <>
                          <div className="text-6xl mb-4">📚</div>
                          <h3 className="text-2xl font-bold text-blue-300 mb-2">Bon travail !</h3>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="text-6xl mb-4">💪</div>
                          <h3 className="text-2xl font-bold text-orange-300 mb-2">Continue tes efforts !</h3>
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
                      <p className="text-3xl font-bold text-slate-100">{stats.correct}/{stats.total}</p>
                      <p className="text-sm text-slate-400">Bonnes réponses</p>
                    </div>
                    <div className="h-12 w-px bg-slate-600"></div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-100">{Math.round((stats.correct / stats.total) * 100)}%</p>
                      <p className="text-sm text-slate-400">Réussite</p>
                    </div>
                    <div className="h-12 w-px bg-slate-600"></div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-100">{Math.round((stats.correct / stats.total) * 20)}/20</p>
                      <p className="text-sm text-slate-400">Note</p>
                    </div>
                  </div>

                  {/* Barre de progression visuelle */}
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        Math.round((stats.correct / stats.total) * 100) >= 90 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        Math.round((stats.correct / stats.total) * 100) >= 75 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        Math.round((stats.correct / stats.total) * 100) >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        'bg-gradient-to-r from-orange-400 to-orange-500'
                      }`}
                      style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Commentaire personnalisé */}
                <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/30">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {(() => {
                      const percentage = Math.round((stats.correct / stats.total) * 100);
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
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-lg"
                  >
                    🔄 Nouvelle session
                  </button>
                  <Link
                    href="/"
                    className="block w-full px-6 py-3 bg-slate-700/80 text-slate-300 font-medium text-center rounded-xl hover:bg-slate-600/80 transition-all"
                  >
                    🏠 Retour au menu
                  </Link>
                </div>

                {/* Encouragement selon l'heure */}
                <div className="mt-6 text-xs text-slate-500">
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
          ) : (
            <div className="inline-block p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-700/30 backdrop-blur-sm">
              <p className="text-sm text-indigo-300 font-medium">
              👆 Touchez la carte pour révéler la réponse • Swipez doucement ← (pas sûr) ou → (je connais)
            </p>
          </div>
        </div>
      </main>      {/* Modal des détails */}
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
    </div>
  );
}