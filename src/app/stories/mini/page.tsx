"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useKanjis } from "@/hooks/useKanjis";
import { KanjiEntry } from "@/types/kanji";
import KanjiDetailModal from "@/components/KanjiDetailModal";

type LengthPreset = "short" | "medium" | "long";

const JLPT_LEVELS = ["jlpt-n5", "jlpt-n4", "jlpt-n3", "jlpt-n2", "jlpt-n1"];

export default function MiniStoriesPage() {
  const { kanjis, loading } = useKanjis();
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["jlpt-n5", "jlpt-n4"]);
  const [lengthPreset, setLengthPreset] = useState<LengthPreset>("short");
  const [theme, setTheme] = useState("");
  const [story, setStory] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedKanji, setFocusedKanji] = useState<KanjiEntry | null>(null);

  const candidateKanjis = useMemo(() => {
    if (kanjis.length === 0) return [] as KanjiEntry[];
    if (!selectedLevels || selectedLevels.length === 0) return kanjis;
    return kanjis.filter((k) =>
      k.jlptLevel ? selectedLevels.includes(k.jlptLevel) : false
    );
  }, [kanjis, selectedLevels]);

  const kanjiByChar = useMemo(() => {
    const map: Record<string, KanjiEntry> = {};
    for (const k of kanjis) {
      if (!map[k.kanji]) map[k.kanji] = k;
    }
    return map;
  }, [kanjis]);

  const toggleLevel = (level: string) => {
    setStory("");
    setError(null);
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleGenerate = async () => {
    if (candidateKanjis.length === 0) {
      setError("Aucun kanji disponible avec ces filtres.");
      return;
    }

    setGenerating(true);
    setError(null);
    setStory("");
    setFocusedKanji(null);

    try {
      // Limiter la taille du contexte envoyé au backend
      const shuffled = [...candidateKanjis].sort(() => Math.random() - 0.5);
      const limited = shuffled.slice(0, 40);

      const payload = {
        jlptLevels: selectedLevels,
        lengthPreset,
        theme: theme || undefined,
        kanjis: limited.map((k) => ({
          char: k.kanji,
          meaning: k.primaryMeaning || k.meanings?.[0],
          jlptLevel: k.jlptLevel,
        })),
      };

      const res = await fetch("/api/stories/mini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Erreur lors de la génération.");
      }

      const data = await res.json();
      const text = (data?.story as string) || "";
      setStory(text.trim());
    } catch (err: any) {
      console.error("Mini story error", err);
      setError(err.message || "Impossible de générer l'histoire.");
    } finally {
      setGenerating(false);
    }
  };

  const renderStory = () => {
    if (!story) return null;

    const lines = story.split(/\r?\n/);

    return (
      <div className="space-y-2 text-lg leading-relaxed text-amber-900">
        {lines.map((line, lineIndex) => (
          <p key={lineIndex} className="break-words">
            {[...line].map((ch, idx) => {
              const k = kanjiByChar[ch];
              if (k) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFocusedKanji(k)}
                    className="inline-flex items-center justify-center mx-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors"
                    aria-label={`Voir les détails pour le kanji ${ch}`}
                  >
                    {ch}
                  </button>
                );
              }
              return (
                <span key={idx}>{ch}</span>
              );
            })}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
      <header className="bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md border-b border-amber-200/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-orange-700 rounded-xl shadow-md">
              <span className="text-xl">📖</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-800 to-orange-800 bg-clip-text text-transparent truncate">
                Mini histoires de kanjis
              </h1>
              <p className="text-[11px] md:text-xs text-amber-700 truncate">
                Génère des histoires à partir de ta collection et des niveaux JLPT.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs md:text-sm font-medium shadow-sm border border-amber-300 transition-colors"
          >
            ← Menu
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 md:py-6 flex flex-col gap-4 md:gap-6">
        {/* Panneau de configuration */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-md border border-amber-100 p-4 md:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm md:text-base font-semibold text-amber-900 flex items-center gap-2">
                <span>⚙️</span>
                <span>Paramètres de l'histoire</span>
              </h2>
              <p className="text-xs md:text-sm text-amber-700">
                Choisis les niveaux JLPT, la longueur et un thème, puis laisse le sensei inventer.
              </p>
            </div>
            <div className="text-xs text-amber-700">
              {loading
                ? "Chargement de ta collection..."
                : `${kanjis.length} kanji${kanjis.length > 1 ? "s" : ""} dans ta collection`}
            </div>
          </div>

          {/* JLPT levels */}
          <div className="space-y-2">
            <p className="text-xs md:text-sm font-medium text-amber-900">
              Niveaux JLPT à privilégier
            </p>
            <div className="flex flex-wrap gap-2">
              {JLPT_LEVELS.map((level) => {
                const active = selectedLevels.includes(level);
                const label = level.toUpperCase().replace("JLPT-", "JLPT ");
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleLevel(level)}
                    className={
                      "px-3 py-1 rounded-full text-xs md:text-sm border transition-colors " +
                      (active
                        ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                        : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100")
                    }
                  >
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setSelectedLevels([]);
                  setStory("");
                  setError(null);
                }}
                className="px-3 py-1 rounded-full text-xs md:text-sm border border-amber-300 bg-white text-amber-800 hover:bg-amber-50"
              >
                Tous les niveaux
              </button>
            </div>
            <p className="text-[11px] text-amber-700">
              Kanji utilisés pour l'histoire : {candidateKanjis.length} sélectionné(s) après filtres.
            </p>
          </div>

          {/* Longueur & thème */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] gap-3 md:gap-4 items-start">
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium text-amber-900">
                Longueur de l'histoire
              </p>
              <div className="flex flex-wrap gap-2">
                {([
                  ["short", "Courte"],
                  ["medium", "Moyenne"],
                  ["long", "Longue"],
                ] as [LengthPreset, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setLengthPreset(value);
                      setStory("");
                      setError(null);
                    }}
                    className={
                      "px-3 py-1 rounded-full text-xs md:text-sm border transition-colors " +
                      (lengthPreset === value
                        ? "bg-red-500 text-white border-red-600 shadow-sm"
                        : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium text-amber-900 flex items-center gap-1">
                <span>Thème (optionnel)</span>
              </p>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex : école, voyage au Japon, restaurant, amis..."
                className="w-full rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-[11px] md:text-xs text-amber-700 max-w-md">
              L'histoire sera générée en japonais uniquement. Tu peux cliquer sur un kanji dans le texte pour voir tous ses détails (lectures, sens, ordre des traits...).
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || kanjis.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs md:text-sm font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              {generating ? "Génération en cours..." : "Générer une mini histoire"}
            </button>
          </div>

          {error && (
            <div className="mt-2 px-3 py-2 rounded-xl bg-red-100 border border-red-300 text-xs md:text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* Zone d'histoire */}
        <section className="flex-1 bg-white/85 backdrop-blur-sm rounded-3xl shadow-md border border-amber-100 p-4 md:p-6 min-h-[220px]">
          {story ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-sm md:text-base font-semibold text-amber-900 flex items-center gap-2">
                  <span>📖</span>
                  <span>Histoire générée</span>
                </h2>
              </div>
              <div className="border-t border-amber-100 pt-3">
                {renderStory()}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-amber-700 text-xs md:text-sm gap-2">
              <span className="text-3xl mb-1">🖋️</span>
              <p>
                Choisis quelques niveaux JLPT et un thème, puis clique sur
                <span className="font-semibold"> "Générer une mini histoire"</span>.
              </p>
              <p className="max-w-md">
                Le texte utilisera en priorité les kanjis de ta collection.
                Tu pourras ensuite cliquer sur chaque kanji pour revoir ses
                significations et lectures.
              </p>
            </div>
          )}
        </section>
      </main>

      <KanjiDetailModal
        kanji={focusedKanji}
        isOpen={!!focusedKanji}
        onClose={() => setFocusedKanji(null)}
      />
    </div>
  );
}
