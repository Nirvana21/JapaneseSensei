"use client";

import { useState } from "react";
import Link from "next/link";
import AddKanjiForm from "@/components/AddKanjiForm";
import KanjiList from "@/components/KanjiList";
import EditKanjiModal from "@/components/EditKanjiModal";
import { useKanjis } from "@/hooks/useKanjis";
import { KanjiEntry } from "@/types/kanji";

export default function Home() {
  const [currentView, setCurrentView] = useState<'menu' | 'collection'>('menu');
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

  // Vue Menu Principal
  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        {/* Header épuré */}
        <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl mb-4">
              <span className="text-3xl">🇯🇵</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent mb-2">
              Japanese Sensei
            </h1>
            <p className="text-slate-400 font-medium">Maîtrisez l'art des kanjis</p>
          </div>
        </header>

        {/* Menu Principal */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Bouton Quiz */}
            <Link href="/training" className="group">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-purple-900/20 border border-slate-700/50 transition-all duration-300 hover:scale-105 h-full hover:border-purple-600/30">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-3">Quiz</h2>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Testez vos connaissances avec des flashcards interactives
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-purple-400">
                    <span>Commencer</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  {kanjis.length > 0 && (
                    <div className="mt-4 px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm inline-block border border-purple-700/30">
                      {kanjis.length} kanji{kanjis.length > 1 ? 's' : ''} disponible{kanjis.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Bouton Collection */}
            <button 
              onClick={() => setCurrentView('collection')}
              className="group w-full text-left"
            >
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-emerald-900/20 border border-slate-700/50 transition-all duration-300 hover:scale-105 h-full hover:border-emerald-600/30">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-3">Collection</h2>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Gérez votre bibliothèque de kanjis personnelle
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-400">
                    <span>Explorer</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <div className="mt-4 px-3 py-1 bg-emerald-900/50 text-emerald-300 rounded-full text-sm inline-block border border-emerald-700/30">
                    {kanjis.length} kanji{kanjis.length > 1 ? 's' : ''} dans votre collection
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Message d'encouragement si collection vide */}
          {kanjis.length === 0 && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl p-8 border border-amber-700/30 shadow-2xl max-w-md mx-auto backdrop-blur-sm">
                <span className="text-4xl mb-4 block">🌸</span>
                <h3 className="text-lg font-bold text-amber-300 mb-2">
                  Commencez votre voyage
                </h3>
                <p className="text-amber-400/80 text-sm">
                  Ajoutez vos premiers kanjis dans la collection pour débloquer le quiz !
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Vue Collection
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Header avec retour */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentView('menu')}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-700/50"
            >
              <span>←</span>
              <span className="hidden sm:inline">Retour au menu</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-100">Ma Collection</h1>
              <p className="text-slate-400 text-sm">{kanjis.length} kanji{kanjis.length > 1 ? 's' : ''}</p>
            </div>

            <div className="w-20"></div> {/* Spacer pour centrer le titre */}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Formulaire d'ajout épuré */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6">
          <AddKanjiForm onKanjiAdded={handleKanjiAdded} />
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 backdrop-blur-sm border border-red-700/50 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Liste des kanjis */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6">
          <KanjiList
            kanjis={kanjis}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
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