"use client";

import { useState, useEffect } from "react";
import MultiStrokeOrderViewer from "./MultiStrokeOrderViewer";
import { KanjiEntry } from "@/types/kanji";

interface KanjiDetailModalProps {
  kanji: KanjiEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function KanjiDetailModal({
  kanji,
  isOpen,
  onClose,
}: KanjiDetailModalProps) {
  const [showStrokeOrder, setShowStrokeOrder] = useState(true);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !kanji) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-orange-50/95 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-300/50">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-red-900">{kanji.kanji}</div>
            <div>
              <h2 className="text-xl font-bold text-red-800">
                漢字詳細 Détails du kanji
              </h2>
              <p className="text-orange-700 text-sm">
                完全情報 Informations complètes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-orange-600 hover:text-red-700 hover:bg-orange-200/50 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Significations */}
          <div className="bg-red-100/80 rounded-xl p-4 border border-red-300">
            <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
              <span>🌟</span>
              <span>意味 Significations</span>
            </h3>
            <div className="space-y-2">
              <p className="text-xl font-bold text-red-900">
                {kanji.primaryMeaning || kanji.meanings[0]}
              </p>
              {kanji.meanings.length > 1 && (
                <p className="text-red-700 text-sm">
                  他の意味 Autres significations :{" "}
                  {kanji.meanings.slice(1).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Lectures */}
          {((kanji.onyomi && kanji.onyomi.length > 0) ||
            (kanji.kunyomi && kanji.kunyomi.length > 0)) && (
            <div className="bg-orange-100/80 rounded-xl p-4 border border-orange-300">
              <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                <span>🗣️</span>
                <span>読み方 Lectures</span>
              </h3>
              <div className="space-y-3">
                {kanji.onyomi && kanji.onyomi.length > 0 && (
                  <div>
                    <p className="text-orange-700 text-sm mb-1">
                      音読み On'yomi (lecture chinoise) :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {kanji.onyomi.map((reading: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-200 text-orange-800 rounded-lg text-sm font-medium border border-orange-300"
                        >
                          {reading}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {kanji.kunyomi && kanji.kunyomi.length > 0 && (
                  <div>
                    <p className="text-orange-700 text-sm mb-1">
                      訓読み Kun'yomi (lecture japonaise) :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {kanji.kunyomi.map((reading: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-amber-200 text-amber-800 rounded-lg text-sm font-medium border border-amber-300"
                        >
                          {reading}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ordre des traits */}
          <div className="bg-amber-100/80 rounded-xl p-4 border border-amber-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                <span>✏️</span>
                <span>筆順 Ordre des traits</span>
              </h3>
              <button
                onClick={() => setShowStrokeOrder(!showStrokeOrder)}
                className="px-3 py-1 bg-amber-200 text-amber-800 rounded-lg text-sm hover:bg-amber-300 transition-colors"
              >
                {showStrokeOrder ? "隠す Masquer" : "表示 Afficher"}
              </button>
            </div>
            {showStrokeOrder && (
              <div className="flex justify-center">
                <div className="bg-orange-200/50 rounded-lg p-4 border border-orange-300">
                  <MultiStrokeOrderViewer text={kanji.kanji} />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {kanji.tags && kanji.tags.length > 0 && (
            <div className="bg-yellow-100/80 rounded-xl p-4 border border-yellow-300">
              <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <span>🏷️</span>
                <span>タグ Tags</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {kanji.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium border border-yellow-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes personnelles */}
          {kanji.customNotes && (
            <div className="bg-green-100/80 rounded-xl p-4 border border-green-300">
              <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                <span>📝</span>
                <span>個人メモ Notes personnelles</span>
              </h3>
              <p className="text-green-800 leading-relaxed">
                {kanji.customNotes}
              </p>
            </div>
          )}

          {/* Informations techniques */}
          <div className="bg-orange-100/60 rounded-xl p-4 border border-orange-200">
            <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
              <span>⚙️</span>
              <span>技術情報 Informations techniques</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {kanji.strokeCount && (
                <div className="flex justify-between">
                  <span className="text-orange-700">
                    画数 Nombre de traits :
                  </span>
                  <span className="text-red-900 font-medium">
                    {kanji.strokeCount}
                  </span>
                </div>
              )}
              {kanji.grade && (
                <div className="flex justify-between">
                  <span className="text-orange-700">学年 Niveau :</span>
                  <span className="text-red-900 font-medium">
                    {kanji.grade}
                  </span>
                </div>
              )}
              {kanji.frequency && (
                <div className="flex justify-between">
                  <span className="text-orange-700">頻度 Fréquence :</span>
                  <span className="text-red-900 font-medium">
                    #{kanji.frequency}
                  </span>
                </div>
              )}
              {kanji.jlptLevel && (
                <div className="flex justify-between">
                  <span className="text-orange-700">JLPT :</span>
                  <span className="text-red-900 font-medium">
                    {kanji.jlptLevel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-orange-300/50 bg-orange-50/50">
          <div className="flex items-center justify-between">
            <p className="text-orange-700 text-sm">
              Escキーで閉じる Appuyez sur Échap pour fermer
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-orange-800 transition-all"
            >
              閉じる Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
