'use client';

import { useState } from 'react';
import { useKanjis } from '@/hooks/useKanjis';

interface AddKanjiFormProps {
  onKanjiAdded?: () => void;
}

export default function AddKanjiForm({ onKanjiAdded }: AddKanjiFormProps) {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [mode, setMode] = useState<'api' | 'manual'>('api');
  
  // États pour le mode manuel
  const [manualKanji, setManualKanji] = useState('');
  const [manualMeanings, setManualMeanings] = useState('');
  const [manualOnyomi, setManualOnyomi] = useState('');
  const [manualKunyomi, setManualKunyomi] = useState('');
  const [manualPrimaryMeaning, setManualPrimaryMeaning] = useState('');
  const [manualPrimaryReading, setManualPrimaryReading] = useState('');
  const [manualStrokeCount, setManualStrokeCount] = useState('');
  const [manualJlptLevel, setManualJlptLevel] = useState('');
  
  const { addKanjiFromCharacter, addKanjiManually, updateKanji, error } = useKanjis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      let addedKanji: any = null;
      
      if (mode === 'api') {
        // Mode API : utiliser l'API Jisho
        if (!input.trim()) return;
        
        addedKanji = await addKanjiFromCharacter(input.trim());
        
        if (addedKanji) {
          // Ajouter les tags et notes personnalisées si fournis
          if (tags.trim() || customNotes.trim()) {
            const updatedKanji = { ...addedKanji };
            
            if (tags.trim()) {
              updatedKanji.tags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
            }
            
            if (customNotes.trim()) {
              updatedKanji.customNotes = customNotes.trim();
            }
            
            updatedKanji.lastModified = new Date();
            await updateKanji(updatedKanji);
          }
          
          setSuccessMessage(`✅ "${addedKanji.kanji}" ajouté via API avec succès !`);
          setInput('');
        }
      } else {
        // Mode manuel : créer le kanji à la main
        if (!manualKanji.trim() || !manualMeanings.trim()) {
          setSuccessMessage('❌ Le kanji et au moins une signification sont requis');
          return;
        }
        
        const kanjiData = {
          kanji: manualKanji.trim(),
          meanings: manualMeanings.split(',').map(m => m.trim()).filter(Boolean),
          primaryMeaning: manualPrimaryMeaning.trim() || manualMeanings.split(',')[0]?.trim(),
          onyomi: manualOnyomi.split(',').map(r => r.trim()).filter(Boolean),
          kunyomi: manualKunyomi.split(',').map(r => r.trim()).filter(Boolean),
          primaryReading: manualPrimaryReading.trim(),
          strokeCount: manualStrokeCount ? parseInt(manualStrokeCount) : undefined,
          jlptLevel: manualJlptLevel || undefined,
          tags: tags.trim() ? tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : [],
          customNotes: customNotes.trim() || undefined,
          isCommon: false, // Par défaut pour les ajouts manuels
        };
        
        addedKanji = await addKanjiManually(kanjiData);
        
        if (addedKanji) {
          setSuccessMessage(`✅ "${addedKanji.kanji}" ajouté manuellement avec succès !`);
          // Réinitialiser les champs manuels
          setManualKanji('');
          setManualMeanings('');
          setManualOnyomi('');
          setManualKunyomi('');
          setManualPrimaryMeaning('');
          setManualPrimaryReading('');
          setManualStrokeCount('');
          setManualJlptLevel('');
        }
      }
      
      if (addedKanji) {
        setCustomNotes('');
        onKanjiAdded?.();
      }
    } catch (error) {
      // L'erreur est gérée par le hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSuccessMessage('');
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
    setSuccessMessage('');
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomNotes(e.target.value);
    setSuccessMessage('');
  };

  return (
    <div className="space-y-4">
      {/* Sélecteur de mode */}
      <div className="flex items-center gap-4 p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
        <span className="text-sm font-medium text-slate-300">Mode d'ajout :</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('api')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === 'api' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            🔍 Recherche API
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === 'manual' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            ✏️ Saisie manuelle
          </button>
        </div>
        <p className="text-xs text-slate-400 ml-auto">
          {mode === 'api' ? 'Utilise l\'API Jisho pour récupérer les infos' : 'Tu remplis toutes les informations toi-même'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'api' ? (
          // Mode API - Formulaire simple
          <div>
            <label htmlFor="kanji-input" className="block text-sm font-medium text-slate-300 mb-2">
              Kanji ou mot japonais
            </label>
            <div className="flex gap-3">
              <input
                id="kanji-input"
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="漢字 ou ひらがな... (l'API va chercher les infos)"
                className="flex-1 px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg bg-slate-700/80 text-slate-100 placeholder-slate-400"
                disabled={isSubmitting}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Recherche...</span>
                  </div>
                ) : (
                  'Rechercher'
                )}
              </button>
            </div>
          </div>
        ) : (
          // Mode manuel - Formulaire complet
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
              <p className="text-yellow-200 text-sm">
                💡 <strong>Mode saisie manuelle</strong> - Tu contrôles toutes les informations. Parfait quand l'API ne trouve pas le bon kanji !
              </p>
            </div>
            
            {/* Kanji et signification principale (obligatoires) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kanji <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={manualKanji}
                  onChange={(e) => setManualKanji(e.target.value)}
                  placeholder="漢字"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-2xl text-center"
                  disabled={isSubmitting}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Significations <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={manualMeanings}
                  onChange={(e) => setManualMeanings(e.target.value)}
                  placeholder="signification 1, signification 2, ..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Lectures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lectures On'yomi
                </label>
                <input
                  type="text"
                  value={manualOnyomi}
                  onChange={(e) => setManualOnyomi(e.target.value)}
                  placeholder="オン, ダイ, ..."
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lectures Kun'yomi
                </label>
                <input
                  type="text"
                  value={manualKunyomi}
                  onChange={(e) => setManualKunyomi(e.target.value)}
                  placeholder="おお.きい, だい, ..."
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Informations préférées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Signification préférée
                </label>
                <input
                  type="text"
                  value={manualPrimaryMeaning}
                  onChange={(e) => setManualPrimaryMeaning(e.target.value)}
                  placeholder="Celle que tu préfères retenir"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lecture préférée
                </label>
                <input
                  type="text"
                  value={manualPrimaryReading}
                  onChange={(e) => setManualPrimaryReading(e.target.value)}
                  placeholder="Celle que tu préfères retenir"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Informations complémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre de traits
                </label>
                <input
                  type="number"
                  value={manualStrokeCount}
                  onChange={(e) => setManualStrokeCount(e.target.value)}
                  placeholder="Ex: 12"
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Niveau JLPT
                </label>
                <select
                  value={manualJlptLevel}
                  onChange={(e) => setManualJlptLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="">Non défini</option>
                  <option value="jlpt-n5">JLPT N5</option>
                  <option value="jlpt-n4">JLPT N4</option>
                  <option value="jlpt-n3">JLPT N3</option>
                  <option value="jlpt-n2">JLPT N2</option>
                  <option value="jlpt-n1">JLPT N1</option>
                </select>
              </div>
            </div>

            {/* Bouton d'ajout manuel */}
            <button
              type="submit"
              disabled={!manualKanji.trim() || !manualMeanings.trim() || isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ajout en cours...</span>
                </div>
              ) : (
                '✏️ Ajouter manuellement'
              )}
            </button>
          </div>
        )}

        {/* Tags et notes (communs aux deux modes) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-slate-600/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tags-input" className="block text-sm font-medium text-slate-300">
                Tags (optionnel)
              </label>
              {tags && (
                <button
                  type="button"
                  onClick={() => setTags('')}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                  disabled={isSubmitting}
                >
                  🗑️ Effacer
                </button>
              )}
            </div>
            <input
              id="tags-input"
              type="text"
              value={tags}
              onChange={handleTagsChange}
              placeholder="facile, important, cours-1..."
              className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-700/80 text-slate-100 placeholder-slate-400"
              disabled={isSubmitting}
            />
            {tags && (
              <p className="text-xs text-indigo-400 mt-1">
                • Conservés pour le prochain ajout
              </p>
            )}
          </div>

          {/* Notes personnelles */}
          <div>
            <label htmlFor="notes-input" className="block text-sm font-medium text-slate-300 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              id="notes-input"
              value={customNotes}
              onChange={handleNotesChange}
              placeholder="Mnémotechnique, contexte..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-700/80 text-slate-100 placeholder-slate-400 resize-none"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="p-3 bg-red-900/30 backdrop-blur-sm border border-red-700/50 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-900/30 backdrop-blur-sm border border-green-700/50 rounded-lg">
          <p className="text-green-300 text-sm">{successMessage}</p>
        </div>
      )}
    </div>
  );
}