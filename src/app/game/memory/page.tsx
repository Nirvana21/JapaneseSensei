"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useKanjis } from "../../../hooks/useKanjis";
import { JLPT_N5, JLPT_N4, ALL_JLPT_KANJI } from "../../../data/jlptData";
import {
  simpleAdaptiveLearningService,
} from "../../../services/adaptiveLearningService";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type SourceMode = "personal" | "n5" | "n4" | "n5n4";
type GamePhase = "menu" | "playing" | "result";

interface Card {
  id: string;
  content: string; // kanji ou signification
  pairId: string;  // lier kanji ↔ signification
  type: "kanji" | "meaning";
  flipped: boolean;
  matched: boolean;
}

// ----------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------
const PAIRS_OPTIONS = [6, 8, 10] as const;
type PairsCount = typeof PAIRS_OPTIONS[number];

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(
  pairs: Array<{ kanji: string; meaning: string }>,
  count: PairsCount
): Card[] {
  const selected = shuffleArray(pairs).slice(0, count);
  const cards: Card[] = [];
  selected.forEach((pair, i) => {
    const pairId = `pair-${i}`;
    cards.push({
      id: `kanji-${i}`,
      content: pair.kanji,
      pairId,
      type: "kanji",
      flipped: false,
      matched: false,
    });
    cards.push({
      id: `meaning-${i}`,
      content: pair.meaning,
      pairId,
      type: "meaning",
      flipped: false,
      matched: false,
    });
  });
  return shuffleArray(cards);
}

// ----------------------------------------------------------------
// Composant
// ----------------------------------------------------------------
export default function MemoryPage() {
  const { kanjis } = useKanjis();

  const [sourceMode, setSourceMode] = useState<SourceMode>("n5");
  const [pairsCount, setPairsCount] = useState<PairsCount>(6);
  const [phase, setPhase] = useState<GamePhase>("menu");

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [locked, setLocked] = useState(false);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, startTime]);

  // ----------------------------------------------------------------
  // Construire le jeu
  // ----------------------------------------------------------------
  const startGame = useCallback(() => {
    let pairs: Array<{ kanji: string; meaning: string }>;

    if (sourceMode !== "personal") {
      const base = sourceMode === "n5" ? JLPT_N5 : sourceMode === "n4" ? JLPT_N4 : ALL_JLPT_KANJI;
      pairs = base.map((k) => ({
        kanji: k.kanji,
        meaning: k.meanings[0],
      }));
    } else {
      const lk = kanjis.map((k) =>
        simpleAdaptiveLearningService.initializeLearningData(k)
      );
      pairs = lk
        .filter((k) => k.kanji && k.meanings?.length)
        .map((k) => ({ kanji: k.kanji, meaning: k.meanings![0] }));
    }

    if (pairs.length < pairsCount) return;

    const built = buildCards(pairs, pairsCount);
    setCards(built);
    setFlippedIds([]);
    setMoves(0);
    setMatchedCount(0);
    setStartTime(Date.now());
    setElapsedSec(0);
    setLocked(false);
    setPhase("playing");
  }, [sourceMode, pairsCount, kanjis]);

  // ----------------------------------------------------------------
  // Retourner une carte
  // ----------------------------------------------------------------
  const flipCard = useCallback(
    (id: string) => {
      if (locked) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return;
      if (flippedIds.includes(id)) return;

      const newFlipped = [...flippedIds, id];
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
      );
      setFlippedIds(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);

        const [id1, id2] = newFlipped;
        const c1 = cards.find((c) => c.id === id1)!;
        const c2 = cards.find((c) => c.id === id2)!;

        if (c1.pairId === c2.pairId) {
          // Match !
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.pairId === c1.pairId ? { ...c, matched: true } : c
              )
            );
            setMatchedCount((mc) => {
              const next = mc + 1;
              if (next === pairsCount) {
                setPhase("result");
              }
              return next;
            });
            setFlippedIds([]);
            setLocked(false);
          }, 500);
        } else {
          // Pas de match — retourner face cachée
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id) ? { ...c, flipped: false } : c
              )
            );
            setFlippedIds([]);
            setLocked(false);
          }, 900);
        }
      }
    },
    [cards, flippedIds, locked, pairsCount]
  );

  // ----------------------------------------------------------------
  // Score (moins de mouvements = mieux)
  // ----------------------------------------------------------------
  const computeScore = () => {
    const perfect = pairsCount; // nombre minimum de tentatives possible
    const penalty = Math.max(0, moves - perfect) * 2;
    const timePenalty = Math.floor(elapsedSec / 10);
    return Math.max(10, pairsCount * 10 - penalty - timePenalty);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ----------------------------------------------------------------
  // Rendu Menu
  // ----------------------------------------------------------------
  if (phase === "menu") {
    const hasPersonal = kanjis.length >= 6;
    return (
      <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex flex-col">
        <header className="bg-black/30 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden border border-white/10 hover:bg-white/[0.08] transition-colors"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-[#f5ede0]">Mémory</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🃏</div>
            <h2 className="text-2xl font-bold text-[#f5ede0] mb-2">Mémory rapide</h2>
            <p className="text-[#f5ede0]/60 text-sm">
              Associe chaque <strong>kanji</strong> à son <strong>sens</strong>.
              Retourne deux cartes à la fois — trouve toutes les paires avec le moins de coups possible !
            </p>
          </div>

          {/* Source */}
          <div className="w-full max-w-xs space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#f5ede0]/50 uppercase tracking-wide mb-2 text-center">
                Source
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSourceMode("personal")}
                  disabled={!hasPersonal}
                  className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                    sourceMode === "personal"
                      ? "border-[#c41e1e] bg-[#c41e1e] text-[#f5ede0] shadow-md"
                      : "border-white/[0.15] bg-white/[0.06] text-[#f5ede0]/70 hover:border-white/[0.30]"
                  } ${!hasPersonal ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  Ma collection
                  {!hasPersonal && <div className="text-[10px] font-normal">(min. 6)</div>}
                </button>
                <button
                  onClick={() => setSourceMode("n5")}
                  className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                    sourceMode === "n5"
                      ? "border-[#c41e1e] bg-[#c41e1e] text-[#f5ede0] shadow-md"
                      : "border-white/[0.15] bg-white/[0.06] text-[#f5ede0]/70 hover:border-white/[0.30]"
                  }`}
                >
                  <div>N5</div>
                  <div className="text-[10px] font-normal opacity-80">{JLPT_N5.length} kanjis</div>
                </button>
                <button
                  onClick={() => setSourceMode("n4")}
                  className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                    sourceMode === "n4"
                      ? "border-[#c41e1e] bg-[#c41e1e] text-[#f5ede0] shadow-md"
                      : "border-white/[0.15] bg-white/[0.06] text-[#f5ede0]/70 hover:border-white/[0.30]"
                  }`}
                >
                  <div>N4</div>
                  <div className="text-[10px] font-normal opacity-80">{JLPT_N4.length} kanjis</div>
                </button>
                <button
                  onClick={() => setSourceMode("n5n4")}
                  className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                    sourceMode === "n5n4"
                      ? "border-[#c41e1e] bg-[#c41e1e] text-[#f5ede0] shadow-md"
                      : "border-white/[0.15] bg-white/[0.06] text-[#f5ede0]/70 hover:border-white/[0.30]"
                  }`}
                >
                  <div>N5+N4</div>
                  <div className="text-[10px] font-normal opacity-80">{ALL_JLPT_KANJI.length} kanjis</div>
                </button>
              </div>
            </div>

            {/* Difficulté */}
            <div>
              <p className="text-xs font-semibold text-[#f5ede0]/50 uppercase tracking-wide mb-2 text-center">
                Nombre de paires
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PAIRS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPairsCount(n)}
                    className={`py-2.5 rounded-2xl text-sm font-semibold border-2 transition-all ${
                      pairsCount === n
                        ? "border-[#c41e1e] bg-[#c41e1e] text-[#f5ede0]"
                        : "border-white/[0.15] bg-white/[0.06] text-[#f5ede0]/70 hover:border-white/[0.30]"
                    }`}
                  >
                    {n} paires
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 rounded-2xl bg-[#c41e1e] text-[#f5ede0] font-bold text-lg shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Jouer
          </button>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Résultat
  // ----------------------------------------------------------------
  if (phase === "result") {
    const finalScore = computeScore();
    return (
      <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex flex-col">
        <header className="bg-black/30 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden border border-white/10"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-[#f5ede0]">Résultat</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
          <div className="bg-white/[0.04] rounded-3xl border border-white/[0.08] px-8 py-8 text-center w-full max-w-sm space-y-3">
            <div className="text-5xl">{finalScore >= 80 ? "🏆" : finalScore >= 50 ? "⭐" : "🌱"}</div>
            <div className="text-4xl font-black text-[#c9a84c]">{finalScore} pts</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-[#f5ede0]/60 pt-2">
              <div className="bg-white/[0.04] rounded-xl py-2 border border-white/[0.08]">
                <div className="font-bold text-lg text-[#f5ede0]">{moves}</div>
                <div className="text-xs text-[#f5ede0]/40">coups</div>
              </div>
              <div className="bg-white/[0.04] rounded-xl py-2 border border-white/[0.08]">
                <div className="font-bold text-lg text-[#f5ede0]">{formatTime(elapsedSec)}</div>
                <div className="text-xs text-[#f5ede0]/40">temps</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => setPhase("menu")}
              className="flex-1 py-3 rounded-2xl bg-white/[0.04] border-2 border-white/[0.15] text-[#f5ede0]/70 font-semibold hover:border-white/[0.30] transition-colors"
            >
              Rejouer
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-2xl bg-[#c41e1e] text-[#f5ede0] font-semibold text-center hover:bg-[#c41e1e]/80 transition-colors"
            >
              Menu
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Jeu
  // ----------------------------------------------------------------
  // Grille : 2 colonnes pour 6 paires (12 cartes), 3 pour 8/10
  const cols = pairsCount === 6 ? "grid-cols-4" : "grid-cols-4";

  return (
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex flex-col">
      <header className="bg-black/30 backdrop-blur-md border-b border-white/[0.08] px-4 py-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden border border-white/10"
        >
          <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
        </Link>
        <div className="flex gap-4 text-sm font-semibold text-[#f5ede0]/70">
          <span>🃏 {matchedCount}/{pairsCount}</span>
          <span>🕐 {formatTime(elapsedSec)}</span>
          <span>🔄 {moves}</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className={`grid ${cols} gap-2 w-full max-w-sm`}>
          {cards.map((card) => {
            const isFlipped = card.flipped || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                disabled={isFlipped || locked}
                className={`aspect-square rounded-2xl text-center flex items-center justify-center transition-all duration-300 font-semibold shadow-sm border-2 ${
                  card.matched
                    ? "border-[#c9a84c]/40 bg-[#c9a84c]/10 text-[#c9a84c]"
                    : isFlipped
                    ? card.type === "kanji"
                      ? "border-white/[0.20] bg-white/[0.08] text-[#f5ede0] text-2xl"
                      : "border-white/[0.15] bg-white/[0.06] text-[#f5ede0]/80 text-xs"
                    : "border-white/[0.10] bg-white/[0.04] hover:border-white/[0.25] hover:bg-white/[0.08] cursor-pointer"
                }`}
              >
                {isFlipped ? (
                  <span
                    className={
                      card.type === "kanji" ? "text-3xl font-bold" : "text-[11px] px-1 leading-tight"
                    }
                  >
                    {card.content}
                  </span>
                ) : (
                  <span className="text-[#f5ede0]/20 text-xl">?</span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
