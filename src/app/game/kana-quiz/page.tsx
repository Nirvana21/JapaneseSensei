"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ----------------------------------------------------------------
// Données kana
// ----------------------------------------------------------------
const HIRAGANA: [string, string][] = [
  ["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"],
  ["か","ka"],["き","ki"],["く","ku"],["け","ke"],["こ","ko"],
  ["さ","sa"],["し","shi"],["す","su"],["せ","se"],["そ","so"],
  ["た","ta"],["ち","chi"],["つ","tsu"],["て","te"],["と","to"],
  ["な","na"],["に","ni"],["ぬ","nu"],["ね","ne"],["の","no"],
  ["は","ha"],["ひ","hi"],["ふ","fu"],["へ","he"],["ほ","ho"],
  ["ま","ma"],["み","mi"],["む","mu"],["め","me"],["も","mo"],
  ["や","ya"],["ゆ","yu"],["よ","yo"],
  ["ら","ra"],["り","ri"],["る","ru"],["れ","re"],["ろ","ro"],
  ["わ","wa"],["を","wo"],["ん","n"],
];

const KATAKANA: [string, string][] = [
  ["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"],
  ["カ","ka"],["キ","ki"],["ク","ku"],["ケ","ke"],["コ","ko"],
  ["サ","sa"],["シ","shi"],["ス","su"],["セ","se"],["ソ","so"],
  ["タ","ta"],["チ","chi"],["ツ","tsu"],["テ","te"],["ト","to"],
  ["ナ","na"],["ニ","ni"],["ヌ","nu"],["ネ","ne"],["ノ","no"],
  ["ハ","ha"],["ヒ","hi"],["フ","fu"],["ヘ","he"],["ホ","ho"],
  ["マ","ma"],["ミ","mi"],["ム","mu"],["メ","me"],["モ","mo"],
  ["ヤ","ya"],["ユ","yu"],["ヨ","yo"],
  ["ラ","ra"],["リ","ri"],["ル","ru"],["レ","re"],["ロ","ro"],
  ["ワ","wa"],["ヲ","wo"],["ン","n"],
];

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type KanaSet = "hiragana" | "katakana" | "both";
type Phase = "menu" | "playing" | "result";

interface Question {
  kana: string;
  correct: string;
  options: string[];
}

// ----------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------
const QUESTIONS_COUNT = 20;
const TIME_PER_QUESTION = 8;

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPool(set: KanaSet): [string, string][] {
  if (set === "hiragana") return HIRAGANA;
  if (set === "katakana") return KATAKANA;
  return [...HIRAGANA, ...KATAKANA];
}

function buildQuestion(pool: [string, string][]): Question {
  const idx = Math.floor(Math.random() * pool.length);
  const [kana, correct] = pool[idx];
  // 3 distracteurs uniques différents de la bonne réponse
  const allRomaji = [...new Set(pool.map(([, r]) => r))].filter((r) => r !== correct);
  const others = shuffle(allRomaji).slice(0, 3);
  return { kana, correct, options: shuffle([correct, ...others]) };
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------
export default function KanaQuizPage() {
  const [kanaSet, setKanaSet] = useState<KanaSet>("hiragana");
  const [phase, setPhase] = useState<Phase>("menu");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (feedbackRef.current) { clearTimeout(feedbackRef.current); feedbackRef.current = null; }
  }, []);

  const nextQuestion = useCallback(
    (wasCorrect: boolean) => {
      clearTimer();
      setResults((r) => [...r, wasCorrect]);

      if (wasCorrect) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((bs) => Math.max(bs, ns));
          return ns;
        });
      } else {
        setStreak(0);
      }

      setCurrent((prev) => {
        const next = prev + 1;
        if (next >= QUESTIONS_COUNT) {
          setPhase("result");
          return prev;
        }
        return next;
      });
      setSelected(null);
      setFeedback(null);
      setTimeLeft(TIME_PER_QUESTION);
    },
    [clearTimer]
  );

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selected !== null) return;
      const q = questions[current];
      const correct = answer === q.correct;
      setSelected(answer);
      setFeedback(correct ? "correct" : "wrong");
      feedbackRef.current = setTimeout(() => nextQuestion(correct), 700);
    },
    [selected, questions, current, nextQuestion]
  );

  // Timer
  useEffect(() => {
    if (phase !== "playing" || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer("__timeout__");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimer();
  }, [phase, current, selected, handleAnswer, clearTimer]);

  const startGame = () => {
    const pool = getPool(kanaSet);
    const qs = Array.from({ length: QUESTIONS_COUNT }, () => buildQuestion(pool));
    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setResults([]);
    setSelected(null);
    setFeedback(null);
    setTimeLeft(TIME_PER_QUESTION);
    setPhase("playing");
  };

  // ----------------------------------------------------------------
  // Menu
  // ----------------------------------------------------------------
  if (phase === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 flex flex-col text-white">
        <header className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <Link href="/" className="w-8 h-8 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
            <img src="/sprites/logo_maison.png" alt="Accueil" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold">Kana Quiz</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8 py-8">
          <div className="text-center">
            <div className="text-7xl mb-4">🔤</div>
            <h2 className="text-3xl font-bold mb-2">Kana Quiz</h2>
            <p className="text-emerald-300 text-sm max-w-xs">
              Reconnais les hiragana et katakana. 20 questions, {TIME_PER_QUESTION} secondes par réponse.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center mb-1">
              Choisir un alphabet
            </p>
            {(
              [
                ["hiragana", "Hiragana", "あ", "46 caractères de base"],
                ["katakana", "Katakana", "ア", "46 caractères de base"],
                ["both", "Les deux", "あア", "92 caractères mélangés"],
              ] as [KanaSet, string, string, string][]
            ).map(([key, label, sample, hint]) => (
              <button
                key={key}
                onClick={() => setKanaSet(key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-colors ${
                  kanaSet === key
                    ? "bg-emerald-500/30 border-emerald-400 text-white"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white/80"
                }`}
              >
                <span className="text-2xl w-10 text-center">{sample}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs opacity-60">{hint}</p>
                </div>
                {kanaSet === key && (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400" fill="none" strokeWidth={2.5}>
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-xl transition-all"
          >
            Commencer →
          </button>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Résultat
  // ----------------------------------------------------------------
  if (phase === "result") {
    const pct = Math.round((score / QUESTIONS_COUNT) * 100);
    const grade =
      pct >= 90
        ? { text: "Excellent !", emoji: "🏆", color: "text-yellow-400" }
        : pct >= 70
        ? { text: "Bien joué !", emoji: "⭐", color: "text-emerald-400" }
        : pct >= 50
        ? { text: "Pas mal !", emoji: "👍", color: "text-blue-400" }
        : { text: "Continue !", emoji: "💪", color: "text-rose-400" };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 flex flex-col text-white">
        <header className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <Link href="/" className="w-8 h-8 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
            <img src="/sprites/logo_maison.png" alt="Accueil" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold">Résultats</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center">
            <div className="text-6xl mb-3">{grade.emoji}</div>
            <h2 className={`text-2xl font-bold mb-1 ${grade.color}`}>{grade.text}</h2>
            <p className="text-6xl font-black my-4">
              {score}
              <span className="text-2xl text-slate-400">/{QUESTIONS_COUNT}</span>
            </p>
            <p className="text-slate-400 text-sm">
              {pct}% de réussite · Meilleur combo : {bestStreak}
            </p>
          </div>

          {/* Dots résultats */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
            {results.map((r, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full ${r ? "bg-emerald-400" : "bg-red-400"}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold rounded-2xl transition-all"
            >
              Rejouer
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-colors"
            >
              Accueil
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Jeu
  // ----------------------------------------------------------------
  const q = questions[current];
  if (!q) return null;

  const timerPct = (timeLeft / TIME_PER_QUESTION) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 flex flex-col text-white">
      {/* Header / timer */}
      <header className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">
            {current + 1} / {QUESTIONS_COUNT}
          </span>
          <span className="text-sm font-bold text-emerald-400">{score} pts</span>
          <span className={`text-xs font-bold ${timeLeft <= 3 ? "text-red-400 animate-pulse" : "text-slate-400"}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft <= 3 ? "bg-red-500" : "bg-emerald-400"
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
        {streak > 1 && (
          <p className="text-center text-xs text-amber-400 font-bold mt-1">🔥 Combo ×{streak}</p>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Kana affiché */}
        <div
          className={`text-9xl font-bold select-none transition-all duration-150 ${
            feedback === "correct"
              ? "text-emerald-400 scale-110"
              : feedback === "wrong"
              ? "text-red-400 scale-95 opacity-70"
              : "text-white"
          }`}
        >
          {q.kana}
        </div>

        <p className="text-slate-400 text-sm -mt-4">Quelle est la lecture de ce kana ?</p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {q.options.map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = opt === q.correct;
            let cls =
              "border-white/15 text-white/90 hover:border-emerald-400 hover:bg-emerald-500/10";
            if (selected !== null) {
              if (isCorrect)
                cls = "border-emerald-400 bg-emerald-500/30 text-emerald-300";
              else if (isSelected)
                cls = "border-red-400 bg-red-500/30 text-red-300";
              else
                cls = "border-white/10 text-white/30";
            }
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={selected !== null}
                className={`py-4 rounded-2xl border text-xl font-bold transition-all active:scale-95 ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
