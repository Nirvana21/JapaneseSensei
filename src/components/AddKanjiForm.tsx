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
  
  const { addKanjiFromCharacter, updateKanji, error } = useKanjis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      const addedKanji = await addKanjiFromCharacter(input.trim());
      
      if (addedKanji) {
        // Ajouter les tags et notes personnalisées si fournis
        if (tags.trim() || customNotes.trim()) {
          const updatedKanji = { ...addedKanji };
          
          if (tags.trim()) {
            updatedKanji.tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
          }
          
          if (customNotes.trim()) {
            updatedKanji.customNotes = customNotes.trim();
          }
          
          updatedKanji.lastModified = new Date();
          await updateKanji(updatedKanji);
        }
        
        setSuccessMessage(`✅ "${addedKanji.kanji}" ajouté avec succès !`);
        setInput('');
        // Garder les tags pour faciliter l'ajout de plusieurs kanjis de la même catégorie
        // setTags(''); // Ne plus effacer les tags
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="漢字 ou ひらがな..."
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
                  <span>Ajout...</span>
                </div>
              ) : (
                'Ajouter'
              )}
            </button>
          </div>
        </div>

        {/* Tags personnalisés simplifié */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

          {/* Notes personnelles simplifiées */}
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