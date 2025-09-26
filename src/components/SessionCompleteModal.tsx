import Link from 'next/link';

interface SessionCompleteModalProps {
  isOpen: boolean;
  stats: {
    correct: number;
    total: number;
    sessionComplete: boolean;
  };
  onNewSession: () => void;
  onClose: () => void;
}

export default function SessionCompleteModal({ 
  isOpen, 
  stats, 
  onNewSession, 
  onClose 
}: SessionCompleteModalProps) {
  if (!isOpen || !stats.sessionComplete || stats.total === 0) {
    return null;
  }

  const percentage = Math.round((stats.correct / stats.total) * 100);
  const note = Math.round((stats.correct / stats.total) * 20);

  // Fonction pour obtenir l'icône et le titre selon la performance
  const getPerformanceData = () => {
    if (percentage >= 90) {
      return {
        icon: "🏆",
        title: "Excellent !",
        color: "text-yellow-300"
      };
    } else if (percentage >= 75) {
      return {
        icon: "⭐",
        title: "Très bien !",
        color: "text-green-300"
      };
    } else if (percentage >= 50) {
      return {
        icon: "📚",
        title: "Bon travail !",
        color: "text-blue-300"
      };
    } else {
      return {
        icon: "💪",
        title: "Continue tes efforts !",
        color: "text-orange-300"
      };
    }
  };

  // Fonction pour obtenir le commentaire personnalisé
  const getPersonalizedComment = () => {
    const totalCards = stats.total;
    
    if (percentage >= 90) {
      return `🌟 Performance exceptionnelle ! Tu maîtrises vraiment bien ces ${totalCards} kanjis. Continue comme ça !`;
    } else if (percentage >= 75) {
      return `👏 Très bonne performance ! Tu es sur la bonne voie pour maîtriser ces ${totalCards} kanjis. Encore quelques révisions et ce sera parfait !`;
    } else if (percentage >= 50) {
      return `📈 Tu progresses bien ! Ces ${totalCards} kanjis commencent à rentrer. Continue à t'entraîner régulièrement !`;
    } else {
      return `💡 Ne te décourage pas ! Ces ${totalCards} kanjis sont nouveaux pour toi. Avec de la pratique régulière, tu vas y arriver !`;
    }
  };

  // Fonction pour obtenir l'encouragement selon l'heure
  const getTimeBasedEncouragement = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return "☀️ Bonne matinée d'étude !";
    } else if (hour >= 12 && hour < 17) {
      return "🌤️ Bon après-midi d'apprentissage !";
    } else if (hour >= 17 && hour < 22) {
      return "🌆 Bonne soirée de révisions !";
    } else {
      return "🌙 Bonne séance de nuit !";
    }
  };

  const performanceData = getPerformanceData();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay avec backdrop blur */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
      
      {/* Modal centré */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-lg">
          {/* Contenu du modal */}
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl p-8 transform transition-all">
            
            {/* Bouton fermer (optionnel, en haut à droite) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icône et titre selon la performance */}
            <div className="mb-6 text-center">
              <div className="text-6xl mb-4">{performanceData.icon}</div>
              <h3 className={`text-2xl font-bold ${performanceData.color} mb-2`}>
                Session terminée !
              </h3>
              <h4 className={`text-xl font-semibold ${performanceData.color}`}>
                {performanceData.title}
              </h4>
            </div>

            {/* Score et note */}
            <div className="mb-6 space-y-4">
              {/* Statistiques */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-100">{stats.correct}/{stats.total}</p>
                  <p className="text-sm text-slate-400">Bonnes réponses</p>
                </div>
                <div className="h-12 w-px bg-slate-600"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-100">{percentage}%</p>
                  <p className="text-sm text-slate-400">Réussite</p>
                </div>
                <div className="h-12 w-px bg-slate-600"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-100">{note}/20</p>
                  <p className="text-sm text-slate-400">Note</p>
                </div>
              </div>

              {/* Barre de progression visuelle */}
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    percentage >= 90 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    percentage >= 75 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                    percentage >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                    'bg-gradient-to-r from-orange-400 to-orange-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Commentaire personnalisé */}
            <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/30">
              <p className="text-slate-300 text-sm leading-relaxed">
                {getPersonalizedComment()}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onNewSession}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 Nouvelle session
              </button>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-slate-700/80 text-slate-300 font-medium text-center rounded-xl hover:bg-slate-600/80 transition-all"
              >
                🏠 Retour au menu
              </Link>
            </div>

            {/* Encouragement selon l'heure */}
            <div className="mt-6 text-center text-xs text-slate-500">
              {getTimeBasedEncouragement()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}