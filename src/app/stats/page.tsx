'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useKanjis } from '../../hooks/useKanjis';
import { simpleAdaptiveLearningService, SimpleLearningKanji } from '../../services/adaptiveLearningService';

interface DetailedStats {
  totalKanjis: number;
  masteryDistribution: {
    new: number;
    difficult: number;
    medium: number;
    mastered: number;
  };
  studyStreak: number;
  totalStudySessions: number;
  averageSessionScore: number;
  bestStreak: number;
  weakestKanjis: SimpleLearningKanji[];
  strongestKanjis: SimpleLearningKanji[];
  recentProgress: Array<{
    date: string;
    correctAnswers: number;
    totalAnswers: number;
  }>;
  tagsStats: Array<{
    tag: string;
    count: number;
    averageScore: number;
  }>;
}

export default function StatsPage() {
  const { kanjis } = useKanjis();
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [allLearningKanjis, setAllLearningKanjis] = useState<SimpleLearningKanji[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (kanjis.length > 0) {
      calculateDetailedStats();
    }
  }, [kanjis]);

  const calculateDetailedStats = () => {
    setLoading(true);
    
    const learningKanjis = kanjis.map(kanji => {
      const existingData = localStorage.getItem(`simple_learning_${kanji.id}`);
      if (existingData) {
        const parsed = JSON.parse(existingData);
        return {
          ...kanji,
          learningData: {
            ...parsed.learningData,
            lastSeen: new Date(parsed.learningData.lastSeen)
          },
          studyData: parsed.studyData
        };
      }
      return simpleAdaptiveLearningService.initializeLearningData(kanji);
    });

    setAllLearningKanjis(learningKanjis);

    const masteryDistribution = {
      new: learningKanjis.filter(k => k.learningData.score === 0).length,
      difficult: learningKanjis.filter(k => k.learningData.score === 1).length,
      medium: learningKanjis.filter(k => k.learningData.score === 2).length,
      mastered: learningKanjis.filter(k => k.learningData.score === 3).length,
    };

    const sortedByScore = [...learningKanjis].sort((a, b) => a.learningData.score - b.learningData.score);
    const weakestKanjis = sortedByScore.slice(0, 5);
    const strongestKanjis = sortedByScore.slice(-5).reverse();

    const tagMap = new Map<string, { total: number; scoreSum: number }>();
    learningKanjis.forEach(kanji => {
      kanji.tags?.forEach(tag => {
        const current = tagMap.get(tag) || { total: 0, scoreSum: 0 };
        tagMap.set(tag, {
          total: current.total + 1,
          scoreSum: current.scoreSum + kanji.learningData.score
        });
      });
    });

    const tagsStats = Array.from(tagMap.entries())
      .map(([tag, data]) => ({
        tag,
        count: data.total,
        averageScore: data.scoreSum / data.total
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const studyStreak = calculateStudyStreak(learningKanjis);
    const totalStudySessions = learningKanjis.reduce((sum, k) => sum + (k.learningData.totalAttempts || 0), 0);
    const totalCorrect = learningKanjis.reduce((sum, k) => sum + (k.learningData.correctAttempts || 0), 0);
    const averageSessionScore = totalStudySessions > 0 ? (totalCorrect / totalStudySessions) * 100 : 0;

    const detailedStats: DetailedStats = {
      totalKanjis: learningKanjis.length,
      masteryDistribution,
      studyStreak,
      totalStudySessions,
      averageSessionScore,
      bestStreak: studyStreak,
      weakestKanjis,
      strongestKanjis,
      recentProgress: [],
      tagsStats
    };

    setStats(detailedStats);
    setLoading(false);
  };

  const calculateStudyStreak = (kanjis: SimpleLearningKanji[]): number => {
    const today = new Date();
    const studiedKanjis = kanjis.filter(k => k.learningData.lastSeen);
    
    if (studiedKanjis.length === 0) return 0;
    
    const lastStudyDate = new Date(Math.max(...studiedKanjis.map(k => k.learningData.lastSeen.getTime())));
    const daysSinceLastStudy = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceLastStudy <= 1 ? Math.min(studiedKanjis.length, 7) : 0;
  };

  const resetGlobalStats = () => {
    if (window.confirm('Réinitialiser toutes les statistiques ?')) {
      kanjis.forEach(kanji => {
        const key = `simple_learning_${kanji.id}`;
        localStorage.removeItem(key);
      });
      calculateDetailedStats();
      alert('Statistiques réinitialisées !');
    }
  };

  const getMasteryColor = (score: number) => {
    const colors = {
      0: 'text-gray-400',
      1: 'text-red-400',
      2: 'text-orange-400',
      3: 'text-green-400'
    };
    return colors[score as keyof typeof colors] || 'text-gray-400';
  };

  const getMasteryIcon = (score: number) => {
    const icons = {
      0: '🆕',
      1: '❌',
      2: '⚠️',
      3: '✅'
    };
    return icons[score as keyof typeof icons] || '❓';
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Calcul des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header épuré */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 border border-gray-200"
            >
              <span className="text-lg">🏠</span>
              <span className="text-gray-700 font-medium text-sm">Menu</span>
            </Link>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-2xl md:text-3xl font-light text-gray-800">
                <span className="text-3xl md:text-4xl mr-3">📊</span>
                <span className="hidden sm:inline">Statistiques</span>
                <span className="sm:hidden">Stats</span>
              </h1>
            </div>
            
            <button
              onClick={resetGlobalStats}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 border border-red-200"
            >
              <span className="text-lg">🗑️</span>
              <span className="text-red-600 font-medium text-sm hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal épuré */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Kanjis</p>
                <p className="text-3xl font-light text-gray-800">{stats.totalKanjis}</p>
              </div>
              <div className="text-4xl opacity-60">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Streak</p>
                <p className="text-3xl font-light text-orange-500">{stats.studyStreak}</p>
              </div>
              <div className="text-4xl opacity-60">🔥</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Sessions</p>
                <p className="text-3xl font-light text-blue-500">{stats.totalStudySessions}</p>
              </div>
              <div className="text-4xl opacity-60">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Score</p>
                <p className="text-3xl font-light text-green-500">{stats.averageSessionScore.toFixed(0)}%</p>
              </div>
              <div className="text-4xl opacity-60">📈</div>
            </div>
          </div>
        </div>

        {/* Distribution de maîtrise simplifiée */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <span>🎯</span>
              <span>Maîtrise</span>
            </h2>
            
            <div className="space-y-4">
              {[
                { label: 'Nouveaux', count: stats.masteryDistribution.new, color: 'bg-gray-400', score: 0 },
                { label: 'Difficiles', count: stats.masteryDistribution.difficult, color: 'bg-red-400', score: 1 },
                { label: 'Moyens', count: stats.masteryDistribution.medium, color: 'bg-orange-400', score: 2 },
                { label: 'Maîtrisés', count: stats.masteryDistribution.mastered, color: 'bg-green-400', score: 3 },
              ].map((item) => {
                const percentage = stats.totalKanjis > 0 ? (item.count / stats.totalKanjis) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 flex items-center gap-2 font-medium">
                        <span>{getMasteryIcon(item.score)}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="text-gray-500 text-sm">
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags simplifiés */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <span>🏷️</span>
              <span>Tags</span>
            </h2>
            
            <div className="space-y-3">
              {stats.tagsStats.slice(0, 6).map((tagStat, index) => (
                <div key={tagStat.tag} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-500 font-medium text-sm">#{index + 1}</span>
                    <span className="text-gray-700">{tagStat.tag}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm">{tagStat.count} kanjis</span>
                    <span className={`text-sm ${getMasteryColor(Math.round(tagStat.averageScore))}`}>
                      {getMasteryIcon(Math.round(tagStat.averageScore))} {tagStat.averageScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kanjis épurés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <span>💡</span>
              <span>À travailler</span>
            </h2>
            
            <div className="space-y-3">
              {stats.weakestKanjis.slice(0, 5).map((kanji, index) => (
                <div key={kanji.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{kanji.kanji}</span>
                    <div>
                      <p className="text-gray-800 font-medium">{kanji.primaryMeaning || kanji.meanings[0]}</p>
                      <p className="text-gray-500 text-sm">{kanji.primaryReading || kanji.onyomi[0] || kanji.kunyomi[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${getMasteryColor(kanji.learningData.score)}`}>
                      {getMasteryIcon(kanji.learningData.score)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {kanji.learningData.totalAttempts || 0}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <span>🏆</span>
              <span>Maîtrisés</span>
            </h2>
            
            <div className="space-y-3">
              {stats.strongestKanjis.slice(0, 5).map((kanji, index) => (
                <div key={kanji.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{kanji.kanji}</span>
                    <div>
                      <p className="text-gray-800 font-medium">{kanji.primaryMeaning || kanji.meanings[0]}</p>
                      <p className="text-gray-500 text-sm">{kanji.primaryReading || kanji.onyomi[0] || kanji.kunyomi[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${getMasteryColor(kanji.learningData.score)}`}>
                      {getMasteryIcon(kanji.learningData.score)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {kanji.learningData.totalAttempts || 0}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton d'action simple */}
        <div className="flex items-center justify-center">
          <button
            onClick={calculateDetailedStats}
            className="flex items-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300"
          >
            <span className="text-xl">🔄</span>
            <span>Actualiser</span>
          </button>
        </div>
      </main>
    </div>
  );
}