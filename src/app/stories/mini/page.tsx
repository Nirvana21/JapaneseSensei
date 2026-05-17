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
  const [translation, setTranslation] = useState("");
  const [extraKanji, setExtraKanji] = useState<
    { char: string; lecture?: string; sens_fr?: string; examplesKana?: string[] }[]
  >([]);
  const [extraVocabKana, setExtraVocabKana] = useState<
    { kana: string; category?: string; sens_fr?: string }[]
  >([]);
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
    setTranslation("");
    setExtraKanji([]);
    setExtraVocabKana([]);
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
    setTranslation("");
    setExtraKanji([]);
    setExtraVocabKana([]);
    setFocusedKanji(null);

    try {
      // Limiter la taille du contexte envoyé au backend en fonction de la longueur
      const shuffled = [...candidateKanjis].sort(() => Math.random() - 0.5);
      const maxKanjis =
        lengthPreset === "long" ? 25 : lengthPreset === "medium" ? 18 : 12;
      const limited = shuffled.slice(0, maxKanjis);

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
      const trans = (data?.translation as string) || "";
      const extra = (data?.extraKanji as { char: string; lecture?: string; sens_fr?: string; examplesKana?: string[] }[]) || [];
      const extraVocab = (data?.extraVocabKana as { kana: string; category?: string; sens_fr?: string }[]) || [];
      setStory(text.trim());
      setTranslation(trans.trim());
      setExtraKanji(extra);
      setExtraVocabKana(extraVocab);
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
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex flex-col">
      <header className="bg-black/30 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-md overflow-hidden border border-white/10">
              <img
                src="/sprites/logo_amour.png"
                alt="Japanese Sensei - Histoires"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-[#f5ede0] truncate">
                Mini histoires de kanjis
              </h1>
              <p className="text-[11px] md:text-xs text-[#f5ede0]/50 truncate">
                Génère des histoires à partir de ta collection et des niveaux JLPT.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-[#f5ede0] text-xs md:text-sm font-medium border border-white/[0.10] transition-colors"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden border border-white/10">
              <img
                src="/sprites/logo_maison.png"
                alt="Menu principal"
                className="w-full h-full object-cover"
              />
            </span>
            <span className="hidden sm:inline">Menu</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 md:py-6 flex flex-col gap-4 md:gap-6">
        {/* Panneau de configuration */}
        <section className="bg-white/[0.04] backdrop-blur-sm rounded-3xl border border-white/[0.08] p-4 md:p-5 space-y-4 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm md:text-base font-semibold text-[#f5ede0] flex items-center gap-2">
                <span>⚙️</span>
                <span>Paramètres de l'histoire</span>
              </h2>
              <p className="text-xs md:text-sm text-[#f5ede0]/50">
                Choisis les niveaux JLPT, la longueur et un thème, puis laisse le sensei inventer.
              </p>
            </div>
            <div className="text-xs text-[#f5ede0]/50">
              {loading
                ? "Chargement de ta collection..."
                : `${kanjis.length} kanji${kanjis.length > 1 ? "s" : ""} dans ta collection`}
            </div>
          </div>

          {/* JLPT levels */}
          <div className="space-y-2">
            <p className="text-xs md:text-sm font-medium text-[#f5ede0]/80">
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
                        ? "bg-[#c41e1e] text-[#f5ede0] border-[#c41e1e] shadow-sm"
                        : "bg-white/[0.06] text-[#f5ede0]/70 border-white/[0.15] hover:bg-white/[0.10]")
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
                className="px-3 py-1 rounded-full text-xs md:text-sm border border-white/[0.15] bg-white/[0.06] text-[#f5ede0]/70 hover:bg-white/[0.10]"
              >
                Tous les niveaux
              </button>
            </div>
            <p className="text-[11px] text-[#f5ede0]/40">
              Kanji utilisés pour l'histoire : {candidateKanjis.length} sélectionné(s) après filtres.
            </p>
          </div>

          {/* Longueur & thème */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] gap-3 md:gap-4 items-start">
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium text-[#f5ede0]/80">
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
                        ? "bg-[#c41e1e] text-[#f5ede0] border-[#c41e1e] shadow-sm"
                        : "bg-white/[0.06] text-[#f5ede0]/70 border-white/[0.15] hover:bg-white/[0.10]")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium text-[#f5ede0]/80 flex items-center gap-1">
                <span>Thème (optionnel)</span>
              </p>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex : école, voyage au Japon, restaurant, amis..."
                className="w-full rounded-xl border border-white/[0.10] bg-white/[0.06] px-3 py-2 text-xs md:text-sm text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:outline-none focus:ring-2 focus:ring-[#c41e1e]/40"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-[11px] md:text-xs text-[#f5ede0]/40 max-w-md">
              L'histoire sera générée en japonais, avec une traduction française en dessous.
              Tu peux cliquer sur un kanji de ta collection dans le texte pour voir tous ses détails,
              et une liste expliquera aussi les nouveaux kanjis rencontrés.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || kanjis.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c41e1e] text-[#f5ede0] text-xs md:text-sm font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c41e1e]/80 transition-colors"
            >
              {generating ? "Génération en cours..." : "Générer une mini histoire"}
            </button>
          </div>

          {error && (
            <div className="mt-2 px-3 py-2 rounded-xl bg-red-900/20 border border-red-500/40 text-xs md:text-sm text-red-400">
              {error}
            </div>
          )}
        </section>

        {/* Zone d'histoire */}
        <section className="flex-1 bg-white/[0.04] backdrop-blur-sm rounded-3xl border border-white/[0.08] p-4 md:p-6 min-h-[260px] space-y-4 animate-fade-in-up">
          {story ? (
            <>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-sm md:text-base font-semibold text-[#f5ede0] flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src="/sprites/logo_lecteur.png"
                      alt="Histoire générée"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span>Histoire générée</span>
                </h2>
              </div>
              <div className="border-t border-white/[0.08] pt-3">
                {renderStory()}
              </div>
              {translation && (
                <div className="mt-4 pt-3 border-t border-dashed border-white/[0.08]">
                  <h3 className="text-xs md:text-sm font-semibold text-[#f5ede0]/80 mb-2 flex items-center gap-1">
                    <span>🇫🇷</span>
                    <span>Traduction (indicative)</span>
                  </h3>
                  <p className="text-xs md:text-sm leading-relaxed text-[#f5ede0]/70 whitespace-pre-line">
                    {translation}
                  </p>
                </div>
              )}
              {!translation && (
                <p className="mt-3 text-[11px] md:text-xs text-[#f5ede0]/40">
                  La traduction n'a pas pu être générée correctement. Tu peux tout de même utiliser l'histoire japonaise
                  et cliquer sur les kanjis connus pour voir leurs détails.
                </p>
              )}
              {extraKanji.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-dashed border-white/[0.08]">
                  <h3 className="text-xs md:text-sm font-semibold text-[#f5ede0]/80 mb-2 flex items-center gap-1">
                    <span>🧩</span>
                    <span>Autres kanjis rencontrés dans l'histoire</span>
                  </h3>
                  <ul className="space-y-2 text-xs md:text-sm text-[#f5ede0]/70">
                    {extraKanji.map((k) => (
                      <li key={k.char} className="flex flex-col gap-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg">{k.char}</span>
                          <span className="text-[#f5ede0]/50">
                            {k.lecture && <span className="mr-2">[{k.lecture}]</span>}
                            {k.sens_fr || "(sens non précisé)"}
                          </span>
                        </div>
                        {k.examplesKana && k.examplesKana.length > 0 && (
                          <div className="pl-7 text-[11px] md:text-xs text-[#f5ede0]/40 flex flex-wrap gap-1.5 items-center">
                            <span className="font-medium text-[#f5ede0]/60">Exemples (かな) :</span>
                            {k.examplesKana.slice(0, 3).map((ex, idx) => (
                              <span
                                key={`${k.char}-ex-${idx}`}
                                className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.10] text-[#f5ede0]/80"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] md:text-xs text-[#f5ede0]/30">
                    Ces kanjis ne sont pas encore dans ta collection, mais ils apparaissent dans l'histoire.
                    Tu peux les ajouter plus tard si tu veux les travailler — les mots en かな ci-dessus montrent quelques usages plus complexes (verbes, expressions...).
                  </p>
                </div>
              )}
              {extraVocabKana.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-dashed border-white/[0.08]">
                  <h3 className="text-xs md:text-sm font-semibold text-[#f5ede0]/80 mb-2 flex items-center gap-1">
                    <span>✏️</span>
                    <span>Vocabulaire en かな un peu plus avancé</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs md:text-sm text-[#f5ede0]/70">
                    {extraVocabKana.map((v, idx) => (
                      <li key={`${v.kana}-${idx}`} className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.10] text-[#f5ede0]/80 text-[11px] md:text-xs">
                          {v.kana}
                        </span>
                        {v.category && (
                          <span className="text-[11px] md:text-xs text-[#f5ede0]/40">
                            ({v.category})
                          </span>
                        )}
                        {v.sens_fr && (
                          <span className="text-[11px] md:text-xs text-[#f5ede0]/40">
                            — {v.sens_fr}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] md:text-xs text-[#f5ede0]/30">
                    Ces mots sont écrits uniquement en かな dans l'histoire : ce sont des verbes, adjectifs ou petites expressions un peu plus complexes, utiles à retenir.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#f5ede0]/50 text-xs md:text-sm gap-2">
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
