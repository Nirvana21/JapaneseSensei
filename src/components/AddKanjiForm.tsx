'use client';

import { useState } from 'react';
import { useKanjis } from '@/hooks/useKanjis';

interface AddKanjiFormProps {
  onKanjiAdded?: () => void;
}

export default function AddKanjiForm({ onKanjiAdded }: AddKanjiFormProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { addKanjiFromCharacter, error } = useKanjis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      const addedKanji = await addKanjiFromCharacter(input.trim());
      
      if (addedKanji) {
        setSuccessMessage(`✅ "${addedKanji.kanji}" ajouté avec succès !`);
        setInput('');
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Ajouter un kanji
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="kanji-input" className="block text-sm font-medium text-gray-700 mb-2">
            Saisissez un kanji ou mot japonais :
          </label>
          <div className="flex gap-3">
            <input
              id="kanji-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="漢字 ou ひらがな..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              disabled={isSubmitting}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
      </form>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Comment utiliser :</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tapez directement un kanji : <span className="font-mono bg-white px-1 rounded">日</span></li>
          <li>• Ou un mot complet : <span className="font-mono bg-white px-1 rounded">日本語</span></li>
          <li>• Utilisez votre clavier japonais mobile</li>
          <li>• L&apos;app récupèrera automatiquement les lectures et significations</li>
        </ul>
      </div>
    </div>
  );
}