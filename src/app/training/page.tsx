'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useKanjis } from '../../hooks/useKanjis';
import SwipeCard from '../../components/SwipeCard';
import KanjiCanvas from '../../components/KanjiCanvas';
import KanjiDetailModal from '../../components/KanjiDetailModal';
import { adaptiveLearningService, LearningKanji } from '../../services/adaptiveLearningService';

export default function TrainingPage() {
  const { kanjis } = useKanjis();
  const [selectedKanjis, setSelectedKanjis] = useState<LearningKanji[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [trainingMode, setTrainingMode] = useState<'fr-to-jp' | 'jp-to-fr'>('fr-to-jp');
  const [stats, setStats] = useState({ correct: 0, total: 0, sessionComplete: false });
  const [selectedKanji, setSelectedKanji] = useState<LearningKanji | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clearCanvas, setClearCanvas] = useState(0); // Compteur pour déclencher le nettoyage
  const [learningStats, setLearningStats] = useState<any>(null);

  // Initialiser avec les kanjis disponibles et le système adaptatif
  useEffect(() => {
    if (kanjis.length > 0) {
      // Convertir les kanjis en LearningKanji et sélectionner une session
      const learningKanjis = kanjis.map(kanji => {
        // Vérifier si on a déjà des données d'apprentissage stockées
        const existingData = localStorage.getItem(`learning_${kanji.id}`);
        if (existingData) {
          const parsed = JSON.parse(existingData);
          return {
            ...kanji,
            learningData: {
              ...parsed.learningData,
              lastSeen: new Date(parsed.learningData.lastSeen),
              nextReview: new Date(parsed.learningData.nextReview)
            },
            studyData: parsed.studyData
          };
        }
        return adaptiveLearningService.initializeLearningData(kanji);
      });
      
      // Sélectionner les kanjis pour cette session (max 10)
      const sessionKanjis = adaptiveLearningService.selectKanjisForSession(learningKanjis, 10);
      setSelectedKanjis(sessionKanjis);
      
      // Calculer les statistiques d'apprentissage
      const stats = adaptiveLearningService.getLearningStats(learningKanjis);
      setLearningStats(stats);
    }
  }, [kanjis]);

  const currentKanji = selectedKanjis[currentIndex];

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
    const updatedKanji = adaptiveLearningService.updateLearningData(currentKanji, isCorrect);
    
    // Sauvegarder les données d'apprentissage
    localStorage.setItem(`learning_${updatedKanji.id}`, JSON.stringify({
      learningData: updatedKanji.learningData,
      studyData: updatedKanji.studyData
    }));

    // Mettre à jour la liste des kanjis sélectionnés
    setSelectedKanjis(prev => 
      prev.map(k => k.id === updatedKanji.id ? updatedKanji : k)
    );

    // Passer au kanji suivant
    if (currentIndex < selectedKanjis.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Fin de session
      setStats(prev => ({ ...prev, sessionComplete: true }));
      
      // Optionnel: recharger automatiquement une nouvelle session après un délai
      setTimeout(() => {
        const allLearningKanjis = JSON.parse(localStorage.getItem('allLearningKanjis') || '[]');
        if (allLearningKanjis.length > 0) {
          const newSession = adaptiveLearningService.selectKanjisForSession(allLearningKanjis, 10);
          if (newSession.length > 0) {
            setSelectedKanjis(newSession);
            setCurrentIndex(0);
            setShowAnswer(false);
            setStats({ correct: 0, total: 0, sessionComplete: false });
          }
        }
      }, 3000);
    }
  };

  const openModal = (kanji: LearningKanji) => {
    setSelectedKanji(kanji);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedKanji(null);
  };

  if (selectedKanjis.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-slate-700/50">
            <h1 className="text-2xl font-bold mb-4 text-slate-100">📚 Aucun kanji disponible</h1>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Header simplifié et propre */}
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
              🎯 Entraînement
            </h1>
            
            <div className="w-16"></div> {/* Spacer pour centrer le titre */}
          </div>
          
          {/* Deuxième ligne : Contrôles et statistiques */}
          <div className="flex items-center justify-between">
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
            <div className="flex items-center justify-center mt-3">
              <div className="flex items-center gap-3 text-xs">
                <div className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded border border-blue-700/30">
                  🆕 {learningStats.new}
                </div>
                <div className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded border border-yellow-700/30">
                  📚 {learningStats.learning}
                </div>
                <div className="px-2 py-1 bg-red-900/30 text-red-300 rounded border border-red-700/30">
                  😓 {learningStats.difficult}
                </div>
                <div className="px-2 py-1 bg-green-900/30 text-green-300 rounded border border-green-700/30">
                  ✨ {learningStats.mastered}
                </div>
                {learningStats.overdue > 0 && (
                  <div className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded border border-orange-700/30 animate-pulse">
                    ⏰ {learningStats.overdue}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Zone principale d'entraînement */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Carte flashcard swipeable avec design amélioré */}
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
                    <div className="border-t border-slate-600/50 pt-6 mt-6 animate-in fade-in duration-300">
                      <div className="space-y-4">
                        {/* Kanji cliquable */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(currentKanji);
                          }}
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
                        
                        {(currentKanji.onyomi?.length > 0 || currentKanji.kunyomi?.length > 0) && (
                          <div className="p-4 bg-indigo-900/30 rounded-xl border border-indigo-700/30">
                            <p className="text-sm text-indigo-400 mb-2">Lectures :</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {currentKanji.onyomi?.map((reading: string, index: number) => (
                                <span key={`on-${index}`} className="px-2 py-1 bg-indigo-800/50 text-indigo-300 rounded text-sm">
                                  {reading}
                                </span>
                              ))}
                              {currentKanji.kunyomi?.map((reading: string, index: number) => (
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
              ) : (
                // Mode: Japonais → Français
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-full mb-4 border border-purple-700/30">
                      <span className="text-lg">🇯🇵</span>
                      <span className="text-sm font-medium text-slate-300">Traduisez en français</span>
                      <span className="text-lg">🇫🇷</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(currentKanji);
                      }}
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
                      <p className="text-xs text-slate-500 mt-2">Cliquez pour plus de détails</p>
                    </button>
                  </div>

                  {showAnswer && (
                    <div className="border-t border-slate-600/50 pt-6 mt-6 animate-in fade-in duration-300">
                      <div className="space-y-4">
                        {/* Lectures détaillées */}
                        {(currentKanji.onyomi?.length > 0 || currentKanji.kunyomi?.length > 0) && (
                          <div className="p-4 bg-indigo-900/30 rounded-xl border border-indigo-700/30">
                            <p className="text-sm text-indigo-400 mb-3">Lectures complètes :</p>
                            <div className="space-y-2">
                              {currentKanji.onyomi?.length > 0 && (
                                <div>
                                  <p className="text-xs text-indigo-300 mb-1">On'yomi (音読み) :</p>
                                  <div className="flex flex-wrap gap-2">
                                    {currentKanji.onyomi.map((reading: string, index: number) => (
                                      <span key={`on-${index}`} className="px-3 py-1 bg-indigo-800/50 text-indigo-200 rounded-md text-sm font-medium border border-indigo-600/30">
                                        {reading}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {currentKanji.kunyomi?.length > 0 && (
                                <div>
                                  <p className="text-xs text-indigo-300 mb-1">Kun'yomi (訓読み) :</p>
                                  <div className="flex flex-wrap gap-2">
                                    {currentKanji.kunyomi.map((reading: string, index: number) => (
                                      <span key={`kun-${index}`} className="px-3 py-1 bg-indigo-700/50 text-indigo-200 rounded-md text-sm font-medium border border-indigo-500/30">
                                        {reading}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Signification */}
                        <div className="p-4 bg-emerald-900/30 rounded-xl border border-emerald-700/30">
                          <p className="text-sm text-emerald-400 mb-2">Signification :</p>
                          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                            {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                          </p>
                          {currentKanji.meanings.length > 1 && (
                            <p className="text-sm text-emerald-300 mt-2">
                              Autres : {currentKanji.meanings.slice(1).join(', ')}
                            </p>
                          )}
                        </div>
                        
                        {currentKanji.tags && currentKanji.tags.length > 0 && (
                          <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-700/30">
                            <p className="text-sm text-purple-400 mb-2">Tags :</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {currentKanji.tags.map((tag: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-purple-800/50 text-purple-300 text-xs font-medium rounded-full border border-purple-600/30">
                                  {tag}
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
          </SwipeCard>
        </div>

        {/* Zone Canvas pour le mode Français → Japonais */}
        {trainingMode === 'fr-to-jp' && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-700/40">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-lg">✏️</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  {showAnswer ? 'Comparez votre tracé avec l\'ordre officiel' : 'Entraînez-vous à dessiner le kanji'}
                </h3>
              </div>
              <div className="flex justify-center">
                <div className="p-2 bg-slate-700/50 rounded-xl shadow-inner border border-slate-600/30">
                  <KanjiCanvas 
                    width={280} 
                    height={280}
                    clearTrigger={clearCanvas}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions centrées ou message de fin de session */}
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
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all"
                  >
                    🔄 Nouvelle session
                  </button>
                </div>
                <p className="text-xs text-green-500 mt-3">
                  Nouvelle session disponible dans 3 secondes...
                </p>
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

      {/* Kanji Detail Modal */}
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