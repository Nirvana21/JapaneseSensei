import React from 'react';
import { SurvivalState } from '../services/survivalService';

interface SurvivalHUDProps {
  survivalState: SurvivalState;
  encouragementMessage?: { emoji: string; message: string };
}

const SurvivalHUD: React.FC<SurvivalHUDProps> = ({
  survivalState,
  encouragementMessage
}) => {
  // Animation pour les vies perdues
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < survivalState.maxLives; i++) {
      const isAlive = i < survivalState.lives;
      hearts.push(
        <span
          key={i}
          className={`text-2xl transition-all duration-300 ${
            isAlive 
              ? 'text-red-500 transform scale-100' 
              : 'text-gray-300 transform scale-75 opacity-50'
          }`}
        >
          {isAlive ? '❤️' : '💔'}
        </span>
      );
    }
    return hearts;
  };

  // Calcul de la progression du niveau
  const progressInLevel = (survivalState.streak % 10) / 10 * 100;

  return (
    <div className="bg-gradient-to-r from-orange-100/90 to-red-100/90 backdrop-blur-sm rounded-2xl border border-orange-200/80 shadow-lg p-4 mb-4">
      
      {/* Première ligne : Titre et direction */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <h2 className="text-lg font-bold text-orange-700">
              持久モード
            </h2>
            <p className="text-sm text-orange-600">Mode Endurance</p>
          </div>
        </div>
        
        {/* Direction de la question */}
        <div className="text-center bg-white/70 rounded-lg px-3 py-1 border border-orange-200/50">
          <p className="text-sm font-bold text-orange-700">
            {survivalState.currentDirection === 'jp-to-fr' 
              ? '🇯🇵 → 🇫🇷' 
              : '🇫🇷 → 🇯🇵'
            }
          </p>
          <p className="text-xs text-orange-600">
            {survivalState.currentDirection === 'jp-to-fr' 
              ? 'Japonais → Français' 
              : 'Français → Japonais'
            }
          </p>
        </div>
      </div>

      {/* Deuxième ligne : Stats principales */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        
        {/* Vies */}
        <div className="text-center bg-white/70 rounded-lg p-2 border border-orange-200/50">
          <div className="flex justify-center gap-1 mb-1">
            {renderHearts()}
          </div>
          <p className="text-xs font-bold text-orange-700">Vies</p>
        </div>
        
        {/* Série */}
        <div className="text-center bg-white/70 rounded-lg p-2 border border-orange-200/50">
          <p className="text-xl font-bold text-orange-700">
            {survivalState.streak}
          </p>
          <p className="text-xs font-bold text-orange-600">Série</p>
        </div>
        
        {/* Niveau */}
        <div className="text-center bg-white/70 rounded-lg p-2 border border-orange-200/50">
          <p className="text-xl font-bold text-orange-700">
            {survivalState.level}
          </p>
          <p className="text-xs font-bold text-orange-600">Niveau</p>
        </div>
        
        {/* Score */}
        <div className="text-center bg-white/70 rounded-lg p-2 border border-orange-200/50">
          <p className="text-lg font-bold text-orange-700">
            {survivalState.score.toLocaleString()}
          </p>
          <p className="text-xs font-bold text-orange-600">Score</p>
        </div>
      </div>

      {/* Barre de progression vers le niveau suivant */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-orange-600">
            Progression niveau {survivalState.level + 1}
          </p>
          <p className="text-xs text-orange-600">
            {survivalState.streak % 10}/10
          </p>
        </div>
        <div className="w-full bg-orange-200/50 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 ease-out"
            style={{ width: `${progressInLevel}%` }}
          />
        </div>
      </div>

      {/* Message d'encouragement */}
      {encouragementMessage && (
        <div className="text-center bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2 border border-amber-200/50">
          <p className="text-sm font-bold text-amber-700">
            <span className="mr-2">{encouragementMessage.emoji}</span>
            {encouragementMessage.message}
          </p>
        </div>
      )}

      {/* Indicateur de difficulté */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-xs text-orange-600">Difficulté:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                dot <= Math.min(5, Math.ceil(survivalState.level / 10))
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-orange-200/50'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-orange-600">
          {survivalState.level <= 10 && '易しい (Facile)'}
          {survivalState.level > 10 && survivalState.level <= 25 && '普通 (Normal)'}
          {survivalState.level > 25 && survivalState.level <= 50 && '難しい (Difficile)'}
          {survivalState.level > 50 && '地獄 (Infernal)'}
        </span>
      </div>
    </div>
  );
};

export default SurvivalHUD;