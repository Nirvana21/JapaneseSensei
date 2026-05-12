"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useKanjis } from "../../../hooks/useKanjis";
import { ALL_JLPT_KANJI } from "../../../data/jlptData";
import {
  simpleAdaptiveLearningService,
} from "../../../services/adaptiveLearningService";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type SourceMode = "personal" | "jlpt";
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

  const [sourceMode, setSourceMode] = useState<SourceMode>("jlpt");
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

    if (sourceMode === "jlpt") {
      pairs = ALL_JLPT_KANJI.map((k) => ({
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur border-b border-emerald-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-emerald-900">Mémory</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🃏</div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Mémory rapide</h2>
            <p className="text-emerald-700 text-sm">
              Associe chaque <strong>kanji</strong> à son <strong>sens</strong>.
              Retourne deux cartes à la fois — trouve toutes les paires avec le moins de coups possible !
            </p>
          </div>

          {/* Source */}
          <div className="w-full max-w-xs space-y-4">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 text-center">
                Source
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSourceMode("personal")}
                  disabled={!hasPersonal}
                  className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                    sourceMode === "personal"
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md"
                      : "border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400"
                  } ${!hasPersonal ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  Ma collection
                  {!hasPersonal && <div className="text-[10px] font-normal">(min. 6)</div>}
                </button>
                <button
                  onClick={() => setSourceMode("jlpt")}
                  className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                    sourceMode === "jlpt"
                      ? "border-teal-500 bg-teal-500 text-white shadow-md"
                      : "border-teal-200 bg-white text-teal-700 hover:border-teal-400"
                  }`}
                >
                  JLPT N5/N4
                </button>
              </div>
            </div>

            {/* Difficulté */}
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 text-center">
                Nombre de paires
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PAIRS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPairsCount(n)}
                    className={`py-2.5 rounded-2xl text-sm font-semibold border-2 transition-all ${
                      pairsCount === n
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400"
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
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur border-b border-emerald-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-emerald-900">Résultat</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
          <div className="bg-white rounded-3xl shadow-xl px-8 py-8 text-center w-full max-w-sm space-y-3">
            <div className="text-5xl">{finalScore >= 80 ? "🏆" : finalScore >= 50 ? "⭐" : "🌱"}</div>
            <div className="text-4xl font-black text-emerald-900">{finalScore} pts</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-emerald-700 pt-2">
              <div className="bg-emerald-50 rounded-xl py-2">
                <div className="font-bold text-lg">{moves}</div>
                <div className="text-xs text-emerald-500">coups</div>
              </div>
              <div className="bg-teal-50 rounded-xl py-2">
                <div className="font-bold text-lg">{formatTime(elapsedSec)}</div>
                <div className="text-xs text-teal-500">temps</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => setPhase("menu")}
              className="flex-1 py-3 rounded-2xl bg-white border-2 border-emerald-200 text-emerald-700 font-semibold hover:border-emerald-400 transition-colors"
            >
              Rejouer
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-semibold text-center hover:bg-emerald-600 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur border-b border-emerald-100 px-4 py-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden bg-amber-100"
        >
          <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
        </Link>
        <div className="flex gap-4 text-sm font-semibold text-emerald-800">
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
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : isFlipped
                    ? card.type === "kanji"
                      ? "border-teal-300 bg-teal-50 text-teal-900 text-2xl"
                      : "border-blue-200 bg-blue-50 text-blue-800 text-xs"
                    : "border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
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
                  <span className="text-emerald-300 text-xl">?</span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
