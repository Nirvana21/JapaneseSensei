"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddKanjiForm from "@/components/AddKanjiForm";
import KanjiList from "@/components/KanjiList";
import EditKanjiModal from "@/components/EditKanjiModal";
import { useKanjis } from "@/hooks/useKanjis";
import { KanjiEntry } from "@/types/kanji";
import { KanjiStorageService } from "@/services/kanjiStorage";

// ================================================================
// Types
// ================================================================
type Tab = "home" | "play" | "dojo" | "social";

// ================================================================
// Catalogues
// ================================================================
const TRAININGS = [
  { href: "/training", emoji: "📖", name: "Quiz Kanjis", desc: "Révisions adaptatives sur ta collection" },
  { href: "/training?mode=survival", emoji: "💥", name: "Survival", desc: "3 vies, questions en flux infini" },
];
const GAMES_LIST = [
  { href: "/game/speed-match", emoji: "⚡", name: "Speed Match", desc: "Trouve le sens avant la limite de temps" },
  { href: "/game/kana-quiz", emoji: "🔤", name: "Kana Quiz", desc: "Maîtrise les hiragana & katakana" },
  { href: "/game/kana-rain", emoji: "🌧️", name: "Kana Rain", desc: "Tape la lecture des kanjis qui tombent" },
  { href: "/game/memory", emoji: "🃏", name: "Mémory", desc: "Associe les paires kanji ↔ sens" },
  { href: "/game/sens-cache", emoji: "👁️", name: "Sens Caché", desc: "Retrouve le sens masqué" },
  { href: "/game/histoire-a-trous", emoji: "✍️", name: "À trous", desc: "Complète les histoires" },
  { href: "/game/kanji-legends", emoji: "🏆", name: "Kanji Legends", desc: "Assemble les composants kanji" },
  { href: "/stories/mini", emoji: "📖", name: "Mini histoires", desc: "Lis des histoires avec tes kanjis" },
  { href: "/chat", emoji: "🤖", name: "Chat Sensei", desc: "Pose tes questions au professeur IA" },
];
const GRAMMAR_LIST = [
  { href: "/training/verbs", emoji: "動", name: "Verbes", desc: "Conjugaisons et formes courantes" },
  { href: "/training/adjectives", emoji: "形", name: "Adjectifs", desc: "い-adj / な-adj et transformations" },
  { href: "/training/particles", emoji: "は", name: "Particules", desc: "Complète la particule manquante" },
];

// ================================================================
// Bottom Nav
// ================================================================
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { key: Tab; label: string }[] = [
    { key: "home", label: "Accueil" },
    { key: "play", label: "Jouer" },
    { key: "dojo", label: "Dojo" },
    { key: "social", label: "Social" },
  ];

  const icons: Record<Tab, React.ReactNode> = {
    home: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={2}>
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
    play: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" />
        <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="currentColor" />
      </svg>
    ),
    dojo: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={2}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeLinecap="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" />
      </svg>
    ),
    social: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeLinecap="round" />
      </svg>
    ),
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="max-w-lg mx-auto flex justify-around">
        {items.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-0.5 flex-1 py-2.5 transition-colors ${
              tab === key ? "text-red-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {icons[key]}
            <span className={`text-[10px] font-bold ${tab === key ? "text-red-600" : "text-slate-400"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ================================================================
// Composant Card de jeu
// ================================================================
function GameCard({ href, emoji, name, desc }: { href: string; emoji: string; name: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-[0.98] transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{name}</p>
        <p className="text-xs text-slate-400 truncate">{desc}</p>
      </div>
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" strokeWidth={2.5}>
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function SectionHeader({ title, color = "text-slate-500" }: { title: string; color?: string }) {
  return <h3 className={`text-[11px] font-bold uppercase tracking-widest ${color} px-0.5`}>{title}</h3>;
}

// ================================================================
// Onglet Accueil
// ================================================================
function HomeTab({ kanjis, loading }: { kanjis: KanjiEntry[]; loading: boolean }) {
  const hour = new Date().getHours();
  const greetings = [
    { text: "Ohayō !", ja: "おはようございます" },
    { text: "Konnichiwa !", ja: "こんにちは" },
    { text: "Konbanwa !", ja: "こんばんは" },
  ];
  const { text: greeting, ja: greetingJa } = greetings[hour < 12 ? 0 : hour < 18 ? 1 : 2];

  const [hasPlayed, setHasPlayed] = useState(false);
  useEffect(() => {
    setHasPlayed(!!localStorage.getItem("js_has_played"));
  }, []);

  const steps = [
    { label: "Ajouter ton premier kanji", done: kanjis.length > 0, href: null as string | null },
    { label: "Jouer à un premier jeu", done: hasPlayed, href: "/game/kana-quiz" },
    { label: "Explorer les kanjis JLPT", done: false, href: "/game/speed-match" },
    { label: "Trouver un ami", done: false, href: "/social" },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  const QUICK = [
    { href: "/training", emoji: "📖", name: "Quiz", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
    { href: "/game/speed-match", emoji: "⚡", name: "Speed", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    { href: "/game/kana-quiz", emoji: "🔤", name: "Kana", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
    { href: "/game/kana-rain", emoji: "🌧️", name: "Rain", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  ];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-5 text-white shadow-lg">
        <div className="absolute -top-4 -right-4 text-9xl opacity-10 leading-none select-none pointer-events-none">日</div>
        <p className="text-xs font-medium opacity-70 mb-0.5">{greetingJa}</p>
        <h2 className="text-2xl font-bold mb-4">{greeting}</h2>
        <div className="flex gap-3">
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
            {loading ? (
              <div className="w-8 h-5 bg-white/20 rounded animate-pulse mx-auto" />
            ) : (
              <p className="text-xl font-bold">{kanjis.length}</p>
            )}
            <p className="text-[10px] opacity-80">kanjis</p>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
            <p className="text-xl font-bold">
              {doneCount}/{steps.length}
            </p>
            <p className="text-[10px] opacity-80">objectifs</p>
          </div>
        </div>
      </div>

      {/* Jouer rapidement */}
      <div className="space-y-2.5">
        <SectionHeader title="Jouer maintenant" />
        <div className="grid grid-cols-4 gap-2">
          {QUICK.map(({ href, emoji, name, bg, text }) => (
            <Link
              key={href}
              href={href}
              onClick={() => localStorage.setItem("js_has_played", "1")}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border ${bg} active:scale-95 transition-transform`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className={`text-[11px] font-semibold ${text}`}>{name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Onboarding */}
      {!allDone && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-700">🗺️ Premiers pas</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {doneCount}/{steps.length}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / steps.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${step.done ? "opacity-40" : ""}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                    step.done ? "bg-green-500" : "border-2 border-slate-300"
                  }`}
                >
                  {step.done && (
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" strokeWidth={3}>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm flex-1 ${step.done ? "line-through text-slate-400" : "text-slate-700"}`}
                >
                  {step.label}
                </span>
                {!step.done && step.href && (
                  <Link href={step.href} className="text-xs font-bold text-red-600 shrink-0 hover:underline">
                    →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explorer */}
      <div className="space-y-2.5">
        <SectionHeader title="Explorer" />
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { href: "/stats", emoji: "📊", label: "Stats" },
            { href: "/social", emoji: "👥", label: "Social" },
            { href: "/chat", emoji: "🤖", label: "Sensei" },
          ].map(({ href, emoji, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow active:scale-95 transition-all"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-semibold text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Onglet Jeux
// ================================================================
function PlayTab() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <SectionHeader title="Entraînement kanji" color="text-indigo-600" />
        {TRAININGS.map((g) => (
          <GameCard key={g.href} {...g} />
        ))}
      </div>
      <div className="space-y-2">
        <SectionHeader title="Mini-jeux" color="text-amber-600" />
        {GAMES_LIST.map((g) => (
          <GameCard key={g.href} {...g} />
        ))}
      </div>
      <div className="space-y-2">
        <SectionHeader title="Grammaire" color="text-emerald-600" />
        {GRAMMAR_LIST.map((g) => (
          <GameCard key={g.href} {...g} />
        ))}
      </div>
    </div>
  );
}

// ================================================================
// Onglet Dojo (collection)
// ================================================================
interface DojoTabProps {
  kanjis: KanjiEntry[];
  loading: boolean;
  error: string | null;
  onEdit: (k: KanjiEntry) => void;
  onDelete: (id: string) => void;
  onKanjiAdded: () => void;
  onImport: () => void;
  onExport: () => void;
}

function DojoTab({
  kanjis,
  loading,
  error,
  onEdit,
  onDelete,
  onKanjiAdded,
  onImport,
  onExport,
}: DojoTabProps) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ma Collection</h2>
          <p className="text-xs text-slate-400">
            {loading ? "Chargement…" : `${kanjis.length} kanji${kanjis.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onImport}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            title="Importer JSON"
          >
            📥
          </button>
          <button
            onClick={onExport}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            title="Exporter JSON"
          >
            📤
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className={`flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold transition-colors ${
              showAdd ? "bg-slate-200 text-slate-700" : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {showAdd ? "✕" : "+ Ajouter"}
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <AddKanjiForm
            onKanjiAdded={() => {
              onKanjiAdded();
              setShowAdd(false);
            }}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <span>⚠️</span> {error}
        </div>
      )}

      <KanjiList kanjis={kanjis} loading={loading} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

// ================================================================
// Onglet Social
// ================================================================
function SocialTab() {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-5 text-white shadow-lg">
        <div className="absolute -top-4 -right-4 text-9xl opacity-10 leading-none select-none">友</div>
        <p className="text-xs font-medium opacity-70 mb-0.5">仲間と一緒に</p>
        <h2 className="text-xl font-bold mb-2">Challenge tes amis</h2>
        <p className="text-sm opacity-80">Défie tes amis sur les mêmes jeux et compare vos scores.</p>
      </div>

      <Link
        href="/social"
        className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">👥</div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">Amis &amp; Défis</p>
          <p className="text-xs text-slate-400">Gérer tes amis, envoyer et recevoir des défis</p>
        </div>
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-300" fill="none" strokeWidth={2.5}>
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="space-y-2">
        <SectionHeader title="Jeux pour les défis" color="text-indigo-500" />
        {GAMES_LIST.slice(0, 4).map(({ href, emoji, name, desc }) => (
          <GameCard key={href} href={href} emoji={emoji} name={name} desc={desc} />
        ))}
      </div>

      <p className="text-xs text-center text-slate-400 pb-2">
        Lance un défi depuis la page Social après avoir joué 🏆
      </p>
    </div>
  );
}

// ================================================================
// Page principale
// ================================================================
export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [editingKanji, setEditingKanji] = useState<KanjiEntry | null>(null);
  const { kanjis, loading, error, updateKanji, deleteKanji, refreshKanjis } = useKanjis();

  const handleSaveEdit = async (k: KanjiEntry) => {
    await updateKanji(k);
    setEditingKanji(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer ce kanji ?")) await deleteKanji(id);
  };

  const handleExport = useCallback(async () => {
    try {
      const json = await KanjiStorageService.exportKanjis();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      a.download = `kanjis-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch {
      alert("Impossible d'exporter.");
    }
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const result = await KanjiStorageService.importKanjis(text, false);
        await refreshKanjis();
        alert(
          `Import terminé !\n✓ ${result.count} ajouté${result.count > 1 ? "s" : ""}` +
            `\n⏩ ${result.skipped} déjà présent${result.skipped > 1 ? "s" : ""}` +
            (result.errors > 0 ? `\n⚠️ ${result.errors} erreur(s)` : "")
        );
      } catch {
        alert("Fichier invalide ou erreur lors de l'import.");
      }
    };
    input.click();
  }, [refreshKanjis]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  };

  const tabTitles: Record<Tab, string> = {
    home: "Japanese Sensei",
    play: "Jouer",
    dojo: "Dojo",
    social: "Social",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header sticky */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-red-600 flex-shrink-0">
              <img src="/sprites/logo_sans_fond.png" alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-800 text-sm">{tabTitles[tab]}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-28">
        {tab === "home" && <HomeTab kanjis={kanjis} loading={loading} />}
        {tab === "play" && <PlayTab />}
        {tab === "dojo" && (
          <DojoTab
            kanjis={kanjis}
            loading={loading}
            error={error}
            onEdit={setEditingKanji}
            onDelete={handleDelete}
            onKanjiAdded={refreshKanjis}
            onImport={handleImport}
            onExport={handleExport}
          />
        )}
        {tab === "social" && <SocialTab />}
      </main>

      {/* Navigation bas */}
      <BottomNav tab={tab} setTab={setTab} />

      {/* Modal édition */}
      <EditKanjiModal
        kanji={editingKanji}
        isOpen={!!editingKanji}
        onClose={() => setEditingKanji(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
