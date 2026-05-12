"use client";

import { useState, useCallback } from "react";
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

interface Question {
  word: string;
  reading: string;
  correctMeaning: string;
  options: string[];
  hint?: string;
}

// ----------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------
const QUESTIONS_PER_ROUND = 12;
const JLPT_WORDS = ALL_JLPT_KANJI.flatMap((k) =>
  k.examples.map((ex) => ({
    word: ex.word,
    reading: ex.reading,
    meaning: ex.meaning,
    kanji: k.kanji,
    hint: `Contient ${k.kanji} (${k.meanings[0]})`,
  }))
);

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

// ----------------------------------------------------------------
// Composant
// ----------------------------------------------------------------
export default function SensCachePage() {
  const { kanjis } = useKanjis();

  const [sourceMode, setSourceMode] = useState<SourceMode>("jlpt");
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [showHint, setShowHint] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [results, setResults] = useState<
    Array<{ word: string; correct: boolean; usedHint: boolean }>
  >([]);

  // ----------------------------------------------------------------
  // Générer les questions
  // ----------------------------------------------------------------
  const generateQuestions = useCallback((): Question[] => {
    if (sourceMode === "jlpt") {
      if (JLPT_WORDS.length < 4) return [];

      const pool = shuffleArray(JLPT_WORDS).slice(0, QUESTIONS_PER_ROUND);
      const allMeanings = JLPT_WORDS.map((w) => w.meaning);

      return pool
        .map((item) => {
          const distractors = shuffleArray(
            allMeanings.filter((m) => m !== item.meaning)
          ).slice(0, 3);
          if (distractors.length < 3) return null;
          return {
            word: item.word,
            reading: item.reading,
            correctMeaning: item.meaning,
            options: shuffleArray([item.meaning, ...distractors]),
            hint: item.hint,
          };
        })
        .filter(Boolean) as Question[];
    }

    // Source personnelle
    const learningKanjis = kanjis.map((k) =>
      simpleAdaptiveLearningService.initializeLearningData(k)
    );
    if (learningKanjis.length < 4) return [];

    const allMeanings = learningKanjis
      .flatMap((k) => k.meanings ?? [])
      .filter(Boolean);

    const pool = shuffleArray(learningKanjis).slice(0, QUESTIONS_PER_ROUND);
    return pool
      .map((k) => {
        const correct = k.meanings?.[0];
        if (!correct) return null;
        const distractors = shuffleArray(
          allMeanings.filter((m) => m !== correct)
        ).slice(0, 3);
        if (distractors.length < 3) return null;
        return {
          word: k.kanji,
          reading: k.onyomi?.[0] ?? k.kunyomi?.[0] ?? "",
          correctMeaning: correct,
          options: shuffleArray([correct, ...distractors]),
        };
      })
      .filter(Boolean) as Question[];
  }, [sourceMode, kanjis]);

  // ----------------------------------------------------------------
  // Démarrer
  // ----------------------------------------------------------------
  const startGame = () => {
    const qs = generateQuestions();
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setHintsUsed(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setResults([]);
    setPhase("playing");
  };

  // ----------------------------------------------------------------
  // Répondre
  // ----------------------------------------------------------------
  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    const q = questions[currentQ];
    const correct = answer === q.correctMeaning;
    const usedHint = showHint;

    setSelectedAnswer(answer);

    // +2 sans indice, +1 avec indice
    if (correct) setScore((s) => s + (usedHint ? 1 : 2));

    setResults((prev) => [...prev, { word: q.word, correct, usedHint }]);

    setTimeout(() => {
      const next = currentQ + 1;
      if (next >= questions.length) {
        setPhase("result");
      } else {
        setCurrentQ(next);
        setSelectedAnswer(null);
        setShowHint(false);
      }
    }, 900);
  };

  const handleHint = () => {
    setShowHint(true);
    setHintsUsed((h) => h + 1);
  };

  // ----------------------------------------------------------------
  // Menu
  // ----------------------------------------------------------------
  if (phase === "menu") {
    const hasPersonal = kanjis.length >= 4;
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur border-b border-violet-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-violet-900">Sens Caché</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-violet-900 mb-2">Sens Caché</h2>
            <p className="text-violet-700 text-sm">
              Un <strong>mot japonais</strong> s'affiche. Retrouve son sens parmi 4 propositions.
              Tu peux demander un <strong>indice</strong>, mais ça vaut moins de points !
            </p>
            <p className="text-xs text-violet-500 mt-2">
              Sans indice : +2 pts · Avec indice : +1 pt
            </p>
          </div>

          <div className="w-full max-w-xs">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2 text-center">
              Source
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSourceMode("personal")}
                disabled={!hasPersonal}
                className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  sourceMode === "personal"
                    ? "border-violet-500 bg-violet-500 text-white shadow-md"
                    : "border-violet-200 bg-white text-violet-700 hover:border-violet-400"
                } ${!hasPersonal ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                Ma collection
                {!hasPersonal && <div className="text-[10px] font-normal">(min. 4)</div>}
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

          <button
            onClick={startGame}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Jouer — {QUESTIONS_PER_ROUND} mots
          </button>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Résultat
  // ----------------------------------------------------------------
  if (phase === "result") {
    const correct = results.filter((r) => r.correct).length;
    const pct = Math.round((correct / results.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur border-b border-violet-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-violet-900">Résultat</h1>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 py-8 gap-6">
          <div className="bg-white rounded-3xl shadow-xl px-8 py-6 text-center w-full max-w-sm">
            <div className="text-5xl mb-3">
              {pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}
            </div>
            <div className="text-4xl font-black text-violet-900 mb-1">{score} pts</div>
            <div className="text-sm text-violet-600">
              {correct}/{results.length} correctes ({pct}%)
            </div>
            {hintsUsed > 0 && (
              <div className="text-xs text-violet-400 mt-2">
                {hintsUsed} indice{hintsUsed > 1 ? "s" : ""} utilisé{hintsUsed > 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div className="w-full max-w-sm space-y-1.5">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
                  r.correct
                    ? "bg-green-50 border border-green-200 text-green-900"
                    : "bg-red-50 border border-red-200 text-red-900"
                }`}
              >
                <span className="font-bold text-base">{r.word}</span>
                <div className="flex items-center gap-1.5">
                  {r.usedHint && (
                    <span className="text-[10px] text-violet-400">💡</span>
                  )}
                  <span>{r.correct ? "✓" : "✗"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => setPhase("menu")}
              className="flex-1 py-3 rounded-2xl bg-white border-2 border-violet-200 text-violet-700 font-semibold hover:border-violet-400 transition-colors"
            >
              Rejouer
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-2xl bg-violet-500 text-white font-semibold text-center hover:bg-violet-600 transition-colors"
            >
              Menu
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Jeu en cours
  // ----------------------------------------------------------------
  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-violet-100 px-4 py-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden bg-amber-100"
        >
          <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
        </Link>
        <div className="text-sm font-bold text-violet-800">{score} pts</div>
        <div className="text-xs text-violet-500">
          {currentQ + 1}/{questions.length}
        </div>
      </header>

      {/* Barre de progression */}
      <div className="h-1.5 bg-violet-100">
        <div
          className="h-full bg-violet-400 transition-all duration-300"
          style={{ width: `${(currentQ / questions.length) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-between px-4 py-6 gap-4">
        {/* Mot à deviner */}
        <div className="w-full max-w-xs text-center space-y-2">
          <div
            className={`inline-flex flex-col items-center justify-center w-52 h-40 rounded-3xl shadow-xl transition-colors ${
              selectedAnswer !== null
                ? selectedAnswer === q.correctMeaning
                  ? "bg-green-100"
                  : "bg-red-100"
                : "bg-white"
            }`}
          >
            <div className="text-5xl font-bold text-violet-900 mb-1">{q.word}</div>
            {q.reading && (
              <div className="text-sm text-violet-500">({q.reading})</div>
            )}
          </div>

          {/* Indice */}
          {showHint && q.hint ? (
            <div className="text-xs text-violet-600 bg-violet-100 rounded-xl px-3 py-1.5">
              💡 {q.hint}
            </div>
          ) : (
            !selectedAnswer && q.hint && (
              <button
                onClick={handleHint}
                className="text-xs text-violet-500 hover:text-violet-700 underline underline-offset-2"
              >
                Voir un indice (−1 pt possible)
              </button>
            )
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
          {q.options.map((opt) => {
            let cls =
              "w-full py-3.5 px-4 rounded-2xl text-sm font-semibold border-2 text-left transition-all active:scale-95 ";

            if (selectedAnswer !== null) {
              if (opt === q.correctMeaning) {
                cls += "border-green-400 bg-green-100 text-green-800";
              } else if (opt === selectedAnswer) {
                cls += "border-red-400 bg-red-100 text-red-800";
              } else {
                cls += "border-gray-100 bg-gray-50 text-gray-400";
              }
            } else {
              cls +=
                "border-violet-200 bg-white text-violet-800 hover:border-violet-400 hover:bg-violet-50 cursor-pointer";
            }

            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={selectedAnswer !== null}
                className={cls}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        <div className="h-5 text-center text-sm font-semibold">
          {selectedAnswer === q.correctMeaning && (
            <span className="text-green-600">✓ Correct !</span>
          )}
          {selectedAnswer !== null && selectedAnswer !== q.correctMeaning && (
            <span className="text-red-600">✗ C'était : {q.correctMeaning}</span>
          )}
        </div>
      </main>
    </div>
  );
}
