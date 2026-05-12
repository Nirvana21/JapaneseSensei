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
type GamePhase = "menu" | "loading" | "playing" | "result";

interface Blank {
  index: number;
  answer: string;   // le mot japonais attendu
  meaning: string;  // sens fr, pour l'aide
  options: string[];
}

interface Story {
  title: string;
  segments: string[];  // texte entre les blancs
  blanks: Blank[];
  translation: string;
}

// ----------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------
const BLANKS_COUNT = 4;

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
export default function HistoireATrousPage() {
  const { kanjis } = useKanjis();

  const [sourceMode, setSourceMode] = useState<SourceMode>("jlpt");
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // ----------------------------------------------------------------
  // Générer l'histoire via l'API
  // ----------------------------------------------------------------
  const generateStory = useCallback(async () => {
    setError(null);
    setPhase("loading");

    try {
      // Construire la liste de kanjis/mots à utiliser
      let wordPool: Array<{ word: string; meaning: string }> = [];

      if (sourceMode === "jlpt") {
        wordPool = ALL_JLPT_KANJI.flatMap((k) =>
          k.examples.slice(0, 1).map((ex) => ({
            word: ex.word,
            meaning: ex.meaning,
          }))
        );
      } else {
        const lk = kanjis.map((k) =>
          simpleAdaptiveLearningService.initializeLearningData(k)
        );
        wordPool = lk
          .filter((k) => k.kanji)
          .map((k) => ({
            word: k.kanji,
            meaning: k.meanings?.[0] ?? "",
          }));
      }

      if (wordPool.length < BLANKS_COUNT) {
        setError("Pas assez de kanjis disponibles pour générer une histoire.");
        setPhase("menu");
        return;
      }

      // Sélectionner BLANKS_COUNT mots aléatoires
      const selected = shuffleArray(wordPool).slice(0, BLANKS_COUNT);
      const allWords = wordPool.map((w) => w.word);

      // Appeler l'API de génération
      const response = await fetch("/api/stories/fill-blanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: selected, allWords }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.story) {
        throw new Error("Réponse invalide de l'API");
      }

      setStory(data.story);
      setUserAnswers({});
      setSubmitted(false);
      setScore(0);
      setPhase("playing");
    } catch (err) {
      console.error(err);
      setError(
        "Impossible de générer l'histoire pour l'instant. Vérifie ta connexion."
      );
      setPhase("menu");
    }
  }, [sourceMode, kanjis]);

  // ----------------------------------------------------------------
  // Sélectionner une réponse
  // ----------------------------------------------------------------
  const selectAnswer = (blankIndex: number, answer: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [blankIndex]: answer }));
  };

  // ----------------------------------------------------------------
  // Valider
  // ----------------------------------------------------------------
  const submitAnswers = () => {
    if (!story) return;
    let correct = 0;
    story.blanks.forEach((blank) => {
      if (userAnswers[blank.index] === blank.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    setPhase("result");
  };

  const allAnswered =
    story !== null &&
    story.blanks.every((b) => userAnswers[b.index] !== undefined);

  // ----------------------------------------------------------------
  // Menu
  // ----------------------------------------------------------------
  if (phase === "menu" || phase === "loading") {
    const hasPersonal = kanjis.length >= BLANKS_COUNT;
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur border-b border-amber-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-amber-900">Histoire à trous</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
          {phase === "loading" ? (
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">✍️</div>
              <p className="text-amber-800 font-semibold">
                Le Sensei écrit une histoire pour toi...
              </p>
              <p className="text-amber-600 text-sm mt-1">
                Quelques secondes de patience !
              </p>
            </div>
          ) : (
            <>
              <div className="text-center max-w-sm">
                <div className="text-5xl mb-4">📖</div>
                <h2 className="text-2xl font-bold text-amber-900 mb-2">
                  Histoire à trous
                </h2>
                <p className="text-amber-700 text-sm">
                  Le Sensei génère une <strong>mini-histoire</strong> en japonais avec des mots manquants.
                  À toi de compléter les {BLANKS_COUNT} trous avec les bons mots !
                </p>
              </div>

              {error && (
                <div className="w-full max-w-xs bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="w-full max-w-xs">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 text-center">
                  Source
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSourceMode("personal")}
                    disabled={!hasPersonal}
                    className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                      sourceMode === "personal"
                        ? "border-amber-500 bg-amber-500 text-white shadow-md"
                        : "border-amber-200 bg-white text-amber-700 hover:border-amber-400"
                    } ${!hasPersonal ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    Ma collection
                    {!hasPersonal && (
                      <div className="text-[10px] font-normal">
                        (min. {BLANKS_COUNT})
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
                    JLPT N5/N4
                  </button>
                </div>
              </div>

              <button
                onClick={generateStory}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Générer une histoire
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Résultat
  // ----------------------------------------------------------------
  if (phase === "result" && story) {
    const pct = Math.round((score / story.blanks.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur border-b border-amber-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100"
          >
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-amber-900">Résultat</h1>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 py-6 gap-5">
          {/* Score */}
          <div className="bg-white rounded-3xl shadow-xl px-8 py-6 text-center w-full max-w-sm">
            <div className="text-5xl mb-3">{pct === 100 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
            <div className="text-4xl font-black text-amber-900">{score}/{story.blanks.length}</div>
            <div className="text-sm text-amber-600 mt-1">
              bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
            </div>
          </div>

          {/* Correction */}
          <div className="w-full max-w-sm space-y-2">
            {story.blanks.map((blank) => {
              const given = userAnswers[blank.index];
              const correct = given === blank.answer;
              return (
                <div
                  key={blank.index}
                  className={`px-4 py-3 rounded-2xl border-2 ${
                    correct
                      ? "border-green-300 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">
                      {blank.answer}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        correct ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {correct ? "✓ Correct" : `✗ tu as mis : ${given ?? "—"}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{blank.meaning}</div>
                </div>
              );
            })}
          </div>

          {/* Traduction */}
          {story.translation && (
            <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-600 mb-1">Traduction :</p>
              <p className="text-sm text-amber-800">{story.translation}</p>
            </div>
          )}

          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => {
                setPhase("menu");
                setStory(null);
              }}
              className="flex-1 py-3 rounded-2xl bg-white border-2 border-amber-200 text-amber-700 font-semibold hover:border-amber-400 transition-colors"
            >
              Nouvelle histoire
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-semibold text-center hover:bg-amber-600 transition-colors"
            >
              Menu
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Jeu — histoire avec blancs
  // ----------------------------------------------------------------
  if (!story) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur border-b border-amber-100 px-4 py-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden bg-amber-100"
        >
          <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
        </Link>
        <h2 className="text-sm font-bold text-amber-900 truncate max-w-[60%]">
          {story.title}
        </h2>
        <span className="text-xs text-amber-500">
          {Object.keys(userAnswers).length}/{story.blanks.length}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Histoire avec les blancs */}
        <div className="bg-white rounded-2xl shadow p-5 leading-8 text-base text-gray-800">
          {story.segments.map((seg, i) => (
            <span key={i}>
              <span>{seg}</span>
              {i < story.blanks.length && (
                <span
                  className={`inline-flex items-center justify-center min-w-[60px] px-2 py-0.5 rounded-lg border-b-2 font-bold mx-1 transition-colors ${
                    userAnswers[story.blanks[i].index] !== undefined
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-dashed border-gray-300 text-gray-400"
                  }`}
                >
                  {userAnswers[story.blanks[i].index] ?? "___"}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Options pour chaque blanc */}
        <div className="space-y-4">
          {story.blanks.map((blank) => (
            <div key={blank.index}>
              <p className="text-xs font-semibold text-amber-600 mb-2">
                Trou {blank.index + 1} — <span className="font-normal text-amber-500">{blank.meaning}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {blank.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(blank.index, opt)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      userAnswers[blank.index] === opt
                        ? "border-amber-400 bg-amber-100 text-amber-900"
                        : "border-amber-200 bg-white text-amber-800 hover:border-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bouton valider */}
        <button
          onClick={submitAnswers}
          disabled={!allAnswered}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            allAnswered
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:-translate-y-0.5 active:scale-95"
              : "bg-amber-100 text-amber-400 cursor-not-allowed"
          }`}
        >
          Valider mes réponses
        </button>
      </main>
    </div>
  );
}
