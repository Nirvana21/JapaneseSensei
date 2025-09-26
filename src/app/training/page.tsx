'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useKanjis } from '../../hooks/useKanjis';
import SwipeCard from '../../components/SwipeCard';
import KanjiCanvas from '../../components/KanjiCanvas';
import KanjiDetailModal from '../../components/KanjiDetailModal';
import TagSelector from '../../components/TagSelector';
import { simpleAdaptiveLearningService, SimpleLearningKanji } from '../../services/adaptiveLearningService';

export default function TrainingPage() {
  const { kanjis } = useKanjis();
  const [selectedKanjis, setSelectedKanjis] = useState<SimpleLearningKanji[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [trainingMode, setTrainingMode] = useState<'fr-to-jp' | 'jp-to-fr'>('fr-to-jp');
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
  const generateNewSession = (allKanjis: SimpleLearningKanji[], tags: string[]) => {
    const sessionKanjis = simpleAdaptiveLearningService.selectKanjisForSession(allKanjis, tags, 20);
    setSelectedKanjis(sessionKanjis);
    setCurrentIndex(0);
    setShowAnswer(false);
    setStats({ correct: 0, total: 0, sessionComplete: false });

    // Calculer les nouvelles statistiques
    const stats = simpleAdaptiveLearningService.getLearningStats(allKanjis);
    setLearningStats(stats);
  };

  // Gestionnaire pour les changements de tags
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    generateNewSession(allLearningKanjis, tags);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const isCorrect = direction === 'right';
    const currentKanji = selectedKanjis[currentIndex];
    
    // Mettre à jour les statistiques de session
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      sessionComplete: false
    }));

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
    const newStats = simpleAdaptiveLearningService.getLearningStats(updatedAllKanjis);
    setLearningStats(newStats);

    // Passer au kanji suivant
    if (currentIndex < selectedKanjis.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Fin de session
      setStats(prev => ({ ...prev, sessionComplete: true }));
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

  if (selectedKanjis.length === 0 && allLearningKanjis.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 max-w-md">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Aucun kanji disponible</h2>
            <p className="text-slate-400 mb-6">Ajoutez des kanjis depuis la page d'accueil pour commencer l'entraînement.</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span>🏠</span>
              <span>Retour au menu</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentKanji = selectedKanjis[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Header avec sélecteur de tags */}
      <header className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-md border-b border-slate-700/50 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Première ligne : Navigation et titre */}
          <div className="flex items-center justify-between mb-3">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-3 py-2 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 font-medium rounded-lg transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">Menu</span>
            </Link>
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent text-center">
              🎯 Entraînement (Sessions 20 cartes)
            </h1>
            
            <button
              onClick={startNewSession}
              className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-800 transition-all text-sm"
            >
              🔄 Nouvelle session
            </button>
          </div>
          
          {/* Deuxième ligne : Contrôles et statistiques */}
          <div className="flex items-center justify-between mb-3">
            {/* Sélecteur de mode */}
            <select
              value={trainingMode}
              onChange={(e) => setTrainingMode(e.target.value as 'fr-to-jp' | 'jp-to-fr')}
              className="px-3 py-2 bg-slate-700/80 border border-slate-600/50 rounded-lg text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="fr-to-jp">🇫🇷 → 🇯🇵</option>
              <option value="jp-to-fr">🇯🇵 → 🇫🇷</option>
            </select>
            
            {/* Statistiques centrées */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-green-900/50 text-green-300 rounded-lg text-sm border border-green-700/30">
                ✅ {stats.correct}/{stats.total}
              </div>
              <div className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-lg text-sm border border-indigo-700/30">
                📈 {currentIndex + 1}/{selectedKanjis.length}
              </div>
            </div>
            
            {/* Progression visuelle */}
            <div className="hidden sm:block w-24">
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / selectedKanjis.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Troisième ligne : Statistiques d'apprentissage */}
          {learningStats && (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 text-xs">
                <div className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded border border-blue-700/30">
                  🆕 {learningStats.byScore[0]}
                </div>
                <div className="px-2 py-1 bg-red-900/30 text-red-300 rounded border border-red-700/30">
                  😓 {learningStats.byScore[1]}
                </div>
                <div className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded border border-yellow-700/30">
                  📚 {learningStats.byScore[2]}
                </div>
                <div className="px-2 py-1 bg-green-900/30 text-green-300 rounded border border-green-700/30">
                  ✨ {learningStats.byScore[3]}
                </div>
                {learningStats.needsReview > 0 && (
                  <div className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded border border-orange-700/30 animate-pulse">
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
                <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700/40">
                  {trainingMode === 'fr-to-jp' ? (
                    // Mode: Français → Japonais
                    <div className="text-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-full mb-4 border border-indigo-700/30">
                          <span className="text-lg">🇫🇷</span>
                          <span className="text-sm font-medium text-slate-300">Traduisez en japonais</span>
                          <span className="text-lg">🇯🇵</span>
                        </div>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent leading-relaxed">
                          {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                        </p>
                      </div>

                      {showAnswer && (
                        <div className="space-y-4">
                          {/* Score et difficulté */}
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

                          {/* Kanji cliquable */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(currentKanji);
                            }}
                            data-no-tap="true"
                            className="w-full p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all group"
                          >
                            <p className="text-sm text-slate-400 mb-2">Kanji (cliquez pour les détails) :</p>
                            <div className="flex items-center justify-center gap-3">
                              <p className="text-4xl sm:text-6xl font-bold text-slate-100 group-hover:scale-110 transition-transform">{currentKanji.kanji}</p>
                              <div className="text-slate-400 group-hover:text-slate-300 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Cliquez pour voir l'ordre des traits, lectures et plus de détails</p>
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

        {/* Instructions ou message de fin */}
        <div className="text-center">
          {stats.sessionComplete ? (
            <div className="inline-block p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-700/30 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-green-300 mb-2">Session terminée !</h3>
                <p className="text-green-400 mb-4">
                  Score : {stats.correct}/{stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/"
                    className="px-4 py-2 bg-slate-700/80 text-slate-300 rounded-lg hover:bg-slate-600/80 transition-colors"
                  >
                    🏠 Menu
                  </Link>
                  <button
                    onClick={startNewSession}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all"
                  >
                    🔄 Nouvelle session
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="inline-block p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-700/30 backdrop-blur-sm">
              <p className="text-sm text-indigo-300 font-medium">
                👆 Touchez la carte pour révéler la réponse • Swipez ← (pas sûr) ou → (je connais)
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal des détails */}
      {selectedKanji && (
        <KanjiDetailModal
          kanji={selectedKanji}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}