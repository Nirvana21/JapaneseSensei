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
  const [currentView, setCurrentView] =
    useState<"menu" | "collection">("menu");
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);
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

  if (currentView === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        {/* Header compact type mobile */}
        <header className="bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md border-b border-amber-200/50">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-orange-700 rounded-xl shadow-md">
                <span className="text-xl">🇯🇵</span>
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-base md:text-lg font-bold bg-gradient-to-r from-red-800 to-orange-800 bg-clip-text text-transparent truncate">
                  Japanese Sensei
                </span>
                <span className="hidden sm:inline text-[11px] md:text-xs text-amber-700 truncate">
                  道を極める - Maîtrisez l'art des kanjis
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton pour ouvrir/fermer les modules sur mobile */}
              <button
                type="button"
                className="inline-flex lg:hidden items-center justify-center w-9 h-9 rounded-xl border border-amber-300/80 bg-amber-100/80 text-amber-800 shadow-sm hover:bg-amber-200 transition-colors"
                onClick={() => setMobileModulesOpen((prev) => !prev)}
                aria-label={
                  mobileModulesOpen ? "Fermer le menu des modules" : "Ouvrir le menu des modules"
                }
              >
                <span className="text-lg">☰</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs md:text-sm font-medium shadow-sm border border-amber-300 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
          {/* Barre d'accès aux modules sur mobile */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-amber-900">
                Modules
              </span>
              {kanjis.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                  {kanjis.length} kanji{kanjis.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileModulesOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 px-2 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <span>{mobileModulesOpen ? "Masquer" : "Afficher"}</span>
              <span className="text-sm">☰</span>
            </button>
          </div>

          <div
            className={
              mobileModulesOpen
                ? "grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
                : "hidden lg:grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
            }
          >
            {/* Groupe Kanjis & progression */}
            <div className="bg-gradient-to-br from-orange-100/90 to-red-100/90 backdrop-blur-sm rounded-3xl p-7 shadow-lg border border-orange-200/60">
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-md">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-800 mb-1">
                    練習 Kanjis & progression
                  </h2>
                  <p className="text-amber-800 text-sm">
                    Révision ciblée, survie, collection et statistiques.
                  </p>
                </div>
              </div>

              {kanjis.length > 0 && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50/90 border border-red-200 text-xs text-red-700">
                  <span>📚</span>
                  <span>
                    {kanjis.length} kanji{kanjis.length > 1 ? "s" : ""} dans ta
                    collection
                  </span>
                </div>
              )}

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/training"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-red-200/70 bg-white/80 px-3 py-2 hover:border-red-400 hover:bg-red-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-red-800">
                      Quiz kanjis
                    </span>
                    <span className="text-xs text-red-500 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-red-700">
                    Révisions adaptatives sur tes kanjis.
                  </p>
                </Link>

                <Link
                  href="/training?mode=survival"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-red-200/70 bg-white/80 px-3 py-2 hover:border-red-400 hover:bg-red-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-red-800">
                      Survival
                    </span>
                    <span className="text-xs text-red-500 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-red-700">
                    3 vies, flux infini de questions.
                  </p>
                </Link>

                <button
                  onClick={() => setCurrentView("collection")}
                  className="group flex flex-col items-start justify-between rounded-2xl border border-emerald-200/70 bg-white/80 px-3 py-2 hover:border-emerald-400 hover:bg-emerald-50/90 transition-colors shadow-sm text-left"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-emerald-900">
                      Collection
                    </span>
                    <span className="text-xs text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Ajouter, éditer et parcourir tes kanjis.
                  </p>
                </button>

                <Link
                  href="/stats"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-amber-200/70 bg-white/80 px-3 py-2 hover:border-amber-400 hover:bg-amber-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-amber-900">
                      Statistiques
                    </span>
                    <span className="text-xs text-amber-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Visualise ta progression dans le temps.
                  </p>
                </Link>
              </div>
            </div>

            {/* Groupe Grammaire & vocabulaire */}
            <div className="bg-gradient-to-br from-amber-100/90 to-yellow-100/90 backdrop-blur-sm rounded-3xl p-7 shadow-lg border border-amber-200/60">
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-md">
                  <span className="text-2xl">🎨</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-900 mb-1">
                    文法 Grammaire & formes
                  </h2>
                  <p className="text-amber-800 text-sm">
                    Travailler les verbes, adjectifs et particules.
                  </p>
                </div>
              </div>

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/training/verbs"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-rose-200/70 bg-white/80 px-3 py-2 hover:border-rose-400 hover:bg-rose-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-rose-900">
                      Verbes
                    </span>
                    <span className="text-xs text-rose-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-rose-700">
                    Conjugaisons de base et formes utiles.
                  </p>
                </Link>

                <Link
                  href="/training/adjectives"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-amber-200/70 bg-white/80 px-3 py-2 hover:border-amber-400 hover:bg-amber-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-amber-900">
                      Adjectifs
                    </span>
                    <span className="text-xs text-amber-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    i / na et leurs transformations.
                  </p>
                </Link>

                <Link
                  href="/training/particles"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-indigo-200/70 bg-white/80 px-3 py-2 hover:border-indigo-400 hover:bg-indigo-50/90 transition-colors shadow-sm sm:col-span-2"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-indigo-900">
                      Particules
                    </span>
                    <span className="text-xs text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    Compléter la particule manquante dans la phrase.
                  </p>
                </Link>
              </div>
            </div>

            {/* Groupe Jeux & Sensei */}
            <div className="bg-gradient-to-br from-indigo-100/90 to-blue-100/90 backdrop-blur-sm rounded-3xl p-7 shadow-lg border border-indigo-200/60">
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-md">
                  <span className="text-2xl">🀄</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-indigo-900 mb-1">
                    遊び Jeux & Sensei
                  </h2>
                  <p className="text-indigo-800 text-sm">
                    Gamification et professeur virtuel.
                  </p>
                </div>
              </div>

              <div className="mt-2 grid gap-3">
                <Link
                  href="/game/kanji-legends"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-indigo-200/70 bg-white/80 px-3 py-2 hover:border-indigo-400 hover:bg-indigo-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-indigo-900">
                      Kanji Legends
                    </span>
                    <span className="text-xs text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    Assemble des composants, débloque des pouvoirs.
                  </p>
                </Link>

                <Link
                  href="/chat"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-sky-200/70 bg-white/80 px-3 py-2 hover:border-sky-400 hover:bg-sky-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-sky-900">
                      Chat Sensei
                    </span>
                    <span className="text-xs text-sky-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-sky-800">
                    Pose des questions au professeur virtuel.
                  </p>
                </Link>
              </div>
            </div>
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
