"use client";

import { useRef, useState } from "react";
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
  const [importStatus, setImportStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
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

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-selected
    setImporting(true);
    setImportStatus(null);
    try {
      const text = await file.text();
      const result = await KanjiStorageService.importKanjis(text, false);
      await refreshKanjis();
      const msg = `${result.count} kanji${result.count > 1 ? "s" : ""} importé${result.count > 1 ? "s" : ""}` +
        (result.skipped > 0 ? ` · ${result.skipped} ignoré${result.skipped > 1 ? "s" : ""}` : "") +
        (result.errors.length > 0 ? `\n${result.errors[0]}` : "");
      setImportStatus({ ok: true, msg });
    } catch (err) {
      setImportStatus({ ok: false, msg: err instanceof Error ? err.message : "Erreur import" });
    } finally {
      setImporting(false);
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
      <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex flex-col">
        {/* Glow overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(196,30,30,0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 90%, rgba(201,168,76,0.06) 0%, transparent 55%)",
          }}
        />
        {/* Header */}
        <header className="relative z-10 border-b border-white/[0.07] bg-black/25 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-red-900/40 border border-white/10">
                <img src="/sprites/logo_sans_fond.png" alt="Japanese Sensei" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span
                  className="text-base font-bold text-[#f5ede0] truncate"
                  style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}
                >
                  Japanese Sensei
                </span>
                <span className="hidden sm:inline text-[10px] text-[#c9a84c]/70 tracking-wider">
                  道を極める
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-white/15 text-[#f5ede0]/50 hover:text-[#f5ede0] hover:border-white/30 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 flex-1">
          {/* Vue principale */}
          {activeSection === "main" && (
            <>
              {/* Mascot + title */}
              <div className="flex flex-col items-center gap-3 mb-10">
                <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/30 border border-white/10">
                  <img src="/Logo_Sensei.png" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="text-center">
                  <h1
                    className="text-2xl font-bold text-[#f5ede0] mb-0.5"
                    style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}
                  >
                    日本語先生
                  </h1>
                  <p className="text-[#c9a84c]/80 text-xs tracking-widest">JAPANESE SENSEI</p>
                </div>
                {kanjis.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-[#f5ede0]/60">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full overflow-hidden">
                      <img src="/sprites/logo_lecteur.png" alt="" className="w-full h-full object-cover" />
                    </span>
                    {kanjis.length} kanji{kanjis.length > 1 ? "s" : ""} dans ta collection
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {/* Jeux */}
                <button
                  type="button"
                  onClick={() => setActiveSection("games")}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] px-4 py-6 hover:border-[#c41e1e]/50 hover:bg-[#c41e1e]/5 transition-all hover:-translate-y-0.5 shadow-lg"
                >
                  <span className="mb-2.5 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border border-white/10">
                    <img src="/sprites/logo_gamer.png" alt="Jeux" className="w-full h-full object-cover" />
                  </span>
                  <span className="text-sm font-semibold text-[#f5ede0] mb-1">Jeux</span>
                  <span className="text-[11px] text-[#f5ede0]/40 text-center leading-tight">Quiz, survival, histoires...</span>
                </button>

                {/* Collection */}
                <button
                  type="button"
                  onClick={() => setCurrentView("collection")}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] px-4 py-6 hover:border-emerald-600/40 hover:bg-emerald-900/10 transition-all hover:-translate-y-0.5 shadow-lg"
                >
                  <span className="mb-2.5 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border border-white/10">
                    <img src="/sprites/logo_lecteur.png" alt="Collection" className="w-full h-full object-cover" />
                  </span>
                  <span className="text-sm font-semibold text-[#f5ede0] mb-1">Collection</span>
                  <span className="text-[11px] text-[#f5ede0]/40 text-center leading-tight">Ajoute et gère tes kanjis.</span>
                </button>

                {/* Grammaire */}
                <button
                  type="button"
                  onClick={() => setActiveSection("grammar")}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] px-4 py-6 hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/5 transition-all hover:-translate-y-0.5 shadow-lg"
                >
                  <span className="mb-2.5 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border border-white/10">
                    <img src="/sprites/logo_pensif.png" alt="Grammaire" className="w-full h-full object-cover" />
                  </span>
                  <span className="text-sm font-semibold text-[#f5ede0] mb-1">Grammaire</span>
                  <span className="text-[11px] text-[#f5ede0]/40 text-center leading-tight">Verbes, adjectifs, particules.</span>
                </button>

                {/* Statistiques */}
                <button
                  type="button"
                  onClick={() => router.push("/stats")}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] px-4 py-6 hover:border-rose-500/40 hover:bg-rose-900/10 transition-all hover:-translate-y-0.5 shadow-lg"
                >
                  <span className="mb-2.5 inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border border-white/10">
                    <img src="/sprites/logo_maths.png" alt="Statistiques" className="w-full h-full object-cover" />
                  </span>
                  <span className="text-sm font-semibold text-[#f5ede0] mb-1">Stats</span>
                  <span className="text-[11px] text-[#f5ede0]/40 text-center leading-tight">Visualise ta progression.</span>
                </button>
              </div>

              {/* Message d'encouragement */}
              {kanjis.length === 0 && (
                <div className="mt-10 text-center">
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 max-w-sm mx-auto">
                    <div className="flex justify-center mb-4">
                      <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden border border-white/10">
                        <img src="/sprites/logo_pensif.png" alt="" className="w-full h-full object-cover" />
                      </span>
                    </div>
                    <h3
                      className="text-lg font-bold text-[#f5ede0] mb-2"
                      style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}
                    >
                      始まり — Nouveau Départ
                    </h3>
                    <p className="text-[#f5ede0]/50 text-sm">
                      Commence ton voyage en ajoutant ton premier kanji dans ta collection.
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
                className="inline-flex items-center gap-2 text-sm text-[#f5ede0]/60 hover:text-[#f5ede0] px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden border border-white/10">
                  <img src="/sprites/logo_maison.png" alt="" className="w-full h-full object-cover" />
                </span>
                <span>Retour au menu</span>
              </button>

              <div className="mb-2">
                <h2
                  className="text-lg font-bold text-[#f5ede0] flex items-center gap-2 mb-1"
                  style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden border border-white/10">
                    <img src="/sprites/logo_gamer.png" alt="" className="w-full h-full object-cover" />
                  </span>
                  遊び — Jeux & Entraînement
                </h2>
                <p className="text-sm text-[#f5ede0]/40 pl-8">Choisis un mode pour t'entraîner.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {([
                  { href: "/training", label: "Quiz kanjis", desc: "Révisions adaptatives sur ta collection." },
                  { href: "/training?mode=survival", label: "Mode Survival", desc: "3 vies, flux infini de questions." },
                  { href: "/game/kana-quiz", label: "Quiz Kana", desc: "Reconnaître hiragana et katakana." },
                  { href: "/game/kana-rain", label: "Kana Rain", desc: "Identifie les kana avant qu'ils touchent le sol." },
                  { href: "/game/speed-match", label: "Speed Match", desc: "Associe le kanji à sa signification à toute vitesse." },
                  { href: "/game/memory", label: "Memory", desc: "Retrouve les paires kanji ↔ sens." },
                  { href: "/stories/mini", label: "Mini histoires", desc: "Lis des histoires générées avec tes kanjis." },
                  { href: "/chat", label: "Chat Sensei", desc: "Pose tes questions au professeur virtuel." },
                ] as { href: string; label: string; desc: string }[]).map(({ href, label, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col items-start justify-between rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 hover:border-[#c41e1e]/40 hover:bg-[#c41e1e]/5 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-semibold text-[#f5ede0]">{label}</span>
                      <span className="text-xs text-[#c9a84c]/70 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <p className="text-xs text-[#f5ede0]/40">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sous-menu Grammaire */}
          {activeSection === "grammar" && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setActiveSection("main")}
                className="inline-flex items-center gap-2 text-sm text-[#f5ede0]/60 hover:text-[#f5ede0] px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden border border-white/10">
                  <img src="/sprites/logo_maison.png" alt="" className="w-full h-full object-cover" />
                </span>
                <span>Retour au menu</span>
              </button>

              <div className="mb-2">
                <h2
                  className="text-lg font-bold text-[#f5ede0] flex items-center gap-2 mb-1"
                  style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden border border-white/10">
                    <img src="/sprites/logo_pensif.png" alt="" className="w-full h-full object-cover" />
                  </span>
                  文法 — Grammaire & Formes
                </h2>
                <p className="text-sm text-[#f5ede0]/40 pl-8">Choisis le point de grammaire à travailler.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {([
                  { href: "/training/verbs", label: "Verbes", desc: "Conjugaisons de base et formes utiles." },
                  { href: "/training/adjectives", label: "Adjectifs", desc: "i / na et leurs transformations." },
                  { href: "/training/particles", label: "Particules", desc: "Complète la particule manquante dans la phrase." },
                ] as { href: string; label: string; desc: string }[]).map(({ href, label, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col items-start justify-between rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-semibold text-[#f5ede0]">{label}</span>
                      <span className="text-xs text-[#c9a84c]/70 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <p className="text-xs text-[#f5ede0]/40">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Vue Collection
  return (
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(196,30,30,0.1) 0%, transparent 55%)" }} />
      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.07] bg-black/25 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentView("menu")}
              className="flex items-center gap-2 px-3 py-1.5 text-[#f5ede0]/60 hover:text-[#f5ede0] transition-colors rounded-lg hover:bg-white/[0.06]"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden border border-white/10">
                <img src="/sprites/logo_maison.png" alt="" className="w-full h-full object-cover" />
              </span>
              <span className="hidden sm:inline text-sm">戻る Menu</span>
            </button>
            <div className="text-center">
              <h1
                className="text-xl font-bold text-[#f5ede0]"
                style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}
              >
                蔵書 Ma Collection
              </h1>
              <p className="text-[#c9a84c]/60 text-xs">
                {kanjis.length} kanji{kanjis.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                onClick={() => importInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/15 text-[#f5ede0]/60 hover:text-[#f5ede0] hover:border-white/30 transition-colors disabled:opacity-40"
              >
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded overflow-hidden">
                  <img src="/sprites/logo_victoire.png" alt="" className="w-full h-full object-cover" />
                </span>
                {importing ? "Import…" : "Importer"}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/15 text-[#f5ede0]/60 hover:text-[#f5ede0] hover:border-white/30 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded overflow-hidden">
                  <img src="/sprites/logo_lecteur.png" alt="" className="w-full h-full object-cover" />
                </span>
                Exporter
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Statut import */}
        {importStatus && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm whitespace-pre-line ${
            !importStatus.ok
              ? "bg-red-900/30 border-red-500/30 text-red-300"
              : "bg-emerald-900/30 border-emerald-500/30 text-emerald-300"
          }`}>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
              <img
                src={!importStatus.ok ? "/sprites/logo_triste.png" : "/sprites/logo_victoire.png"}
                alt=""
                className="w-full h-full object-cover"
              />
            </span>
            <span className="flex-1">{importStatus.msg}</span>
            <button onClick={() => setImportStatus(null)} className="text-current opacity-50 hover:opacity-100 text-lg leading-none">×</button>
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-6">
          <AddKanjiForm onKanjiAdded={handleKanjiAdded} />
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded overflow-hidden flex-shrink-0 border border-white/10">
                <img src="/sprites/logo_triste.png" alt="" className="w-full h-full object-cover" />
              </span>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Liste des kanjis */}
        <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-6">
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
