"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddKanjiForm from "@/components/AddKanjiForm";
import KanjiList from "@/components/KanjiList";
import EditKanjiModal from "@/components/EditKanjiModal";
import { useKanjis } from "@/hooks/useKanjis";
import { KanjiEntry } from "@/types/kanji";
import { KanjiStorageService } from "@/services/kanjiStorage";

export default function Home() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<"menu" | "collection">("menu");
  const [editingKanji, setEditingKanji] = useState<KanjiEntry | null>(null);
  const { kanjis, loading, error, updateKanji, deleteKanji, refreshKanjis } =
    useKanjis();

  const handleEdit = (kanji: KanjiEntry) => {
    setEditingKanji(kanji);
  };

  const handleSaveEdit = async (updatedKanji: KanjiEntry) => {
    await updateKanji(updatedKanji);
    setEditingKanji(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce kanji ?")) {
      await deleteKanji(id);
    }
  };

  const handleKanjiAdded = () => {
    refreshKanjis();
  };

  const handleExport = async () => {
    try {
      const json = await KanjiStorageService.exportKanjis();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `japanese-sensei-kanjis-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur export kanjis", err);
      alert("Impossible d'exporter la collection.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch {
      router.replace("/login");
    }
  };

  // Vue Menu Principal
  if (currentView === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        {/* Header zen japonais */}
        <header className="bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md border-b border-amber-200/50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-orange-700 rounded-2xl shadow-lg mb-2">
                <span className="text-3xl">🇯🇵</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-800 to-orange-800 bg-clip-text text-transparent mb-1">
                Japanese Sensei
              </h1>
              <p className="text-amber-700 font-medium text-sm md:text-base">
                道を極める - Maîtrisez l'art des kanjis
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-2 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-sm font-medium shadow-sm border border-amber-300 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* Menu Principal zen */}
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Bouton Quiz - Style zen */}
            <Link href="/training" className="group">
              <div className="bg-gradient-to-br from-orange-100/90 to-red-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl border border-orange-200/50 transition-all duration-300 hover:scale-102 h-full hover:border-red-300/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-md mb-6 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-red-800 mb-3">
                    練習 Quiz
                  </h2>
                  <p className="text-amber-700 leading-relaxed mb-4">
                    Entraînez-vous avec sérénité
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-red-600">
                    <span>始める</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                  {kanjis.length > 0 && (
                    <div className="mt-4 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm inline-block border border-red-200">
                      {kanjis.length} kanji{kanjis.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Bouton Kanji Legends (jeu séparé) */}
            <Link href="/game/kanji-legends" className="group">
              <div className="bg-gradient-to-br from-indigo-100/90 to-blue-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl border border-indigo-200/50 transition-all duration-300 hover:scale-102 h-full hover:border-blue-300/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-md mb-6 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">🀄</span>
                  </div>
                  <h2 className="text-2xl font-bold text-indigo-800 mb-3">
                    伝説 Kanji Legends
                  </h2>
                  <p className="text-indigo-700 leading-relaxed mb-4">
                    Assemble des composants, débloque des pouvoirs
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-700">
                    <span>プレイ</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Bouton Survival - Style feu */}
            <Link href="/training?mode=survival" className="group">
              <div className="bg-gradient-to-br from-red-100/90 to-pink-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl border border-red-200/50 transition-all duration-300 hover:scale-102 h-full hover:border-pink-300/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-pink-700 rounded-2xl shadow-md mb-6 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <h2 className="text-2xl font-bold text-red-800 mb-3">
                    持久 Survival
                  </h2>
                  <p className="text-red-700 leading-relaxed mb-4">
                    Défi d'endurance infini
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-red-600">
                    <span>挑戦</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                  {kanjis.length > 0 && (
                    <div className="mt-4 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm inline-block border border-red-200">
                      3 vies • ∞ questions
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Bouton Verbes – formes */}
            <Link href="/training/verbs" className="group">
              <div className="bg-gradient-to-br from-rose-100/90 to-pink-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl border border-rose-200/50 transition-all duration-300 hover:scale-102 h-full hover:border-pink-300/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-700 rounded-2xl shadow-md mb-6 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-rose-800 mb-3">
                    動詞 Verbes
                  </h2>
                  <p className="text-rose-700 leading-relaxed mb-4">
                    Conjugaisons essentielles
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-rose-700">
                    <span>練習</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Bouton Adjectifs – formes */}
            <Link href="/training/adjectives" className="group">
              <div className="bg-gradient-to-br from-amber-100/90 to-yellow-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl border border-amber-200/50 transition-all duration-300 hover:scale-102 h-full hover:border-yellow-300/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-md mb-6 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h2 className="text-2xl font-bold text-amber-800 mb-3">
                    形容詞 Adjectifs
                  </h2>
                  <p className="text-amber-700 leading-relaxed mb-4">
                    i/na formes utiles
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-700">
                    <span>練習</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Bouton Particules – trous */}
            <Link href="/training/particles" className="group">
              <div className="bg-gradient-to-br from-indigo-100/90 to-blue-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl border border-indigo-200/50 transition-all duration-300 hover:scale-102 h-full hover:border-blue-300/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-md mb-6 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">🧩</span>
                  </div>
                  <h2 className="text-2xl font-bold text-indigo-800 mb-3">
                    助詞 Particules
                  </h2>
                  <p className="text-indigo-700 leading-relaxed mb-4">
                    Compléter la particule manquante
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-700">
                    <span>練習</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Bouton Collection - Style bambou */}
            <button
              onClick={() => setCurrentView("collection")}
              className="group w-full text-left"
            >
              <div className="bg-gradient-to-br from-green-100/90 to-emerald-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl border border-green-200/50 transition-all duration-300 hover:scale-102 h-full hover:border-emerald-300/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-md mb-6 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 mb-3">
                    蔵書 Collection
                  </h2>
                  <p className="text-green-700 leading-relaxed mb-4">
                    Votre bibliothèque personnelle
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
                    <span>探索</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                  <div className="mt-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm inline-block border border-green-200">
                    {kanjis.length} kanji{kanjis.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </button>

            {/* Bouton Statistiques - Style terre */}
            <Link href="/stats" className="group">
              <div className="bg-gradient-to-br from-amber-100/90 to-yellow-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl border border-amber-200/50 transition-all duration-300 hover:scale-102 h-full hover:border-yellow-300/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-700 rounded-2xl shadow-md mb-6 group-hover:scale-105 transition-transform">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-amber-800 mb-3">
                    統計 Stats
                  </h2>
                  <p className="text-amber-700 leading-relaxed mb-4">
                    Suivez votre progression
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600">
                    <span>分析</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                  {kanjis.length > 0 && (
                    <div className="mt-4 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm inline-block border border-amber-200">
                      Prêt à analyser
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Message d'encouragement zen */}
          {kanjis.length === 0 && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-pink-100/90 to-rose-100/90 rounded-2xl p-8 border border-pink-200/50 shadow-lg max-w-md mx-auto backdrop-blur-sm">
                <span className="text-4xl mb-4 block">🌸</span>
                <h3 className="text-lg font-bold text-pink-800 mb-2">
                  始まり - Nouveau Départ
                </h3>
                <p className="text-pink-700 text-sm">
                  Commencez votre voyage d'apprentissage en ajoutant votre
                  premier kanji
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Vue Collection
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header avec retour zen */}
      <header className="bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md border-b border-amber-200/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView("menu")}
              className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-red-700 transition-colors rounded-lg hover:bg-amber-200/50"
            >
              <span>←</span>
              <span className="hidden sm:inline">戻る Menu</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-800">
                蔵書 Ma Collection
              </h1>
              <p className="text-amber-700 text-sm">
                {kanjis.length} kanji{kanjis.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-3 py-2 rounded-lg bg-emerald-200/80 hover:bg-emerald-300 text-emerald-900 text-xs sm:text-sm font-medium shadow-sm border border-emerald-300 transition-colors"
              >
                📤 Exporter
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Formulaire d'ajout zen */}
        <div className="bg-gradient-to-br from-orange-100/90 to-red-100/90 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200/50 p-6">
          <AddKanjiForm onKanjiAdded={handleKanjiAdded} />
        </div>

        {error && (
          <div className="p-4 bg-red-100/90 backdrop-blur-sm border border-red-300/50 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Liste des kanjis zen */}
        <div className="bg-gradient-to-br from-amber-100/90 to-yellow-100/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/50 p-6">
          <KanjiList
            kanjis={kanjis}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <EditKanjiModal
        kanji={editingKanji}
        isOpen={!!editingKanji}
        onClose={() => setEditingKanji(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
