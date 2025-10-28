import React from 'react';
import { SurvivalState, SurvivalStats } from '../services/survivalService';

interface SurvivalGameOverModalProps {
  isOpen: boolean;
  survivalState: SurvivalState;
  stats: SurvivalStats;
  onNewGame: () => void;
  onClose: () => void;
}

const SurvivalGameOverModal: React.FC<SurvivalGameOverModalProps> = ({
  isOpen,
  survivalState,
  stats,
  onNewGame,
  onClose
}) => {
  if (!isOpen) return null;

  // Calcul du rang selon le streak
  const getRank = (streak: number) => {
    if (streak < 5) return { emoji: '🌱', title: '初心者', subtitle: 'Débutant' };
    if (streak < 10) return { emoji: '🔥', title: '学生', subtitle: 'Étudiant' };
    if (streak < 20) return { emoji: '⚡', title: '練習生', subtitle: 'Apprenti' };
    if (streak < 50) return { emoji: '🚀', title: '達人', subtitle: 'Expert' };
    if (streak < 100) return { emoji: '👑', title: '師範', subtitle: 'Maître' };
    return { emoji: '🐉', title: '伝説', subtitle: 'Légende' };
  };

  const rank = getRank(survivalState.streak);
  const isNewRecord = survivalState.streak > stats.bestStreak;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-orange-50/95 to-red-50/95 backdrop-blur-md rounded-3xl border border-orange-200/80 shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
        
        {/* Titre Game Over avec animation */}
        <div className="mb-6 animate-fade-in-up">
          <div className="text-6xl mb-4 animate-wiggle">💥</div>
          <h2 className="text-3xl font-bold text-red-700 mb-2">
            ゲームオーバー
          </h2>
          <p className="text-lg text-red-600">Game Over</p>
        </div>

        {/* Record personnel si applicable */}
        {isNewRecord && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border border-yellow-300/50 animate-fade-in-up shadow-glow-orange" style={{ animationDelay: '200ms' }}>
            <div className="text-2xl mb-2 animate-bounce">🎉</div>
            <p className="text-sm font-bold text-yellow-700">
              新記録！ Nouveau record personnel !
            </p>
          </div>
        )}

        {/* Rang atteint avec animation */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="text-6xl mb-3 animate-bounce">{rank.emoji}</div>
          <h3 className="text-xl font-bold text-orange-700 mb-1">
            {rank.title}
          </h3>
          <p className="text-orange-600">{rank.subtitle}</p>
        </div>

        {/* Statistiques de la partie avec animations staggerées */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 rounded-xl p-3 border border-orange-200/50 animate-fade-in-up transition-smooth hover:scale-105 hover:shadow-glow-orange" style={{ animationDelay: '400ms' }}>
              <p className="text-2xl font-bold text-orange-700">
                {survivalState.streak}
              </p>
              <p className="text-sm text-orange-600">Série</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 border border-orange-200/50 animate-fade-in-up transition-smooth hover:scale-105 hover:shadow-glow-orange" style={{ animationDelay: '500ms' }}>
              <p className="text-2xl font-bold text-orange-700">
                {survivalState.level}
              </p>
              <p className="text-sm text-orange-600">Niveau</p>
            </div>
          </div>
          
          <div className="bg-white/80 rounded-xl p-3 border border-orange-200/50 animate-fade-in-up transition-smooth hover:scale-105 hover:shadow-glow-green" style={{ animationDelay: '600ms' }}>
            <p className="text-2xl font-bold text-orange-700">
              {survivalState.score.toLocaleString()}
            </p>
            <p className="text-sm text-orange-600">Score Total</p>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
          <h4 className="text-sm font-bold text-amber-700 mb-3">
            📊 Statistiques globales
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-bold text-amber-700">{stats.bestStreak}</p>
              <p className="text-amber-600">Meilleur série</p>
            </div>
            <div>
              <p className="font-bold text-amber-700">{stats.totalSessions}</p>
              <p className="text-amber-600">Parties jouées</p>
            </div>
            <div>
              <p className="font-bold text-amber-700">{Math.round(stats.averageStreak)}</p>
              <p className="text-amber-600">Série moyenne</p>
            </div>
            <div>
              <p className="font-bold text-amber-700">{stats.totalQuestions}</p>
              <p className="text-amber-600">Questions total</p>
            </div>
          </div>
        </div>

        {/* Message d'encouragement personnalisé */}
        <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <p className="text-sm text-blue-700">
            {survivalState.streak === 0 && "🌱 Premier essai ! Chaque maître a commencé par un premier pas."}
            {survivalState.streak >= 1 && survivalState.streak < 5 && "🔥 Bon début ! Continue à t'entraîner !"}
            {survivalState.streak >= 5 && survivalState.streak < 10 && "⚡ Très bien ! Tu progresses rapidement !"}
            {survivalState.streak >= 10 && survivalState.streak < 20 && "🚀 Fantastique ! Tu maîtrises de mieux en mieux !"}
            {survivalState.streak >= 20 && survivalState.streak < 50 && "🌟 Incroyable série ! Tu es sur la bonne voie !"}
            {survivalState.streak >= 50 && "👑 Légendaire ! Tu es un vrai sensei des kanjis !"}
          </p>
        </div>

        {/* Actions avec animations */}
        <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <button
            onClick={onNewGame}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-glow-orange active:scale-95"
          >
            🎮 Nouvelle partie
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-gray-300/50 active:scale-95"
          >
            🏠 Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurvivalGameOverModal;