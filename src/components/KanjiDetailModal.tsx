'use client';

import { useState, useEffect } from 'react';
import MultiStrokeOrderViewer from './MultiStrokeOrderViewer';
import { KanjiEntry } from '@/types/kanji';

interface KanjiDetailModalProps {
  kanji: KanjiEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function KanjiDetailModal({ kanji, isOpen, onClose }: KanjiDetailModalProps) {
  const [showStrokeOrder, setShowStrokeOrder] = useState(true);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
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
      <div className="relative bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-slate-100">{kanji.kanji}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Détails du kanji</h2>
              <p className="text-slate-400 text-sm">Informations complètes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Significations */}
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-700/30">
            <h3 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
              <span>🌟</span>
              <span>Significations</span>
            </h3>
            <div className="space-y-2">
              <p className="text-xl font-bold text-emerald-200">
                {kanji.primaryMeaning || kanji.meanings[0]}
              </p>
              {kanji.meanings.length > 1 && (
                <p className="text-emerald-300 text-sm">
                  Autres significations : {kanji.meanings.slice(1).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Lectures */}
          {((kanji.onyomi && kanji.onyomi.length > 0) || (kanji.kunyomi && kanji.kunyomi.length > 0)) && (
            <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-700/30">
              <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
                <span>🗣️</span>
                <span>Lectures</span>
              </h3>
              <div className="space-y-3">
                {kanji.onyomi && kanji.onyomi.length > 0 && (
                  <div>
                    <p className="text-indigo-400 text-sm mb-1">On'yomi (lecture chinoise) :</p>
                    <div className="flex flex-wrap gap-2">
                      {kanji.onyomi.map((reading: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-indigo-800/50 text-indigo-200 rounded-lg text-sm font-medium border border-indigo-600/30">
                          {reading}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {kanji.kunyomi && kanji.kunyomi.length > 0 && (
                  <div>
                    <p className="text-indigo-400 text-sm mb-1">Kun'yomi (lecture japonaise) :</p>
                    <div className="flex flex-wrap gap-2">
                      {kanji.kunyomi.map((reading: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-indigo-700/50 text-indigo-200 rounded-lg text-sm font-medium border border-indigo-500/30">
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
          <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-700/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <span>✏️</span>
                <span>Ordre des traits</span>
              </h3>
              <button
                onClick={() => setShowStrokeOrder(!showStrokeOrder)}
                className="px-3 py-1 bg-purple-800/50 text-purple-300 rounded-lg text-sm hover:bg-purple-700/50 transition-colors"
              >
                {showStrokeOrder ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {showStrokeOrder && (
              <div className="flex justify-center">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                  <MultiStrokeOrderViewer text={kanji.kanji} />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {kanji.tags && kanji.tags.length > 0 && (
            <div className="bg-amber-900/30 rounded-xl p-4 border border-amber-700/30">
              <h3 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                <span>🏷️</span>
                <span>Tags</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {kanji.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-amber-800/50 text-amber-200 rounded-lg text-sm font-medium border border-amber-600/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes personnelles */}
          {kanji.customNotes && (
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
              <h3 className="text-lg font-bold text-slate-300 mb-3 flex items-center gap-2">
                <span>📝</span>
                <span>Notes personnelles</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">{kanji.customNotes}</p>
            </div>
          )}

          {/* Informations techniques */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <h3 className="text-lg font-bold text-slate-300 mb-3 flex items-center gap-2">
              <span>⚙️</span>
              <span>Informations techniques</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {kanji.strokeCount && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Nombre de traits :</span>
                  <span className="text-slate-200 font-medium">{kanji.strokeCount}</span>
                </div>
              )}
              {kanji.grade && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Niveau :</span>
                  <span className="text-slate-200 font-medium">{kanji.grade}</span>
                </div>
              )}
              {kanji.frequency && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Fréquence :</span>
                  <span className="text-slate-200 font-medium">#{kanji.frequency}</span>
                </div>
              )}
              {kanji.jlptLevel && (
                <div className="flex justify-between">
                  <span className="text-slate-400">JLPT :</span>
                  <span className="text-slate-200 font-medium">{kanji.jlptLevel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Appuyez sur Échap pour fermer</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}