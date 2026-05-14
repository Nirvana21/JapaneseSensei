"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useKanjis } from "../../hooks/useKanjis";
import {
  simpleAdaptiveLearningService,
  SimpleLearningKanji,
} from "../../services/adaptiveLearningService";
import { survivalService, SurvivalStats } from "../../services/survivalService";

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
  const { kanjis, loading: kanjisLoading } = useKanjis();
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [survivalStats, setSurvivalStats] = useState<SurvivalStats | null>(
    null
  );
  const [allLearningKanjis, setAllLearningKanjis] = useState<
    SimpleLearningKanji[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kanjisLoading) {
      calculateDetailedStats();
    }
  }, [kanjis, kanjisLoading]);

  const calculateDetailedStats = () => {
    setLoading(true);

    const learningKanjis = kanjis.map((kanji) => {
      const existingData = localStorage.getItem(`simple_learning_${kanji.id}`);
      if (existingData) {
        const parsed = JSON.parse(existingData);
        return {
          ...kanji,
          learningData: {
            ...parsed.learningData,
            lastSeen: new Date(parsed.learningData.lastSeen),
          },
          studyData: parsed.studyData,
        };
      }
      return simpleAdaptiveLearningService.initializeLearningData(kanji);
    });

    setAllLearningKanjis(learningKanjis);

    const masteryDistribution = {
      new: learningKanjis.filter((k) => k.learningData.score === 0).length,
      difficult: learningKanjis.filter((k) => k.learningData.score === 1)
        .length,
      medium: learningKanjis.filter((k) => k.learningData.score === 2).length,
      mastered: learningKanjis.filter((k) => k.learningData.score === 3).length,
    };

    const sortedByScore = [...learningKanjis].sort(
      (a, b) => a.learningData.score - b.learningData.score
    );
    const weakestKanjis = sortedByScore.slice(0, 5);
    const strongestKanjis = sortedByScore.slice(-5).reverse();

    const tagMap = new Map<string, { total: number; scoreSum: number }>();
    learningKanjis.forEach((kanji) => {
      kanji.tags?.forEach((tag) => {
        const current = tagMap.get(tag) || { total: 0, scoreSum: 0 };
        tagMap.set(tag, {
          total: current.total + 1,
          scoreSum: current.scoreSum + kanji.learningData.score,
        });
      });
    });

    const tagsStats = Array.from(tagMap.entries())
      .map(([tag, data]) => ({
        tag,
        count: data.total,
        averageScore: data.scoreSum / data.total,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const studyStreak = calculateStudyStreak(learningKanjis);
    const totalStudySessions = learningKanjis.reduce(
      (sum, k) => sum + (k.learningData.totalAttempts || 0),
      0
    );
    const totalCorrect = learningKanjis.reduce(
      (sum, k) => sum + (k.learningData.correctAttempts || 0),
      0
    );
    const averageSessionScore =
      totalStudySessions > 0 ? (totalCorrect / totalStudySessions) * 100 : 0;

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
      tagsStats,
    };

    setStats(detailedStats);

    // Charger les statistiques Survival
    const survivalData = survivalService.getSurvivalStats();
    setSurvivalStats(survivalData);

    setLoading(false);
  };

  const calculateStudyStreak = (kanjis: SimpleLearningKanji[]): number => {
    const today = new Date();
    const studiedKanjis = kanjis.filter((k) => k.learningData.lastSeen);

    if (studiedKanjis.length === 0) return 0;

    const lastStudyDate = new Date(
      Math.max(...studiedKanjis.map((k) => k.learningData.lastSeen.getTime()))
    );
    const daysSinceLastStudy = Math.floor(
      (today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastStudy <= 1 ? Math.min(studiedKanjis.length, 7) : 0;
  };

  const resetGlobalStats = () => {
    if (window.confirm("Réinitialiser toutes les statistiques ?")) {
      kanjis.forEach((kanji) => {
        const key = `simple_learning_${kanji.id}`;
        localStorage.removeItem(key);
      });
      calculateDetailedStats();
      alert("Statistiques réinitialisées !");
    }
  };

  const getMasteryColor = (score: number) => {
    const colors = {
      0: "text-gray-400",
      1: "text-red-400",
      2: "text-orange-400",
      3: "text-green-400",
    };
    return colors[score as keyof typeof colors] || "text-gray-400";
  };

  const getMasteryIcon = (score: number) => {
    const src =
      score === 0
        ? "/sprites/logo_sans_fond.png"
        : score === 1
        ? "/sprites/logo_triste.png"
        : score === 2
        ? "/sprites/logo_sport.png"
        : "/sprites/logo_victoire.png";
    const alt =
      score === 0
        ? "Nouveau kanji"
        : score === 1
        ? "Kanji difficile"
        : score === 2
        ? "Kanji en entraînement"
        : "Kanji maîtrisé";
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-white/60">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </span>
    );
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-[#100c08] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#f5ede0]/50">Calcul des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0]">
      {/* Header zen japonais */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.10] rounded-xl transition-all duration-300 border border-white/[0.10]"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden border border-white/10">
                <img
                  src="/sprites/logo_maison.png"
                  alt="Retour"
                  className="w-full h-full object-cover"
                />
              </span>
              <span className="text-[#f5ede0] font-medium text-sm">戻る</span>
            </Link>

            <div className="text-center flex-1 mx-4">
              <h1 className="text-2xl md:text-3xl font-light text-[#f5ede0] flex items-center justify-center gap-3" style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}>
                <span className="hidden xs:inline-flex w-10 h-10 rounded-2xl overflow-hidden shadow-md border border-white/10 sm:w-11 sm:h-11">
                  <img
                    src="/sprites/logo_maths.png"
                    alt="Japanese Sensei Statistiques"
                    className="w-full h-full object-cover"
                  />
                </span>
                <span>
                  <span className="hidden sm:inline">統計 Statistiques</span>
                  <span className="sm:hidden">統計</span>
                </span>
              </h1>
            </div>

            <button
              onClick={resetGlobalStats}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.10] rounded-xl transition-all duration-300 border border-white/[0.10]"
            >
              <span className="text-lg">🗑️</span>
              <span className="text-[#f5ede0]/70 font-medium text-sm hidden sm:inline">
                リセット
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal épuré */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Métriques principales zen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#f5ede0]/60 text-sm font-medium">漢字 Kanjis</p>
                <p className="text-3xl font-light text-[#f5ede0]">
                  {stats.totalKanjis}
                </p>
              </div>
              <div className="opacity-60 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src="/sprites/logo_lecteur.png"
                  alt="Kanjis"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#f5ede0]/60 text-sm font-medium">
                  連続 Streak
                </p>
                <p className="text-3xl font-light text-[#f5ede0]">
                  {stats.studyStreak}
                </p>
              </div>
              <div className="text-4xl opacity-60">🔥</div>
            </div>
          </div>

          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#f5ede0]/60 text-sm font-medium">
                  練習 Sessions
                </p>
                <p className="text-3xl font-light text-[#f5ede0]">
                  {stats.totalStudySessions}
                </p>
              </div>
              <div className="text-4xl opacity-60">🎯</div>
            </div>
          </div>

          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#f5ede0]/60 text-sm font-medium">成績 Score</p>
                <p className="text-3xl font-light text-[#f5ede0]">
                  {stats.averageSessionScore.toFixed(0)}%
                </p>
              </div>
              <div className="text-4xl opacity-60">📈</div>
            </div>
          </div>
        </div>

        {/* Statistiques Mode Survival */}
        {survivalStats && survivalStats.totalSessions > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-[#f5ede0] mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}>
              <span>🔥</span>
              <span>持久モード Survival</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f5ede0]/60 text-sm font-medium">
                      最高記録 Record
                    </p>
                    <p className="text-3xl font-light text-[#f5ede0]">
                      {survivalStats.bestStreak}
                    </p>
                  </div>
                  <div className="text-4xl opacity-60">👑</div>
                </div>
              </div>

              <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f5ede0]/60 text-sm font-medium">
                      試合数 Parties
                    </p>
                    <p className="text-3xl font-light text-[#f5ede0]">
                      {survivalStats.totalSessions}
                    </p>
                  </div>
                  <div className="opacity-60 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src="/sprites/logo_gamer.png"
                      alt="Parties jouées"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f5ede0]/60 text-sm font-medium">
                      平均 Moyenne
                    </p>
                    <p className="text-3xl font-light text-[#f5ede0]">
                      {Math.round(survivalStats.averageStreak)}
                    </p>
                  </div>
                  <div className="opacity-60 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src="/sprites/logo_maths.png"
                      alt="Moyenne survival"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f5ede0]/60 text-sm font-medium">
                      総質問数 Total
                    </p>
                    <p className="text-3xl font-light text-[#f5ede0]">
                      {survivalStats.totalQuestions}
                    </p>
                  </div>
                  <div className="text-4xl opacity-60">❓</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribution de maîtrise zen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08] animate-fade-in-up">
            <h2 className="text-xl font-light text-[#f5ede0] mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}>
              <span>🎯</span>
              <span>習熟度 Maîtrise</span>
            </h2>

            <div className="space-y-4">
              {[
                {
                  label: "新しい Nouveaux",
                  count: stats.masteryDistribution.new,
                  color: "bg-gray-400",
                  score: 0,
                },
                {
                  label: "難しい Difficiles",
                  count: stats.masteryDistribution.difficult,
                  color: "bg-red-400",
                  score: 1,
                },
                {
                  label: "普通 Moyens",
                  count: stats.masteryDistribution.medium,
                  color: "bg-orange-400",
                  score: 2,
                },
                {
                  label: "習得 Maîtrisés",
                  count: stats.masteryDistribution.mastered,
                  color: "bg-green-400",
                  score: 3,
                },
              ].map((item) => {
                const percentage =
                  stats.totalKanjis > 0
                    ? (item.count / stats.totalKanjis) * 100
                    : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#f5ede0]/80 flex items-center gap-2 font-medium">
                        <span>{getMasteryIcon(item.score)}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="text-[#c9a84c] text-sm">
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
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

          {/* Tags zen */}
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08] animate-fade-in-up">
            <h2 className="text-xl font-light text-[#f5ede0] mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}>
              <span>🏷️</span>
              <span>タグ Tags</span>
            </h2>

            <div className="space-y-3">
              {stats.tagsStats.slice(0, 6).map((tagStat, index) => (
                <div
                  key={tagStat.tag}
                  className="flex justify-between items-center py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#c9a84c] font-medium text-sm">
                      #{index + 1}
                    </span>
                    <span className="text-[#f5ede0]/80">{tagStat.tag}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#f5ede0]/50 text-sm">
                      {tagStat.count} kanjis
                    </span>
                    <span
                      className={`text-sm ${getMasteryColor(
                        Math.round(tagStat.averageScore)
                      )}`}
                    >
                      {getMasteryIcon(Math.round(tagStat.averageScore))}{" "}
                      {tagStat.averageScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kanjis zen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08] animate-fade-in-up">
            <h2 className="text-xl font-light text-[#f5ede0] mb-6 flex items-center gap-3" style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}>
              <span>💡</span>
              <span>練習必要 À travailler</span>
            </h2>

            <div className="space-y-3">
              {stats.weakestKanjis.slice(0, 5).map((kanji, index) => (
                <div
                  key={kanji.id}
                  className="flex justify-between items-center p-3 bg-white/[0.04] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{kanji.kanji}</span>
                    <div>
                      <p className="text-[#f5ede0] font-medium">
                        {kanji.primaryMeaning || kanji.meanings[0]}
                      </p>
                      <p className="text-[#f5ede0]/60 text-sm">
                        {kanji.primaryReading ||
                          kanji.onyomi[0] ||
                          kanji.kunyomi[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg ${getMasteryColor(
                        kanji.learningData.score
                      )}`}
                    >
                      {getMasteryIcon(kanji.learningData.score)}
                    </span>
                    <span className="text-amber-600 text-sm">
                      {kanji.learningData.totalAttempts || 0}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-100/90 to-amber-100/90 rounded-2xl p-6 border border-yellow-200/50 shadow-sm animate-fade-in-up">
            <h2 className="text-xl font-light text-yellow-800 mb-6 flex items-center gap-3">
              <span>🏆</span>
              <span>習得済み Maîtrisés</span>
            </h2>

            <div className="space-y-3">
              {stats.strongestKanjis.slice(0, 5).map((kanji, index) => (
                <div
                  key={kanji.id}
                  className="flex justify-between items-center p-3 bg-white/[0.04] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{kanji.kanji}</span>
                    <div>
                      <p className="text-[#f5ede0] font-medium">
                        {kanji.primaryMeaning || kanji.meanings[0]}
                      </p>
                      <p className="text-[#f5ede0]/60 text-sm">
                        {kanji.primaryReading ||
                          kanji.onyomi[0] ||
                          kanji.kunyomi[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg ${getMasteryColor(
                        kanji.learningData.score
                      )}`}
                    >
                      {getMasteryIcon(kanji.learningData.score)}
                    </span>
                    <span className="text-[#f5ede0]/50 text-sm">
                      {kanji.learningData.totalAttempts || 0}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton d'action zen */}
        <div className="flex items-center justify-center">
          <button
            onClick={calculateDetailedStats}
            className="flex items-center gap-3 px-8 py-4 bg-[#c41e1e]/80 hover:bg-[#c41e1e] text-[#f5ede0] font-medium rounded-xl transition-all duration-300 shadow-lg"
          >
            <span className="text-xl">🔄</span>
            <span>更新 Actualiser</span>
          </button>
        </div>
      </main>
    </div>
  );
}
