import React, { useState } from 'react';
import { SimpleLearningKanji } from '../services/adaptiveLearningService';
import KanjiCanvas from './KanjiCanvas';

interface SurvivalCardProps {
  kanji: SimpleLearningKanji;
  direction: 'jp-to-fr' | 'fr-to-jp';
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
  clearCanvas?: number; // Pour réinitialiser le canvas
}

const SurvivalCard: React.FC<SurvivalCardProps> = ({
  kanji,
  direction,
  onAnswer,
  disabled = false,
  clearCanvas = 0
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Contenu selon la direction
  const getQuestionContent = () => {
    if (direction === 'jp-to-fr') {
      return {
        question: kanji.kanji,
        questionLabel: 'Kanji',
        answer: kanji.primaryMeaning || kanji.meanings[0],
        answerLabel: 'Signification',
        questionClass: 'text-6xl font-bold text-orange-700',
        answerClass: 'text-2xl font-bold text-green-700'
      };
    } else {
      return {
        question: kanji.primaryMeaning || kanji.meanings[0],
        questionLabel: 'Signification',
        answer: kanji.kanji,
        answerLabel: 'Kanji',
        questionClass: 'text-2xl font-bold text-orange-700',
        answerClass: 'text-6xl font-bold text-green-700'
      };
    }
  };

  const content = getQuestionContent();

  // Générer des choix multiples pour rendre plus ludique
  const generateChoices = () => {
    // Pour simplifier, on va garder le système de swipe pour l'instant
    // Mais on pourrait ajouter des choix multiples plus tard
    return [];
  };

  const handleCardClick = () => {
    if (!disabled && !showAnswer) {
      setShowAnswer(true);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (disabled) return;
    
    console.log('SurvivalCard handleAnswer called with:', isCorrect); // Debug
    setSelectedAnswer(isCorrect ? 'correct' : 'incorrect');
    
    // Petit délai pour l'animation
    setTimeout(() => {
      console.log('SurvivalCard calling onAnswer with:', isCorrect); // Debug
      onAnswer(isCorrect);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }, 800);
  };

  return (
    <div className="relative max-w-md mx-auto px-2 sm:px-0">
      
      {/* Carte principale */}
      <div
        onClick={handleCardClick}
        className={`
          bg-gradient-to-br from-orange-50/95 to-red-50/95 
          backdrop-blur-md rounded-3xl border-2 shadow-2xl 
          min-h-[350px] sm:min-h-[400px] flex flex-col justify-center items-center p-4 sm:p-8 
          transition-all duration-500 ease-out cursor-pointer relative overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedAnswer === 'correct' ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 scale-105' : ''}
          ${selectedAnswer === 'incorrect' ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 scale-105' : 'border-orange-200/80'}
          ${!showAnswer && !disabled ? 'hover:shadow-3xl hover:scale-[1.02] hover:border-red-300' : ''}
          ${showAnswer ? 'shadow-green-200/50' : 'shadow-orange-200/50'}
        `}
      >
        
        {/* Effet de brillance au survol */}
        {!showAnswer && !disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
        )}
        
        {/* Particules flottantes d'ambiance */}
        <div className="absolute top-2 left-4 w-2 h-2 bg-orange-300/30 rounded-full animate-pulse" />
        <div className="absolute top-8 right-8 w-1 h-1 bg-red-400/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
        
        {/* Indicateur de direction avec animation */}
        <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 border border-orange-200/50 transition-all duration-300 hover:scale-110 hover:bg-white">
          <p className="text-xs font-bold text-orange-700">
            {direction === 'jp-to-fr' ? '🇯🇵 → 🇫🇷' : '🇫🇷 → 🇯🇵'}
          </p>
        </div>

        {/* Question avec animation d'apparition */}
        <div className="text-center mb-6 transform transition-all duration-500 ease-out">
          <p className="text-sm text-orange-600 mb-2 font-medium opacity-80 animate-fade-in">
            {content.questionLabel}
          </p>
          <div className={`${content.questionClass} transition-all duration-300 hover:scale-105`}>
            {content.question}
          </div>
        </div>

        {/* Canvas pour dessiner AVANT de révéler (FR → JP seulement) */}
        {direction === 'fr-to-jp' && !showAnswer && (
          <div className="mb-6 w-full">
            <p className="text-xs text-orange-600 mb-3 text-center">
              ✏️ Essayez d'écrire le kanji puis révélez la réponse
            </p>
            <div className="flex justify-center">
              <div className="w-48 h-48 sm:w-60 sm:h-60">
                <KanjiCanvas 
                  width={240}
                  height={240}
                  clearTrigger={clearCanvas}
                  className="mx-auto max-w-full max-h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Séparateur avec animation améliorée */}
        <div className="w-full flex justify-center mb-6">
          <div className={`
            w-16 h-1 rounded-full transition-all duration-700 ease-out
            ${showAnswer 
              ? 'bg-gradient-to-r from-green-400 to-green-600 w-24 h-1.5' 
              : 'bg-gradient-to-r from-orange-400 to-red-500 animate-pulse'
            }
          `} />
        </div>

        {/* Réponse avec animation d'entrée fluide */}
        {showAnswer ? (
          <div className="text-center animate-fade-in-up">
            <p className="text-sm text-green-600 mb-2 font-medium opacity-80">
              {content.answerLabel}
            </p>
            <div className={`${content.answerClass} transition-all duration-300 hover:scale-110`}>
              {content.answer}
            </div>
            
            {/* Canvas pour comparer APRÈS révélation (FR → JP seulement) */}
            {direction === 'fr-to-jp' && (
              <div className="mt-4 w-full">
                <p className="text-xs text-green-600 mb-2 text-center">
                  ✏️ Comparez avec votre dessin ci-dessus
                </p>
                <div className="text-center text-sm text-green-700 mb-3">
                  Votre tentative ⬆️ vs la réponse ⬇️
                </div>
                {/* Canvas de comparaison - différent du premier */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 sm:w-60 sm:h-60 bg-gray-100 rounded-lg border-2 border-dashed border-green-300">
                    <KanjiCanvas 
                      width={240}
                      height={240}
                      clearTrigger={clearCanvas + 1000} // Trigger différent pour éviter les conflits
                      className="mx-auto max-w-full max-h-full opacity-70"
                    />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 text-center">
                  ⬆️ Canvas de comparaison - Vous pouvez dessiner ici aussi
                </p>
              </div>
            )}
            
            {/* Informations supplémentaires selon la direction */}
            {direction === 'jp-to-fr' && (
              <div className="mt-4 space-y-2">
                {kanji.onyomi && kanji.onyomi.length > 0 && (
                  <div className="text-sm">
                    <span className="text-blue-600 font-medium">On'yomi: </span>
                    <span className="text-blue-700">{kanji.onyomi.join(', ')}</span>
                  </div>
                )}
                {kanji.kunyomi && kanji.kunyomi.length > 0 && (
                  <div className="text-sm">
                    <span className="text-purple-600 font-medium">Kun'yomi: </span>
                    <span className="text-purple-700">{kanji.kunyomi.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
            
            {direction === 'fr-to-jp' && (
              <div className="mt-4 space-y-2">
                {kanji.onyomi && kanji.onyomi.length > 0 && (
                  <div className="text-sm">
                    <span className="text-blue-600 font-medium">On'yomi: </span>
                    <span className="text-blue-700">{kanji.onyomi.join(', ')}</span>
                  </div>
                )}
                {kanji.kunyomi && kanji.kunyomi.length > 0 && (
                  <div className="text-sm">
                    <span className="text-purple-600 font-medium">Kun'yomi: </span>
                    <span className="text-purple-700">{kanji.kunyomi.join(', ')}</span>
                  </div>
                )}
                {kanji.meanings && kanji.meanings.length > 1 && (
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">Autres sens: </span>
                    <span className="text-green-700">{kanji.meanings.slice(1).join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-orange-500 animate-bounce">
            <p className="text-sm font-medium">
              👆 Touchez pour révéler
            </p>
            <div className="mt-2 flex justify-center">
              <div className="w-8 h-1 bg-orange-300 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Animation de feedback améliorée */}
        {selectedAnswer && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className={`
              text-8xl transition-all duration-500 ease-out
              ${selectedAnswer === 'correct' 
                ? 'text-green-500 animate-bounce scale-110' 
                : 'text-red-500 animate-pulse scale-110'
              }
            `}>
              {selectedAnswer === 'correct' ? '✅' : '❌'}
            </div>
            {/* Onde de choc visuelle */}
            <div className={`
              absolute w-32 h-32 rounded-full opacity-20 animate-ping
              ${selectedAnswer === 'correct' ? 'bg-green-400' : 'bg-red-400'}
            `} />
          </div>
        )}
      </div>

      {/* Boutons de réponse avec animations améliorées */}
      {showAnswer && !selectedAnswer && (
        <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 px-2 sm:px-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => handleAnswer(false)}
            disabled={disabled}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-red-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl animate-pulse">👈</span>
              <div className="text-left">
                <p className="text-sm">知らない</p>
                <p className="text-xs opacity-90">Pas sûr</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleAnswer(true)}
            disabled={disabled}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-green-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="text-right">
                <p className="text-sm">知ってる</p>
                <p className="text-xs opacity-90">Je sais</p>
              </div>
              <span className="text-xl sm:text-2xl animate-pulse">👉</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default SurvivalCard;