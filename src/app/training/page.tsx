'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useKanjis } from '../../hooks/useKanjis';
import SwipeCard from '../../components/SwipeCard';
import KanjiCanvas from '../../components/KanjiCanvas';
import StrokeOrderViewer from '../../components/StrokeOrderViewer';

export default function TrainingPage() {
  const { kanjis } = useKanjis();
  const [selectedKanjis, setSelectedKanjis] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [trainingMode, setTrainingMode] = useState<'fr-to-jp' | 'jp-to-fr'>('fr-to-jp');
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // Initialiser avec les kanjis disponibles
  useEffect(() => {
    if (kanjis.length > 0) {
      setSelectedKanjis([...kanjis]);
    }
  }, [kanjis]);

  const currentKanji = selectedKanjis[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    const isCorrect = direction === 'right';
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Passer au kanji suivant
    if (currentIndex < selectedKanjis.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Fin de session - recommencer
      setCurrentIndex(0);
      setShowAnswer(false);
    }
  };

  if (selectedKanjis.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
            <h1 className="text-2xl font-bold mb-4">📚 Aucun kanji disponible</h1>
            <p className="text-gray-600 mb-6">Ajoutez des kanjis depuis la page d'accueil pour commencer l'entraînement.</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200">
      {/* En-tête moderne avec bouton retour et contrôles */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Bouton retour avec icône */}
            <Link 
              href="/" 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-gray-200"
            >
              <span className="text-lg">🏠</span>
              <span className="text-sm sm:text-base">Menu</span>
            </Link>

            {/* Titre central */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎯 Entraînement Flashcards
              </h1>
            </div>

            {/* Contrôles à droite */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Sélecteur de mode avec design moderne */}
              <select
                value={trainingMode}
                onChange={(e) => setTrainingMode(e.target.value as 'fr-to-jp' | 'jp-to-fr')}
                className="px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-md"
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
                        
                        {currentKanji.readings && (
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                            <p className="text-sm text-blue-600 mb-2">Lectures :</p>
                            <p className="text-lg text-blue-800 font-medium">{currentKanji.readings.join(', ')}</p>
                          </div>
                        )}
                        
                        {/* Ordre des traits */}
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                          <p className="text-sm text-green-600 mb-3">Ordre des traits :</p>
                          <div className="flex justify-center">
                            <StrokeOrderViewer kanji={currentKanji.kanji} />
                          </div>
                        </div>
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
                      <span className="text-sm font-medium text-gray-700">Traduisez en français</span>
                      <span className="text-lg">🇫🇷</span>
                    </div>
                    <p className="text-4xl sm:text-6xl font-bold text-gray-800 mb-2">{currentKanji.kanji}</p>
                    {currentKanji.readings && (
                      <p className="text-lg text-gray-600">{currentKanji.readings.join(', ')}</p>
                    )}
                  </div>

                  {showAnswer && (
                    <div className="border-t border-gray-200 pt-6 mt-6 animate-in fade-in duration-300">
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                          <p className="text-sm text-green-600 mb-2">Signification :</p>
                          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                          </p>
                          {currentKanji.meanings.length > 1 && (
                            <p className="text-sm text-green-700 mt-2">
                              Autres : {currentKanji.meanings.slice(1).join(', ')}
                            </p>
                          )}
                        </div>
                        
                        {/* Ordre des traits */}
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                          <p className="text-sm text-blue-600 mb-3">Ordre des traits :</p>
                          <div className="flex justify-center">
                            <StrokeOrderViewer kanji={currentKanji.kanji} />
                          </div>
                        </div>
                        
                        {currentKanji.tags && currentKanji.tags.length > 0 && (
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                            <p className="text-sm text-purple-600 mb-2">Tags :</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {currentKanji.tags.map((tag: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium rounded-full border border-purple-200">
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
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/40">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-lg">✏️</span>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">
                  {showAnswer ? 'Comparez votre tracé avec l\'ordre officiel' : 'Entraînez-vous à dessiner le kanji'}
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

        {/* Progression et instructions simplifiées */}
        <div className="text-center space-y-6">
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

          {/* Instructions simplifiées */}
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              👆 Touchez la carte pour révéler la réponse • Swipez ← (pas sûr) ou → (je connais)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}