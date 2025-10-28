import Link from "next/link";

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
  onClose,
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
        title: "優秀！ Excellent !",
        color: "text-yellow-600",
      };
    } else if (percentage >= 75) {
      return {
        icon: "⭐",
        title: "とても良い！ Très bien !",
        color: "text-green-700",
      };
    } else if (percentage >= 50) {
      return {
        icon: "📚",
        title: "良い仕事！ Bon travail !",
        color: "text-blue-700",
      };
    } else {
      return {
        icon: "💪",
        title: "頑張り続けて！ Continue tes efforts !",
        color: "text-orange-700",
      };
    }
  };

  // Fonction pour obtenir le commentaire personnalisé
  const getPersonalizedComment = () => {
    const totalCards = stats.total;

    if (percentage >= 90) {
      return `🌟 素晴らしい成績！ Performance exceptionnelle ! Tu maîtrises vraiment bien ces ${totalCards} kanjis. このまま続けて！ Continue comme ça !`;
    } else if (percentage >= 75) {
      return `👏 とても良い成績！ Très bonne performance ! Tu es sur la bonne voie pour maîtriser ces ${totalCards} kanjis. もう少し復習すれば完璧！ Encore quelques révisions et ce sera parfait !`;
    } else if (percentage >= 50) {
      return `📈 良い進歩！ Tu progresses bien ! Ces ${totalCards} kanjis commencent à rentrer. 定期的に練習を続けて！ Continue à t'entraîner régulièrement !`;
    } else {
      return `💡 諦めないで！ Ne te décourage pas ! Ces ${totalCards} kanjis sont nouveaux pour toi. 定期的な練習で必ずできるようになる！ Avec de la pratique régulière, tu vas y arriver !`;
    }
  };

  // Fonction pour obtenir l'encouragement selon l'heure
  const getTimeBasedEncouragement = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return "☀️ おはよう勉強！ Bonne matinée d'étude !";
    } else if (hour >= 12 && hour < 17) {
      return "🌤️ 午後の学習お疲れ様！ Bon après-midi d'apprentissage !";
    } else if (hour >= 17 && hour < 22) {
      return "🌆 夜の復習お疲れ様！ Bonne soirée de révisions !";
    } else {
      return "🌙 夜遅くまでお疲れ様！ Bonne séance de nuit !";
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
          <div className="bg-gradient-to-br from-orange-50/95 to-red-50/95 backdrop-blur-md rounded-2xl border border-orange-300 shadow-2xl p-8 transform transition-all">
            {/* Bouton fermer (optionnel, en haut à droite) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-orange-600 hover:text-red-600 hover:bg-orange-200/50 rounded-lg transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Icône et titre selon la performance */}
            <div className="mb-6 text-center">
              <div className="text-6xl mb-4">{performanceData.icon}</div>
              <h3
                className={`text-2xl font-bold ${performanceData.color} mb-2`}
              >
                セッション完了！ Session terminée !
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
                  <p className="text-3xl font-bold text-red-900">
                    {stats.correct}/{stats.total}
                  </p>
                  <p className="text-sm text-orange-700">
                    正解 Bonnes réponses
                  </p>
                </div>
                <div className="h-12 w-px bg-orange-400"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-900">
                    {percentage}%
                  </p>
                  <p className="text-sm text-orange-700">成功率 Réussite</p>
                </div>
                <div className="h-12 w-px bg-orange-400"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-900">{note}/20</p>
                  <p className="text-sm text-orange-700">点数 Note</p>
                </div>
              </div>

              {/* Barre de progression visuelle */}
              <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    percentage >= 90
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                      : percentage >= 75
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : percentage >= 50
                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                      : "bg-gradient-to-r from-orange-500 to-orange-600"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Commentaire personnalisé */}
            <div className="mb-6 p-4 bg-orange-100/80 rounded-xl border border-orange-200">
              <p className="text-red-800 text-sm leading-relaxed">
                {getPersonalizedComment()}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onNewSession}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 新しいセッション Nouvelle session
              </button>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-orange-200 text-orange-800 font-medium text-center rounded-xl hover:bg-orange-300 transition-all"
              >
                🏠 メニューに戻る Retour au menu
              </Link>
            </div>

            {/* Encouragement selon l'heure */}
            <div className="mt-6 text-center text-xs text-orange-600">
              {getTimeBasedEncouragement()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
