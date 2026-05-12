"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useKanjis } from "../../../hooks/useKanjis";
import { ALL_JLPT_KANJI, JLPTKanjiData } from "../../../data/jlptData";
import {
  simpleAdaptiveLearningService,
  SimpleLearningKanji,
} from "../../../services/adaptiveLearningService";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type SourceMode = "personal" | "jlpt";
type GamePhase = "menu" | "playing" | "result";

interface Question {
  kanji: string;
  correctAnswer: string;
  options: string[];
}

// ----------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------
const TIME_PER_QUESTION = 8; // secondes
const QUESTIONS_PER_ROUND = 15;

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

function buildPersonalQuestion(
  kanji: SimpleLearningKanji,
  allKanjis: SimpleLearningKanji[]
): Question | null {
  if (!kanji.meanings || kanji.meanings.length === 0) return null;
  const correct = kanji.meanings[0];

  const distractors = shuffleArray(
    allKanjis
      .filter((k) => k.id !== kanji.id && k.meanings && k.meanings.length > 0)
      .map((k) => k.meanings[0])
  ).slice(0, 3);

  if (distractors.length < 3) return null;

  return {
    kanji: kanji.kanji,
    correctAnswer: correct,
    options: shuffleArray([correct, ...distractors]),
  };
}

function buildJlptQuestion(
  kanji: JLPTKanjiData,
  allKanjis: JLPTKanjiData[]
): Question | null {
  if (!kanji.meanings || kanji.meanings.length === 0) return null;
  const correct = kanji.meanings[0];

  const distractors = shuffleArray(
    allKanjis
      .filter((k) => k.kanji !== kanji.kanji && k.meanings.length > 0)
      .map((k) => k.meanings[0])
  ).slice(0, 3);

  if (distractors.length < 3) return null;

  return {
    kanji: kanji.kanji,
    correctAnswer: correct,
    options: shuffleArray([correct, ...distractors]),
  };
}

// ----------------------------------------------------------------
// Composant principal
// ----------------------------------------------------------------
export default function SpeedMatchPage() {
  const { kanjis } = useKanjis();

  const [sourceMode, setSourceMode] = useState<SourceMode>("personal");
  const [phase, setPhase] = useState<GamePhase>("menu");

  // Session
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<Array<{ kanji: string; correct: boolean }>>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ----------------------------------------------------------------
  // Générer les questions
  // ----------------------------------------------------------------
  const generateQuestions = useCallback(() => {
    let qs: Question[] = [];

    if (sourceMode === "personal") {
      const learningKanjis = kanjis.map((k) =>
        simpleAdaptiveLearningService.initializeLearningData(k)
      );
      if (learningKanjis.length < 4) return null;
      const pool = shuffleArray(learningKanjis).slice(0, QUESTIONS_PER_ROUND);
      for (const k of pool) {
        const q = buildPersonalQuestion(k, learningKanjis);
        if (q) qs.push(q);
      }
    } else {
      if (ALL_JLPT_KANJI.length < 4) return null;
      const pool = shuffleArray(ALL_JLPT_KANJI).slice(0, QUESTIONS_PER_ROUND);
      for (const k of pool) {
        const q = buildJlptQuestion(k, ALL_JLPT_KANJI);
        if (q) qs.push(q);
      }
    }

    return qs.slice(0, QUESTIONS_PER_ROUND);
  }, [sourceMode, kanjis]);

  // ----------------------------------------------------------------
  // Timer
  // ----------------------------------------------------------------
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Temps écoulé → mauvaise réponse
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  // Quand le temps tombe à 0 → traiter comme mauvaise réponse
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft === 0 && selectedAnswer === null) {
      handleAnswer(null);
    }
  }, [timeLeft, phase]);

  // ----------------------------------------------------------------
  // Démarrer la partie
  // ----------------------------------------------------------------
  const startGame = () => {
    const qs = generateQuestions();
    if (!qs || qs.length === 0) return;
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setResults([]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setPhase("playing");
  };

  // Démarrer le timer quand la question change
  useEffect(() => {
    if (phase === "playing") {
      startTimer();
    }
    return () => clearTimer();
  }, [currentQ, phase]);

  // ----------------------------------------------------------------
  // Gérer la réponse
  // ----------------------------------------------------------------
  const handleAnswer = useCallback(
    (answer: string | null) => {
      if (selectedAnswer !== null) return; // déjà répondu
      clearTimer();

      const q = questions[currentQ];
      if (!q) return;

      const correct = answer === q.correctAnswer;
      setSelectedAnswer(answer ?? "__timeout__");
      setIsCorrect(correct);

      const newStreak = correct ? streak + 1 : 0;
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));

      // Bonus de combo
      const bonus = Math.floor(newStreak / 3);
      if (correct) setScore((prev) => prev + 1 + bonus);

      setResults((prev) => [...prev, { kanji: q.kanji, correct }]);

      // Passer à la suivante après 900ms
      setTimeout(() => {
        const next = currentQ + 1;
        if (next >= questions.length) {
          setPhase("result");
        } else {
          setCurrentQ(next);
          setSelectedAnswer(null);
          setIsCorrect(null);
        }
      }, 900);
    },
    [questions, currentQ, selectedAnswer, streak, clearTimer]
  );

  // Cleanup
  useEffect(() => () => clearTimer(), [clearTimer]);

  // ----------------------------------------------------------------
  // Rendu — Menu
  // ----------------------------------------------------------------
  if (phase === "menu") {
    const hasPersonal = kanjis.length >= 4;
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur border-b border-indigo-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-indigo-900">Speed Match</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
          {/* Description */}
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">Speed Match</h2>
            <p className="text-indigo-700 text-sm">
              Un kanji apparaît. Tu as <strong>{TIME_PER_QUESTION}s</strong> pour choisir le bon sens parmi 4 propositions.
              Enchaîne les bonnes réponses pour des points bonus !
            </p>
          </div>

          {/* Source */}
          <div className="w-full max-w-xs">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2 text-center">
              Source des kanjis
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSourceMode("personal")}
                disabled={!hasPersonal}
                className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  sourceMode === "personal"
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-md"
                    : "border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400"
                } ${!hasPersonal ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div>Ma collection</div>
                {!hasPersonal && (
                  <div className="text-[10px] mt-0.5 font-normal">
                    (min. 4 kanjis)
                  </div>
                )}
              </button>
              <button
                onClick={() => setSourceMode("jlpt")}
                className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  sourceMode === "jlpt"
                    ? "border-teal-500 bg-teal-500 text-white shadow-md"
                    : "border-teal-200 bg-white text-teal-700 hover:border-teal-400"
                }`}
              >
                <div>JLPT N5/N4</div>
                <div className="text-[10px] mt-0.5 font-normal opacity-80">
                  {ALL_JLPT_KANJI.length} kanjis
                </div>
              </button>
            </div>
          </div>

          {/* Lancer */}
          <button
            onClick={startGame}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Jouer — {QUESTIONS_PER_ROUND} questions
          </button>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Rendu — Résultat
  // ----------------------------------------------------------------
  if (phase === "result") {
    const pct = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur border-b border-indigo-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-indigo-900">Speed Match — Résultat</h1>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 py-8 gap-6">
          {/* Score principal */}
          <div className="bg-white rounded-3xl shadow-xl px-8 py-6 text-center w-full max-w-sm">
            <div className="text-5xl mb-3">
              {pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}
            </div>
            <div className="text-4xl font-black text-indigo-900 mb-1">
              {score} pts
            </div>
            <div className="text-sm text-indigo-600">
              {results.filter((r) => r.correct).length}/{results.length} correctes ({pct}%)
            </div>
            <div className="mt-3 text-sm text-indigo-700">
              Meilleure série : <strong>{bestStreak}</strong>
            </div>
          </div>

          {/* Détails des questions */}
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
                <span className="font-bold text-lg">{r.kanji}</span>
                <span>{r.correct ? "✓ Correct" : "✗ Raté"}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => setPhase("menu")}
              className="flex-1 py-3 rounded-2xl bg-white border-2 border-indigo-200 text-indigo-700 font-semibold hover:border-indigo-400 transition-colors"
            >
              Rejouer
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-semibold text-center hover:bg-indigo-600 transition-colors"
            >
              Menu
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Rendu — Jeu en cours
  // ----------------------------------------------------------------
  const q = questions[currentQ];
  if (!q) return null;

  const progress = ((currentQ) / questions.length) * 100;
  const timerPct = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor =
    timeLeft <= 3
      ? "bg-red-500"
      : timeLeft <= 5
      ? "bg-amber-400"
      : "bg-indigo-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex flex-col">
      {/* Header compact */}
      <header className="bg-white/80 backdrop-blur border-b border-indigo-100 px-4 py-2 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors"
        >
          <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold text-indigo-800">
          <span>⚡ {score} pts</span>
          {streak >= 2 && (
            <span className="text-amber-600 text-xs bg-amber-100 px-2 py-0.5 rounded-full">
              🔥 ×{streak}
            </span>
          )}
        </div>
        <span className="text-xs text-indigo-500">
          {currentQ + 1}/{questions.length}
        </span>
      </header>

      {/* Barre de progression */}
      <div className="h-1.5 bg-indigo-100">
        <div
          className="h-full bg-indigo-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-between px-4 py-6 gap-4">
        {/* Timer */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-indigo-500 mb-1">
            <span>Temps restant</span>
            <span className={timeLeft <= 3 ? "text-red-600 font-bold" : ""}>{timeLeft}s</span>
          </div>
          <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        </div>

        {/* Kanji central */}
        <div
          className={`flex items-center justify-center w-44 h-44 rounded-3xl shadow-xl text-7xl font-bold transition-all duration-200 ${
            isCorrect === null
              ? "bg-white text-indigo-900"
              : isCorrect
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {q.kanji}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {q.options.map((opt) => {
            let cls =
              "py-4 px-3 rounded-2xl text-sm font-semibold border-2 transition-all active:scale-95 ";

            if (selectedAnswer !== null) {
              if (opt === q.correctAnswer) {
                cls += "border-green-400 bg-green-100 text-green-800";
              } else if (opt === selectedAnswer && !isCorrect) {
                cls += "border-red-400 bg-red-100 text-red-800";
              } else {
                cls += "border-gray-200 bg-gray-50 text-gray-400";
              }
            } else {
              cls += "border-indigo-200 bg-white text-indigo-800 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
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
        <div className="h-6 text-center text-sm font-semibold">
          {isCorrect === true && (
            <span className="text-green-600">
              {streak >= 3 ? `🔥 Combo ×${streak} !` : "✓ Correct !"}
            </span>
          )}
          {isCorrect === false && (
            <span className="text-red-600">
              ✗ {q.correctAnswer}
            </span>
          )}
        </div>
      </main>
    </div>
  );
}
