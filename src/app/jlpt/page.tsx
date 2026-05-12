"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ALL_JLPT_KANJI,
  JLPT_N5,
  JLPT_N4,
  JLPTKanjiData,
  JLPT_STATS,
} from "../../data/jlptData";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type Level = "all" | "N5" | "N4";
type SortMode = "default" | "alpha" | "stroke";

interface KanjiCardProps {
  kanji: JLPTKanjiData;
  expanded: boolean;
  onToggle: () => void;
}

// ----------------------------------------------------------------
// Composant carte kanji
// ----------------------------------------------------------------
function KanjiCard({ kanji, expanded, onToggle }: KanjiCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-2xl border-2 transition-all ${
        expanded
          ? "border-teal-400 bg-teal-50/90 shadow-md"
          : "border-slate-200/80 bg-white/80 hover:border-teal-300 hover:bg-teal-50/50"
      }`}
    >
      {/* Ligne principale */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span
          className={`text-3xl font-bold w-10 text-center flex-shrink-0 ${
            kanji.level === "N5" ? "text-teal-700" : "text-cyan-700"
          }`}
        >
          {kanji.kanji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                kanji.level === "N5"
                  ? "bg-teal-100 text-teal-700"
                  : "bg-cyan-100 text-cyan-700"
              }`}
            >
              {kanji.level}
            </span>
            <span className="text-sm font-semibold text-slate-800 truncate">
              {kanji.meanings.slice(0, 2).join(", ")}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {[...kanji.onyomi, ...kanji.kunyomi].slice(0, 3).join("・")}
          </div>
        </div>
        <span className="text-slate-400 text-xs">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Détails expandus */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-teal-200/60 pt-2">
          {/* Lectures */}
          <div className="flex gap-3 text-xs">
            {kanji.onyomi.length > 0 && (
              <div>
                <span className="text-teal-500 font-semibold">On : </span>
                <span className="text-slate-700">{kanji.onyomi.join("、")}</span>
              </div>
            )}
            {kanji.kunyomi.length > 0 && (
              <div>
                <span className="text-cyan-500 font-semibold">Kun : </span>
                <span className="text-slate-700">{kanji.kunyomi.join("、")}</span>
              </div>
            )}
          </div>

          {/* Tous les sens */}
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Sens : </span>
            {kanji.meanings.join(", ")}
          </div>

          {/* Tags */}
          {kanji.tags.filter((t) => t !== kanji.level).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {kanji.tags
                .filter((t) => t !== kanji.level)
                .map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}

          {/* Exemples */}
          {kanji.examples.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                Exemples
              </p>
              {kanji.examples.map((ex, i) => (
                <div key={i} className="flex items-baseline gap-2 text-xs">
                  <span className="font-bold text-slate-800">{ex.word}</span>
                  <span className="text-slate-400">({ex.reading})</span>
                  <span className="text-slate-600">→ {ex.meaning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

// ----------------------------------------------------------------
// Page principale
// ----------------------------------------------------------------
export default function JLPTPage() {
  const [level, setLevel] = useState<Level>("all");
  const [sort, setSort] = useState<SortMode>("default");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list: JLPTKanjiData[] =
      level === "N5" ? JLPT_N5 : level === "N4" ? JLPT_N4 : ALL_JLPT_KANJI;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (k) =>
          k.kanji.includes(q) ||
          k.meanings.some((m) => m.toLowerCase().includes(q)) ||
          k.onyomi.some((r) => r.includes(q)) ||
          k.kunyomi.some((r) => r.includes(q)) ||
          k.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === "alpha") {
      list = [...list].sort((a, b) => a.kanji.localeCompare(b.kanji));
    } else if (sort === "stroke") {
      list = [...list].sort((a, b) => a.strokeCount - b.strokeCount);
    }

    return list;
  }, [level, sort, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-teal-200/60 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors flex-shrink-0"
          >
            <img
              src="/sprites/logo_maison.png"
              alt="Accueil"
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-teal-900 leading-tight">
              Base JLPT
            </h1>
            <p className="text-[11px] text-teal-600">
              {JLPT_STATS.N5} kanjis N5 · {JLPT_STATS.N4} kanjis N4
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/game/speed-match"
              className="text-[11px] px-2.5 py-1.5 rounded-xl bg-teal-100 text-teal-700 font-semibold hover:bg-teal-200 transition-colors"
            >
              Speed Match
            </Link>
            <Link
              href="/game/kana-rain"
              className="text-[11px] px-2.5 py-1.5 rounded-xl bg-cyan-100 text-cyan-700 font-semibold hover:bg-cyan-200 transition-colors"
            >
              Kana Rain
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Filtres */}
        <div className="space-y-3">
          {/* Recherche */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un kanji, sens, ou tag..."
            className="w-full rounded-xl border border-teal-200 bg-white/80 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-400 transition-colors"
          />

          <div className="flex items-center gap-2 flex-wrap">
            {/* Niveau */}
            <div className="flex rounded-xl overflow-hidden border border-teal-200 bg-white/80">
              {(["all", "N5", "N4"] as Level[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    level === l
                      ? "bg-teal-500 text-white"
                      : "text-teal-700 hover:bg-teal-50"
                  }`}
                >
                  {l === "all" ? "Tous" : l}
                  <span className="ml-1 opacity-70">
                    (
                    {l === "all"
                      ? JLPT_STATS.total
                      : l === "N5"
                      ? JLPT_STATS.N5
                      : JLPT_STATS.N4}
                    )
                  </span>
                </button>
              ))}
            </div>

            {/* Tri */}
            <div className="flex rounded-xl overflow-hidden border border-teal-200 bg-white/80">
              {([
                ["default", "Défaut"],
                ["alpha", "A→Z"],
                ["stroke", "Traits"],
              ] as [SortMode, string][]).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    sort === s
                      ? "bg-teal-500 text-white"
                      : "text-teal-700 hover:bg-teal-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="text-xs text-teal-500 ml-auto">
              {filtered.length} kanji{filtered.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-teal-100/70 rounded-2xl px-4 py-3 text-xs text-teal-800">
          <strong>Collection de référence</strong> — Ces kanjis font partie du
          programme officiel JLPT N5 et N4. Utilise-les dans Speed Match, Kana
          Rain, ou Sens Caché pour t'entraîner dessus !
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-teal-400">
            Aucun kanji trouvé pour &ldquo;{search}&rdquo;
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((kanji) => (
              <KanjiCard
                key={kanji.kanji}
                kanji={kanji}
                expanded={expandedId === kanji.kanji}
                onToggle={() =>
                  setExpandedId(
                    expandedId === kanji.kanji ? null : kanji.kanji
                  )
                }
              />
            ))}
          </div>
        )}

        {/* Pied de page */}
        <div className="text-center text-xs text-teal-400 pb-4">
          {JLPT_STATS.total} kanjis JLPT N5 + N4 · Japanese Sensei
        </div>
      </main>
    </div>
  );
}
