'use client';

import { useState, useEffect } from 'react';
import { KanjiEntry } from '@/types/kanji';
import { simpleAdaptiveLearningService } from '@/services/adaptiveLearningService';

interface EditKanjiModalProps {
  kanji: KanjiEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedKanji: KanjiEntry) => void;
}

export default function EditKanjiModal({ kanji, isOpen, onClose, onSave }: EditKanjiModalProps) {
  const [formData, setFormData] = useState<KanjiEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [masteryScore, setMasteryScore] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (kanji) {
      setFormData({ ...kanji });
      
      // Charger le score de maîtrise depuis localStorage
      const learningData = localStorage.getItem(`simple_learning_${kanji.id}`);
      if (learningData) {
        try {
          const parsed = JSON.parse(learningData);
          setMasteryScore(parsed.learningData?.score || 0);
        } catch (error) {
          console.error('Erreur chargement score maîtrise:', error);
          setMasteryScore(0);
        }
      } else {
        setMasteryScore(0);
      }
    }
  }, [kanji]);

  if (!isOpen || !formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Sauvegarder le kanji modifié
      await onSave(formData);
      
      // Sauvegarder le score de maîtrise modifié
      if (kanji) {
        const existingData = localStorage.getItem(`simple_learning_${kanji.id}`);
        let learningData;
        
        if (existingData) {
          learningData = JSON.parse(existingData);
          learningData.learningData.score = masteryScore;
        } else {
          // Créer des données d'apprentissage basiques si elles n'existent pas
          const simpleLearningKanji = simpleAdaptiveLearningService.initializeLearningData(kanji);
          simpleLearningKanji.learningData.score = masteryScore;
          learningData = simpleLearningKanji;
        }
        
        localStorage.setItem(`simple_learning_${kanji.id}`, JSON.stringify(learningData));
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof KanjiEntry, value: string | number | undefined | KanjiEntry['studyData']) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleArrayChange = (field: 'onyomi' | 'kunyomi' | 'meanings' | 'tags', value: string) => {
    if (!formData) return;
    let items = value.split(',').map(item => item.trim()).filter(Boolean);
    
    // Normaliser les tags en minuscules pour éviter les doublons de casse
    if (field === 'tags') {
      items = items.map(tag => tag.toLowerCase());
    }
    
    setFormData(prev => prev ? { ...prev, [field]: items } : null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Modifier : {formData.kanji}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-slate-300 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Significations */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Signification principale :
            </label>
            <input
              type="text"
              value={formData.primaryMeaning || ''}
              onChange={(e) => handleInputChange('primaryMeaning', e.target.value)}
              placeholder="La signification que vous préférez retenir"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            
            <label className="block text-sm font-medium text-slate-300 mt-4 mb-2">
              Toutes les significations (séparées par des virgules) :
            </label>
            <textarea
              value={formData.meanings.join(', ')}
              onChange={(e) => handleArrayChange('meanings', e.target.value)}
              placeholder="signification 1, signification 2, ..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Lectures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lectures On'yomi (séparées par des virgules) :
              </label>
              <input
                type="text"
                value={formData.onyomi.join(', ')}
                onChange={(e) => handleArrayChange('onyomi', e.target.value)}
                placeholder="オン, ダイ, ..."
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lectures Kun'yomi (séparées par des virgules) :
              </label>
              <input
                type="text"
                value={formData.kunyomi.join(', ')}
                onChange={(e) => handleArrayChange('kunyomi', e.target.value)}
                placeholder="おお.きい, だい, ..."
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Lecture principale */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Lecture principale :
            </label>
            <input
              type="text"
              value={formData.primaryReading || ''}
              onChange={(e) => handleInputChange('primaryReading', e.target.value)}
              placeholder="La lecture que vous préférez retenir"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
            />
          </div>

          {/* Informations supplémentaires */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre de traits :
              </label>
              <input
                type="number"
                value={formData.strokeCount || ''}
                onChange={(e) => handleInputChange('strokeCount', parseInt(e.target.value) || undefined)}
                min="1"
                max="30"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Niveau scolaire :
              </label>
              <select
                value={formData.grade || ''}
                onChange={(e) => handleInputChange('grade', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Non défini</option>
                <option value="1">1ère année</option>
                <option value="2">2ème année</option>
                <option value="3">3ème année</option>
                <option value="4">4ème année</option>
                <option value="5">5ème année</option>
                <option value="6">6ème année</option>
                <option value="8">Collège</option>
                <option value="9">Lycée</option>
                <option value="10">Jinmeiyō</option>
              </select>
            </div>
          </div>

          {/* Niveau JLPT */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Niveau JLPT :
            </label>
            <select
              value={formData.jlptLevel || ''}
              onChange={(e) => handleInputChange('jlptLevel', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">Non défini</option>
              <option value="jlpt-n5">JLPT N5</option>
              <option value="jlpt-n4">JLPT N4</option>
              <option value="jlpt-n3">JLPT N3</option>
              <option value="jlpt-n2">JLPT N2</option>
              <option value="jlpt-n1">JLPT N1</option>
            </select>
          </div>

          {/* Score de maîtrise */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Niveau de maîtrise :
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 0, label: '🆕 Nouveau', color: 'bg-gray-600 hover:bg-gray-500', desc: 'Jamais étudié' },
                { value: 1, label: '❌ Difficile', color: 'bg-red-600 hover:bg-red-500', desc: 'Souvent raté' },
                { value: 2, label: '⚠️ Moyen', color: 'bg-orange-600 hover:bg-orange-500', desc: 'Parfois réussi' },
                { value: 3, label: '✅ Maîtrisé', color: 'bg-green-600 hover:bg-green-500', desc: 'Bien connu' }
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setMasteryScore(level.value as 0 | 1 | 2 | 3)}
                  className={`p-3 rounded-lg text-white text-sm font-medium transition-all border-2 ${
                    masteryScore === level.value 
                      ? `${level.color} border-white shadow-lg scale-105` 
                      : `${level.color} border-transparent opacity-70 hover:opacity-100`
                  }`}
                  title={level.desc}
                >
                  <div className="font-bold">{level.label}</div>
                  <div className="text-xs opacity-80 mt-1">{level.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              💡 Modifie le niveau de maîtrise pour influencer la fréquence d'apparition dans les sessions
            </p>
          </div>

          {/* Notes personnelles */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes personnelles :
            </label>
            <textarea
              value={formData.customNotes || ''}
              onChange={(e) => handleInputChange('customNotes', e.target.value)}
              placeholder="Ajoutez vos propres notes, mnémotechniques, exemples..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags (séparés par des virgules) :
            </label>
            <textarea
              value={(formData.tags || []).join(', ')}
              onChange={(e) => handleArrayChange('tags', e.target.value)}
              placeholder="difficile, important, examen, cours, révision, ..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              💡 Utilisez des virgules pour séparer les tags. Ex: "difficile, important, N3"
            </p>
          </div>

          {/* Difficulté */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Difficulté personnelle :
            </label>
            <select
              value={formData.studyData?.difficulty || 'medium'}
              onChange={(e) => {
                const newStudyData = {
                  timesStudied: formData.studyData?.timesStudied || 0,
                  correctAnswers: formData.studyData?.correctAnswers || 0,
                  lastStudied: formData.studyData?.lastStudied,
                  difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                };
                handleInputChange('studyData', newStudyData);
              }}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="easy">Facile 😊</option>
              <option value="medium">Moyen 😐</option>
              <option value="hard">Difficile 😰</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-600/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t border-slate-600/30-transparent rounded-full animate-spin"></div>
                  Sauvegarde...
                </div>
              ) : (
                'Sauvegarder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
