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
  const [activeSection, setActiveSection] =
    useState<"main" | "games" | "grammar">("main");
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
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-orange-700 rounded-xl shadow-md overflow-hidden">
                <img
                  src="/sprites/logo_sans_fond.png"
                  alt="Japanese Sensei"
                  className="w-full h-full object-cover"
                />
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
          {/* Vue principale : petite grille d'icônes */}
          {activeSection === "main" && (
            <>
              <div className="mb-8 flex flex-col items-center text-center gap-2 animate-fade-in-up">
                <p className="text-sm text-amber-800">
                  Choisis une section pour continuer ton entraînement.
                </p>
                {kanjis.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs text-amber-800">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full overflow-hidden bg-amber-200">
                      <img
                        src="/sprites/logo_lecteur.png"
                        alt="Kanjis dans ta collection"
                        className="w-full h-full object-cover"
                      />
                    </span>
                    <span>
                      {kanjis.length} kanji{kanjis.length > 1 ? "s" : ""} dans ta
                      collection
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up">
                {/* Jeux */}
                <button
                  type="button"
                  onClick={() => setActiveSection("games")}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100/90 to-blue-100/90 border border-indigo-200/70 px-4 py-6 shadow-md hover:border-indigo-400 hover:bg-indigo-50/90 transition-bounce hover:-translate-y-0.5"
                >
                  <span className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden shadow-md bg-indigo-200/90">
                    <img
                      src="/sprites/logo_gamer.png"
                      alt="Jeux"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="text-sm font-semibold text-indigo-900 mb-1">
                    Jeux
                  </span>
                  <span className="text-[11px] text-indigo-700 text-center">
                    Quiz, survival, Kanji Legends, histoires...
                  </span>
                </button>

                {/* Collection */}
                <button
                  type="button"
                  onClick={() => setCurrentView("collection")}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100/90 to-green-100/90 border border-emerald-200/70 px-4 py-6 shadow-md hover:border-emerald-400 hover:bg-emerald-50/90 transition-bounce hover:-translate-y-0.5"
                >
                  <span className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden shadow-md bg-emerald-200/90">
                    <img
                      src="/sprites/logo_lecteur.png"
                      alt="Collection"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="text-sm font-semibold text-emerald-900 mb-1">
                    Collection
                  </span>
                  <span className="text-[11px] text-emerald-700 text-center">
                    Ajouter, éditer et réviser tes kanjis.
                  </span>
                </button>

                {/* Grammaire */}
                <button
                  type="button"
                  onClick={() => setActiveSection("grammar")}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100/90 to-yellow-100/90 border border-amber-200/70 px-4 py-6 shadow-md hover:border-amber-400 hover:bg-amber-50/90 transition-bounce hover:-translate-y-0.5"
                >
                  <span className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden shadow-md bg-amber-200/90">
                    <img
                      src="/sprites/logo_pensif.png"
                      alt="Grammaire"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="text-sm font-semibold text-amber-900 mb-1">
                    Grammaire
                  </span>
                  <span className="text-[11px] text-amber-700 text-center">
                    Verbes, adjectifs et particules.
                  </span>
                </button>

                {/* Statistiques */}
                <button
                  type="button"
                  onClick={() => router.push("/stats")}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-rose-100/90 to-pink-100/90 border border-rose-200/70 px-4 py-6 shadow-md hover:border-rose-400 hover:bg-rose-50/90 transition-bounce hover:-translate-y-0.5"
                >
                  <span className="mb-2 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden shadow-md bg-rose-200/90">
                    <img
                      src="/sprites/logo_maths.png"
                      alt="Statistiques"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="text-sm font-semibold text-rose-900 mb-1">
                    Statistiques
                  </span>
                  <span className="text-[11px] text-rose-700 text-center">
                    Visualise ta progression globale.
                  </span>
                </button>
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
                      Commence ton voyage en ajoutant ton premier kanji.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Sous-menu Jeux */}
          {activeSection === "games" && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setActiveSection("main")}
                className="inline-flex items-center gap-2 text-sm text-amber-800 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-amber-100/80 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-amber-300/70">
                  <img
                    src="/sprites/logo_maison.png"
                    alt="Menu principal"
                    className="w-full h-full object-cover"
                  />
                </span>
                <span>Retour au menu principal</span>
              </button>

              <div className="flex flex-col gap-2 mb-2">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl overflow-hidden bg-indigo-200/90">
                    <img
                      src="/sprites/logo_gamer.png"
                      alt="Jeux"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span>Jeux & Sensei</span>
                </h2>
                <p className="text-sm text-indigo-800">
                  Choisis un mode de jeu pour t'entraîner avec tes kanjis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Link
                  href="/training"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-indigo-200/70 bg-white/90 px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-indigo-900">
                      Quiz kanjis
                    </span>
                    <span className="text-xs text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    Révisions adaptatives sur ta collection.
                  </p>
                </Link>

                <Link
                  href="/training?mode=survival"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-indigo-200/70 bg-white/90 px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-indigo-900">
                      Survival
                    </span>
                    <span className="text-xs text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    3 vies, flux infini de questions.
                  </p>
                </Link>

                <Link
                  href="/game/kanji-legends"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-indigo-200/70 bg-white/90 px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/90 transition-colors shadow-sm"
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
                    Assemble les composants et maîtrise les kanjis.
                  </p>
                </Link>

                <Link
                  href="/stories/mini"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-indigo-200/70 bg-white/90 px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-indigo-900">
                      Mini histoires
                    </span>
                    <span className="text-xs text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    Lis des histoires générées avec tes kanjis.
                  </p>
                </Link>

                <Link
                  href="/chat"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-indigo-200/70 bg-white/90 px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-indigo-900">
                      Chat Sensei
                    </span>
                    <span className="text-xs text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    Pose tes questions au professeur virtuel.
                  </p>
                </Link>
              </div>
            </div>
          )}

          {/* Sous-menu Grammaire */}
          {activeSection === "grammar" && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setActiveSection("main")}
                className="inline-flex items-center gap-2 text-sm text-amber-800 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-amber-100/80 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden bg-amber-300/70">
                  <img
                    src="/sprites/logo_maison.png"
                    alt="Menu principal"
                    className="w-full h-full object-cover"
                  />
                </span>
                <span>Retour au menu principal</span>
              </button>

              <div className="flex flex-col gap-2 mb-2">
                <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl overflow-hidden bg-amber-200/90">
                    <img
                      src="/sprites/logo_pensif.png"
                      alt="Grammaire"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span>Grammaire & formes</span>
                </h2>
                <p className="text-sm text-amber-800">
                  Choisis le type de point de grammaire à travailler.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Link
                  href="/training/verbs"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-amber-200/70 bg-white/90 px-4 py-3 hover:border-amber-400 hover:bg-amber-50/90 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-amber-900">
                      Verbes
                    </span>
                    <span className="text-xs text-amber-600 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Conjugaisons de base et formes utiles.
                  </p>
                </Link>

                <Link
                  href="/training/adjectives"
                  className="group flex flex-col items-start justify-between rounded-2xl border border-amber-200/70 bg-white/90 px-4 py-3 hover:border-amber-400 hover:bg-amber-50/90 transition-colors shadow-sm"
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
                  className="group flex flex-col items-start justify-between rounded-2xl border border-indigo-200/70 bg-white/90 px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/90 transition-colors shadow-sm"
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
                    Complète la particule manquante dans la phrase.
                  </p>
                </Link>
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
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden bg-amber-300/70">
                <img
                  src="/sprites/logo_maison.png"
                  alt="Menu principal"
                  className="w-full h-full object-cover"
                />
              </span>
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
