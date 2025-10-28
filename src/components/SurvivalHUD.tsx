import React from "react";
import { SurvivalState } from "../services/survivalService";

interface SurvivalHUDProps {
  survivalState: SurvivalState;
  encouragementMessage?: { emoji: string; message: string };
}

const SurvivalHUD: React.FC<SurvivalHUDProps> = ({
  survivalState,
  encouragementMessage,
}) => {
  // Animation pour les vies perdues
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < survivalState.maxLives; i++) {
      const isAlive = i < survivalState.lives;
      hearts.push(
        <span
          key={i}
          className={`text-lg transition-all duration-500 ease-out ${
            isAlive
              ? "text-red-500 transform scale-100 animate-heartbeat"
              : "text-gray-300 transform scale-75 opacity-50 animate-wiggle"
          }`}
          style={{
            animationDelay: `${i * 100}ms`,
            animationDuration: isAlive ? "2s" : "1s",
          }}
        >
          {isAlive ? "❤️" : "💔"}
        </span>
      );
    }
    return hearts;
  };

  // Calcul de la progression du niveau
  const progressInLevel = ((survivalState.streak % 10) / 10) * 100;

  return (
    <div className="bg-gradient-to-r from-orange-100/90 to-red-100/90 backdrop-blur-sm rounded-2xl border border-orange-200/80 shadow-lg p-4 mb-4 animate-fade-in floating-particles shine-effect">
      {/* Première ligne : Titre et direction avec animations */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 animate-slide-in-left">
          <span className="text-2xl animate-bounce">🔥</span>
          <div>
            <h2 className="text-lg font-bold text-orange-700">持久モード</h2>
            <p className="text-sm text-orange-600">Mode Endurance</p>
          </div>
        </div>

        {/* Direction de la question avec animation */}
        <div className="text-center bg-white/80 rounded-lg px-3 py-1 border border-orange-200/50 animate-slide-in-right transition-smooth hover:scale-105 hover:bg-white">
          <p className="text-sm font-bold text-orange-700">
            {survivalState.currentDirection === "jp-to-fr"
              ? "🇯🇵 → 🇫🇷"
              : "🇫🇷 → 🇯🇵"}
          </p>
          <p className="text-xs text-orange-600">
            {survivalState.currentDirection === "jp-to-fr"
              ? "Japonais → Français"
              : "Français → Japonais"}
          </p>
        </div>
      </div>

      {/* Deuxième ligne : Stats principales avec animations staggerées */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-3">
        {/* Vies */}
        <div
          className="text-center bg-white/80 rounded-lg p-1 sm:p-2 border border-orange-200/50 animate-fade-in-up transition-smooth hover:scale-105 hover:shadow-glow-red"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex justify-center gap-0.5 mb-1">
            {renderHearts()}
          </div>
          <p className="text-xs font-bold text-orange-700">Vies</p>
        </div>

        {/* Série */}
        <div
          className="text-center bg-white/80 rounded-lg p-1 sm:p-2 border border-orange-200/50 animate-fade-in-up transition-smooth hover:scale-105 hover:shadow-glow-orange"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-lg sm:text-xl font-bold text-orange-700 transition-all duration-300 hover:scale-110">
            {survivalState.streak}
          </p>
          <p className="text-xs font-bold text-orange-600">Série</p>
        </div>

        {/* Niveau */}
        <div
          className="text-center bg-white/80 rounded-lg p-1 sm:p-2 border border-orange-200/50 animate-fade-in-up transition-smooth hover:scale-105 hover:shadow-glow-orange"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-lg sm:text-xl font-bold text-orange-700 transition-all duration-300 hover:scale-110">
            {survivalState.level}
          </p>
          <p className="text-xs font-bold text-orange-600">Niveau</p>
        </div>

        {/* Score */}
        <div
          className="text-center bg-white/80 rounded-lg p-1 sm:p-2 border border-orange-200/50 animate-fade-in-up transition-smooth hover:scale-105 hover:shadow-glow-green"
          style={{ animationDelay: "400ms" }}
        >
          <p className="text-sm sm:text-lg font-bold text-orange-700 transition-all duration-300 hover:scale-110">
            {survivalState.score.toLocaleString()}
          </p>
          <p className="text-xs font-bold text-orange-600">Score</p>
        </div>
      </div>

      {/* Barre de progression vers le niveau suivant avec animation */}
      <div
        className="mb-3 animate-fade-in-up"
        style={{ animationDelay: "500ms" }}
      >
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-orange-600">
            Progression niveau {survivalState.level + 1}
          </p>
          <p className="text-xs text-orange-600 font-bold">
            {survivalState.streak % 10}/10
          </p>
        </div>
        <div className="w-full bg-orange-200/50 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700 ease-out relative"
            style={{ width: `${progressInLevel}%` }}
          >
            {/* Effet de brillance sur la barre de progression */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
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
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : "bg-orange-200/50"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-orange-600">
          {survivalState.level <= 10 && "易しい (Facile)"}
          {survivalState.level > 10 &&
            survivalState.level <= 25 &&
            "普通 (Normal)"}
          {survivalState.level > 25 &&
            survivalState.level <= 50 &&
            "難しい (Difficile)"}
          {survivalState.level > 50 && "地獄 (Infernal)"}
        </span>
      </div>
    </div>
  );
};

export default SurvivalHUD;
