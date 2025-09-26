"use client";

import { useState } from "react";
import AddKanjiForm from "@/components/AddKanjiForm";
import KanjiList from "@/components/KanjiList";
import EditKanjiModal from "@/components/EditKanjiModal";
import { useKanjis } from "@/hooks/useKanjis";
import { KanjiEntry } from "@/types/kanji";

export default function Home() {
  const [editingKanji, setEditingKanji] = useState<KanjiEntry | null>(null);
  const { kanjis, loading, error, updateKanji, deleteKanji, refreshKanjis } = useKanjis();

  const handleEdit = (kanji: KanjiEntry) => {
    setEditingKanji(kanji);
  };

  const handleSaveEdit = async (updatedKanji: KanjiEntry) => {
    await updateKanji(updatedKanji);
    setEditingKanji(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce kanji ?")) {
      await deleteKanji(id);
    }
  };

  const handleKanjiAdded = () => {
    refreshKanjis();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header avec design zen */}
      <header className="bg-gradient-to-r from-white/80 via-blue-50/90 to-indigo-50/80 backdrop-blur-sm shadow-sm border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl shadow-sm">
                <span className="text-2xl">🇯🇵</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-indigo-700 bg-clip-text text-transparent">
                  Japanese Sensei
                </h1>
                <p className="text-sm text-slate-500 font-medium">Votre compagnon d'apprentissage</p>
              </div>
            </div>
            
            {/* Navigation avec style zen */}
            <div className="flex items-center gap-4">
              <a
                href="/training"
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium transform hover:scale-105"
              >
                <span className="text-lg">🎯</span>
                <span>Entraînement</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Carte pour ajouter des kanjis avec style zen */}
        <div className="bg-gradient-to-br from-white/70 via-blue-50/80 to-indigo-50/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-lg">
              <span className="text-xl">➕</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-emerald-700 bg-clip-text text-transparent">
                Ajouter un nouveau kanji
              </h2>
              <p className="text-sm text-slate-500">Enrichissez votre collection</p>
            </div>
          </div>
          <AddKanjiForm onKanjiAdded={handleKanjiAdded} />
        </div>

        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Section collection avec style zen */}
        <div className="bg-gradient-to-br from-white/70 via-slate-50/80 to-blue-50/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-lg">
                <span className="text-xl">📚</span>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-purple-700 bg-clip-text text-transparent">
                  Votre collection de kanjis
                </h2>
                <p className="text-sm text-slate-500">
                  {kanjis.length > 0 ? `${kanjis.length} kanji${kanjis.length > 1 ? 's' : ''} dans votre collection` : 'Votre collection est vide'}
                </p>
              </div>
            </div>
            
            {kanjis.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <span className="text-blue-600">📊</span>
                <span className="text-sm font-medium text-blue-700">
                  Total: {kanjis.length}
                </span>
              </div>
            )}
          </div>
          
          <KanjiList
            kanjis={kanjis}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Footer avec encouragement */}
        {kanjis.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-8 border border-amber-200/50 shadow-lg">
              <div className="text-4xl mb-4">🌸</div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Commencez votre voyage d'apprentissage
              </h3>
              <p className="text-amber-700/80 text-sm max-w-md mx-auto">
                Ajoutez votre premier kanji ci-dessus et commencez à explorer la beauté de l'écriture japonaise
              </p>
            </div>
          </div>
        )}
      </main>

      <EditKanjiModal
        kanji={editingKanji}
        isOpen={!!editingKanji}
        onClose={() => setEditingKanji(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}