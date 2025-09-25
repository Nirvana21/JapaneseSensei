"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useKanjis } from "@/hooks/useKanjis";
import { KanjiEntry } from "@/types/kanji";
import KanjiCanvas from "@/components/KanjiCanvas";
import SwipeCard from "@/components/SwipeCard";

export default function TrainingPage() {
  const { kanjis, loading } = useKanjis();
  const [selectedKanjis, setSelectedKanjis] = useState<KanjiEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trainingMode, setTrainingMode] = useState<'fr-to-jp' | 'jp-to-fr'>('fr-to-jp');
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (kanjis.length > 0) {
      // Pour l'instant, utilise tous les kanjis disponibles
      setSelectedKanjis([...kanjis].sort(() => Math.random() - 0.5));
    }
  }, [kanjis]);

  const currentKanji = selectedKanjis[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    const isCorrect = direction === 'right';
    
    // Mettre à jour les statistiques
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // TODO: Sauvegarder les performances pour l'algorithme de recommandation
    
    // Passer à la carte suivante
    if (currentIndex < selectedKanjis.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Fin de la session
      alert(`Session terminée! Score: ${stats.correct + (isCorrect ? 1 : 0)}/${stats.total + 1}`);
      setCurrentIndex(0);
      setStats({ correct: 0, total: 0 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des kanjis...</p>
        </div>
      </div>
    );
  }

  if (selectedKanjis.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Aucun kanji disponible</h2>
          <p>Ajoutez des kanjis depuis la page principale pour commencer l'entraînement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Bouton retour et titre */}
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-lg">←</span>
                <span className="hidden sm:inline font-medium">Menu Principal</span>
                <span className="sm:hidden font-medium">Menu</span>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎯 Entraînement
              </h1>
            </div>
            
            {/* Contrôles et statistiques */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {/* Mode de formation */}
              <select 
                value={trainingMode} 
                onChange={(e) => setTrainingMode(e.target.value as 'fr-to-jp' | 'jp-to-fr')}
                className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-sm bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
              >
                <option value="fr-to-jp">🇫🇷 → 🇯🇵</option>
                <option value="jp-to-fr">🇯🇵 → 🇫🇷</option>
              </select>
              
              {/* Statistiques avec design amélioré */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                  ✅ {stats.correct}/{stats.total}
                </div>
                <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  📊 {currentIndex + 1}/{selectedKanjis.length}
                </div>
              </div>
            </div>
          </div>
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
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/40">
              {trainingMode === 'fr-to-jp' ? (
                // Mode: Français → Japonais
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                      <span className="text-lg">🇫🇷</span>
                      <span className="text-sm font-medium text-gray-700">Traduisez en japonais</span>
                      <span className="text-lg">🇯🇵</span>
                    </div>
                    <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-relaxed">
                      {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                    </p>
                  </div>

                  {showAnswer && (
                    <div className="border-t border-gray-200 pt-6 mt-6 animate-in fade-in duration-300">
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                          <p className="text-sm text-gray-600 mb-2">Kanji :</p>
                          <p className="text-4xl sm:text-6xl font-bold text-gray-800">{currentKanji.kanji}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-2">Lecture :</p>
                          <p className="text-xl sm:text-2xl text-gray-700 font-medium">
                            {currentKanji.primaryReading || 
                             [...(currentKanji.onyomi || []), ...(currentKanji.kunyomi || [])][0] || 'N/A'}
                          </p>
                        </div>
                        {currentKanji.tags && currentKanji.tags.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Tags :</p>
                            <div className="flex flex-wrap gap-2 mt-1 justify-center">
                              {currentKanji.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
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
              ) : (
                // Mode: Japonais → Français  
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                      <span className="text-lg">🇯🇵</span>
                      <span className="text-sm font-medium text-gray-700">Que signifie</span>
                      <span className="text-lg">🇫🇷</span>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-4">
                      <p className="text-6xl sm:text-8xl font-bold text-gray-800 mb-2">
                        {currentKanji.kanji}
                      </p>
                      <p className="text-lg sm:text-2xl text-gray-600 font-medium">
                        {currentKanji.primaryReading || 
                         [...(currentKanji.onyomi || []), ...(currentKanji.kunyomi || [])][0] || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {showAnswer && (
                    <div className="border-t border-gray-200 pt-6 mt-6 animate-in fade-in duration-300">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">Signification :</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                        </p>
                      </div>
                      {currentKanji.tags && currentKanji.tags.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Tags :</p>
                          <div className="flex flex-wrap gap-2 mt-1 justify-center">
                            {currentKanji.tags.map((tag, index) => (
                              <span key={index} className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                                {tag}
                              </span>
                            ))}
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
        {trainingMode === 'fr-to-jp' && !showAnswer && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/40">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-lg">✏️</span>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">
                  Entraînez-vous à dessiner le kanji
                </h3>
              </div>
              <div className="flex justify-center">
                <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-inner">
                  <KanjiCanvas 
                    width={280} 
                    height={280}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions et boutons de swipe améliorés */}
        <div className="text-center space-y-4 sm:space-y-6">
          {/* Instructions avec design moderne */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/30">
            <p className="text-base sm:text-lg font-medium text-gray-700 mb-4">
              📁 Swipez ou cliquez :
            </p>
            
            {/* Boutons d'action redesignés */}
            <div className="flex justify-center gap-4 sm:gap-8">
              <button
                onClick={() => handleSwipe('left')}
                className="group flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-200"
              >
                <span className="text-2xl sm:text-3xl mb-2 group-hover:animate-pulse">�</span>
                <span className="text-xs sm:text-sm font-bold">Je ne sais pas</span>
                <span className="text-xs text-red-600 mt-1 opacity-75">Swipe ←</span>
              </button>
              
              <button
                onClick={() => handleSwipe('right')}
                className="group flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-green-200"
              >
                <span className="text-2xl sm:text-3xl mb-2 group-hover:animate-pulse">�</span>
                <span className="text-xs sm:text-sm font-bold">Je connais</span>
                <span className="text-xs text-green-600 mt-1 opacity-75">Swipe →</span>
              </button>
            </div>
            
            {/* Indicateur de tap pour voir la réponse */}
            {!showAnswer && (
              <div className="mt-4 sm:mt-6 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800 font-medium">
                  👆 Touchez la carte pour révéler la réponse
                </p>
              </div>
            )}
          </div>
          
          {/* Progression avec design amélioré */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-white/40">
              <span className="text-blue-600">📈</span>
              <span className="text-sm font-medium text-gray-700">
                Carte {currentIndex + 1} sur {selectedKanjis.length}
              </span>
            </div>
            
            {/* Barre de progression */}
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${((currentIndex + 1) / selectedKanjis.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}