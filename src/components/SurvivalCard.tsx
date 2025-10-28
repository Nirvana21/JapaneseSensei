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
    
    setSelectedAnswer(isCorrect ? 'correct' : 'incorrect');
    
    // Petit délai pour l'animation
    setTimeout(() => {
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
          transition-all duration-300 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedAnswer === 'correct' ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100' : ''}
          ${selectedAnswer === 'incorrect' ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100' : 'border-orange-200/80'}
          ${!showAnswer ? 'hover:shadow-3xl hover:scale-105' : ''}
        `}
      >
        
        {/* Indicateur de direction */}
        <div className="absolute top-4 right-4 bg-white/80 rounded-full px-3 py-1 border border-orange-200/50">
          <p className="text-xs font-bold text-orange-700">
            {direction === 'jp-to-fr' ? '🇯🇵 → 🇫🇷' : '🇫🇷 → 🇯🇵'}
          </p>
        </div>

        {/* Question */}
        <div className="text-center mb-6">
          <p className="text-sm text-orange-600 mb-2 font-medium">
            {content.questionLabel}
          </p>
          <div className={content.questionClass}>
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

        {/* Séparateur avec animation */}
        <div className="w-full flex justify-center mb-6">
          <div className={`
            w-16 h-1 rounded-full transition-all duration-500
            ${showAnswer 
              ? 'bg-gradient-to-r from-green-400 to-green-600' 
              : 'bg-gradient-to-r from-orange-400 to-red-500'
            }
          `} />
        </div>

        {/* Réponse (visible après clic) */}
        {showAnswer ? (
          <div className="text-center">
            <p className="text-sm text-green-600 mb-2 font-medium">
              {content.answerLabel}
            </p>
            <div className={content.answerClass}>
              {content.answer}
            </div>
            
            {/* Canvas pour comparer APRÈS révélation (FR → JP seulement) */}
            {direction === 'fr-to-jp' && (
              <div className="mt-4 w-full">
                <p className="text-xs text-green-600 mb-2 text-center">
                  ✏️ Comparez avec votre dessin ci-dessus
                </p>
                <div className="text-center text-sm text-green-700 mb-3">
                  Votre tentative vs la réponse ⬆️
                </div>
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
          <div className="text-center text-orange-500">
            <p className="text-sm font-medium">
              👆 Touchez pour révéler
            </p>
          </div>
        )}

        {/* Animation de feedback */}
        {selectedAnswer && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`
              text-6xl animate-pulse
              ${selectedAnswer === 'correct' ? 'text-green-500' : 'text-red-500'}
            `}>
              {selectedAnswer === 'correct' ? '✅' : '❌'}
            </div>
          </div>
        )}
      </div>

      {/* Boutons de réponse (visibles après révélation) */}
      {showAnswer && !selectedAnswer && (
        <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 px-2 sm:px-0">
          <button
            onClick={() => handleAnswer(false)}
            disabled={disabled}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl">👈</span>
              <div className="text-left">
                <p className="text-sm">知らない</p>
                <p className="text-xs opacity-90">Pas sûr</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleAnswer(true)}
            disabled={disabled}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="text-right">
                <p className="text-sm">知ってる</p>
                <p className="text-xs opacity-90">Je sais</p>
              </div>
              <span className="text-xl sm:text-2xl">👉</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default SurvivalCard;