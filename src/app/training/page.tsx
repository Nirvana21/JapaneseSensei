"use client";

import { useState, useEffect } from "react";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🎯 Entraînement Flashcards
            </h1>
            <div className="flex items-center gap-4">
              {/* Mode de formation */}
              <select 
                value={trainingMode} 
                onChange={(e) => setTrainingMode(e.target.value as 'fr-to-jp' | 'jp-to-fr')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="fr-to-jp">Français → Japonais</option>
                <option value="jp-to-fr">Japonais → Français</option>
              </select>
              
              {/* Statistiques */}
              <div className="text-sm text-gray-600">
                Score: {stats.correct}/{stats.total}
              </div>
              
              {/* Progression */}
              <div className="text-sm text-gray-600">
                {currentIndex + 1}/{selectedKanjis.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Zone principale d'entraînement */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carte flashcard swipeable */}
        <div className="flex justify-center mb-8">
          <SwipeCard
            onSwipeLeft={() => handleSwipe('left')}
            onSwipeRight={() => handleSwipe('right')}
            onTap={() => setShowAnswer(!showAnswer)}
            className="w-full max-w-lg"
          >
            <div className="p-8">
              {trainingMode === 'fr-to-jp' ? (
                // Mode: Français → Japonais
                <div className="text-center">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Traduisez en japonais :
                    </h2>
                    <p className="text-4xl font-bold text-blue-600">
                      {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                    </p>
                  </div>

                  {showAnswer && (
                    <div className="border-t pt-6 mt-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Kanji :</p>
                          <p className="text-6xl font-bold text-gray-800">{currentKanji.kanji}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Lecture :</p>
                          <p className="text-2xl text-gray-700">
                            {currentKanji.primaryReading || 
                             [...(currentKanji.onyomi || []), ...(currentKanji.kunyomi || [])][0] || 'N/A'}
                          </p>
                        </div>
                        {currentKanji.tags && currentKanji.tags.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600">Tags :</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {currentKanji.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Que signifie :
                    </h2>
                    <p className="text-8xl font-bold text-gray-800 mb-4">
                      {currentKanji.kanji}
                    </p>
                    <p className="text-2xl text-gray-600">
                      {currentKanji.primaryReading || 
                       [...(currentKanji.onyomi || []), ...(currentKanji.kunyomi || [])][0] || 'N/A'}
                    </p>
                  </div>

                  {showAnswer && (
                    <div className="border-t pt-6 mt-6">
                      <div>
                        <p className="text-sm text-gray-600">Signification :</p>
                        <p className="text-4xl font-bold text-blue-600">
                          {currentKanji.primaryMeaning || currentKanji.meanings[0]}
                        </p>
                      </div>
                      {currentKanji.tags && currentKanji.tags.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">Tags :</p>
                          <div className="flex flex-wrap gap-2 mt-1 justify-center">
                            {currentKanji.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
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
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-center">
                ✏️ Entraînez-vous à dessiner le kanji
              </h3>
              <div className="flex justify-center">
                <KanjiCanvas 
                  width={280} 
                  height={280}
                  onDrawingComplete={(data) => console.log('Dessin terminé:', data)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions et boutons de swipe */}
        <div className="text-center">
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-2">
              Swipez ou cliquez :
            </p>
            <div className="flex justify-center gap-8">
              <button
                onClick={() => handleSwipe('left')}
                className="flex flex-col items-center p-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <span className="text-2xl mb-2">👈</span>
                <span className="text-sm font-medium">Je ne sais pas</span>
              </button>
              
              <button
                onClick={() => handleSwipe('right')}
                className="flex flex-col items-center p-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
              >
                <span className="text-2xl mb-2">👉</span>
                <span className="text-sm font-medium">Je connais</span>
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Carte {currentIndex + 1} sur {selectedKanjis.length}
          </p>
        </div>
      </main>
    </div>
  );
}