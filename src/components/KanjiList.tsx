'use client';

import { KanjiEntry } from '@/types/kanji';
import { useState, useEffect } from 'react';
import { KanjiEnrichmentService } from '@/services/jishoApi';
import MultiStrokeOrderViewer from './MultiStrokeOrderViewer';

interface KanjiCardProps {
  kanji: KanjiEntry;
  onEdit?: (kanji: KanjiEntry) => void;
  onDelete?: (id: string) => void;
}

function KanjiCard({ kanji, onEdit, onDelete }: KanjiCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [masteryScore, setMasteryScore] = useState<0 | 1 | 2 | 3>(0);

  // Charger le score de maîtrise
  useEffect(() => {
    const learningData = localStorage.getItem(`simple_learning_${kanji.id}`);
    if (learningData) {
      try {
        const parsed = JSON.parse(learningData);
        setMasteryScore(parsed.learningData?.score || 0);
      } catch (error) {
        setMasteryScore(0);
      }
    }
  }, [kanji.id]);

  const getMasteryBadge = (score: 0 | 1 | 2 | 3) => {
    const badges = {
      0: { icon: '🆕', label: 'Nouveau', color: 'bg-gray-500 text-gray-100' },
      1: { icon: '❌', label: 'Difficile', color: 'bg-red-500 text-red-100' },
      2: { icon: '⚠️', label: 'Moyen', color: 'bg-orange-500 text-orange-100' },
      3: { icon: '✅', label: 'Maîtrisé', color: 'bg-green-500 text-green-100' }
    };
    return badges[score];
  };

  const masteryBadge = getMasteryBadge(masteryScore);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-slate-700/50">
      {/* Header avec le kanji principal */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold">{kanji.kanji}</span>
            <div className="flex flex-col gap-1">
              {kanji.isCommon && (
                <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
                  Courant
                </span>
              )}
              {kanji.jlptLevel && (
                <span className="bg-green-400 text-green-900 text-xs px-2 py-1 rounded-full font-medium">
                  {kanji.jlptLevel}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${masteryBadge.color}`} title={masteryBadge.label}>
                {masteryBadge.icon} {masteryBadge.label}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {showDetails ? 'Masquer' : 'Détails'}
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(kanji)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(kanji.id)}
                className="bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4 space-y-4">
        {/* Signification principale */}
        <div>
          <h3 className="font-semibold text-slate-200 mb-1">Signification :</h3>
          <p className="text-lg text-slate-100">
            {kanji.primaryMeaning || kanji.meanings[0] || 'Non définie'}
          </p>
          {kanji.meanings.length > 1 && (
            <p className="text-sm text-slate-400 mt-1">
              Autres : {kanji.meanings.slice(1).join(', ')}
            </p>
          )}
        </div>

        {/* Lectures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Onyomi */}
          {kanji.onyomi.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-300 mb-1">On&apos;yomi (音読み) :</h4>
              <div className="flex flex-wrap gap-1">
                {kanji.onyomi.map((reading, idx) => (
                  <span
                    key={idx}
                    className="bg-red-900/30 text-red-300 border border-red-700/30 px-2 py-1 rounded text-sm font-mono"
                  >
                    {reading}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kunyomi */}
          {kanji.kunyomi.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-300 mb-1">Kun&apos;yomi (訓読み) :</h4>
              <div className="flex flex-wrap gap-1">
                {kanji.kunyomi.map((reading, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-900/30 text-blue-300 border border-blue-700/30 px-2 py-1 rounded text-sm font-mono"
                  >
                    {reading}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lecture principale */}
        {kanji.primaryReading && (
          <div>
            <h4 className="font-medium text-slate-300 mb-1">Lecture principale :</h4>
            <span className="bg-purple-900/30 text-purple-300 border border-purple-700/30 px-3 py-1 rounded font-mono font-medium">
              {kanji.primaryReading}
            </span>
          </div>
        )}

        {/* Détails étendus */}
        {showDetails && (
          <div className="border-t border-slate-600/50 pt-4 space-y-4">
            {/* Ordre des traits */}
            <div>
              <MultiStrokeOrderViewer 
                text={kanji.kanji}
                className="w-full"
              />
            </div>

            {/* Informations techniques */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {kanji.strokeCount && (
                <div>
                  <span className="font-medium text-slate-400">Traits :</span>
                  <span className="ml-2 text-slate-200">{kanji.strokeCount}</span>
                </div>
              )}
              {kanji.grade && (
                <div>
                  <span className="font-medium text-slate-400">Niveau :</span>
                  <span className="ml-2 text-slate-200">{kanji.grade}e année</span>
                </div>
              )}
              {kanji.frequency && (
                <div>
                  <span className="font-medium text-slate-400">Fréquence :</span>
                  <span className="ml-2 text-slate-200">#{kanji.frequency}</span>
                </div>
              )}
            </div>

            {/* Analyse des radicaux pour kanji individuel */}
            {kanji.kanji.length === 1 && (
              <div>
                <h4 className="font-medium text-slate-300 mb-2">Analyse des radicaux :</h4>
                {(() => {
                  // Analyser les radicaux du kanji
                  const radicalAnalysis = KanjiEnrichmentService.analyzeRadicals(kanji.kanji);
                  if (radicalAnalysis.length > 0) {
                    return (
                      <div className="space-y-1">
                        {radicalAnalysis.map((analysis, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="bg-orange-900/30 text-orange-300 border border-orange-700/30 px-2 py-1 rounded font-mono">
                              {analysis.radical}
                            </span>
                            <span className="text-slate-400">
                              {analysis.name} - {analysis.meaning}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <p className="text-sm text-slate-500">
                      Aucun radical reconnu dans notre base de données
                    </p>
                  );
                })()}
              </div>
            )}

            {/* Décomposition pour mots composés */}
            {kanji.kanjiComponents && kanji.kanjiComponents.length > 1 && (
              <div>
                <h4 className="font-medium text-slate-300 mb-2">Décomposition :</h4>
                <div className="space-y-2">
                  {kanji.kanjiComponents.map((component, idx) => (
                    <div key={idx} className="bg-slate-700/50 border border-slate-600/30 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-indigo-400">
                          {component.character}
                        </span>
                        <div>
                          <div className="font-medium text-slate-200">
                            {component.meaning || 'Signification non trouvée'}
                          </div>
                          {component.strokeCount && (
                            <div className="text-xs text-slate-500">
                              {component.strokeCount} traits
                            </div>
                          )}
                        </div>
                      </div>
                      {component.radicals.length > 0 && (
                        <div>
                          <span className="text-xs text-slate-400">Radicaux : </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {component.radicals.map((radical, ridx) => (
                              <span
                                key={ridx}
                                className="bg-orange-900/30 text-orange-300 border border-orange-700/30 px-1 py-0.5 rounded text-xs"
                              >
                                {radical}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Radicaux */}
            {kanji.radicals && kanji.radicals.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-300 mb-1">Clés/Radicaux :</h4>
                <div className="flex flex-wrap gap-1">
                  {kanji.radicals.map((radical, idx) => (
                    <span
                      key={idx}
                      className="bg-orange-900/30 text-orange-300 border border-orange-700/30 px-2 py-1 rounded text-sm"
                    >
                      {radical}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes personnalisées */}
            {kanji.customNotes && (
              <div>
                <h4 className="font-medium text-slate-300 mb-1">Notes personnelles :</h4>
                <p className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3 text-sm text-yellow-200">
                  {kanji.customNotes}
                </p>
              </div>
            )}

            {/* Tags */}
            {kanji.tags && kanji.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-300 mb-1">Tags :</h4>
                <div className="flex flex-wrap gap-1">
                  {kanji.tags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Remonter vers le parent pour déclencher le filtrage
                        const event = new CustomEvent('filterByTag', { detail: tag });
                        document.dispatchEvent(event);
                      }}
                      className="bg-slate-700/50 hover:bg-indigo-700/50 text-slate-300 hover:text-indigo-200 border border-slate-600/30 hover:border-indigo-500/50 px-2 py-1 rounded text-xs cursor-pointer transition-colors"
                      title={`Filtrer par le tag ${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques d'étude */}
            {kanji.studyData && kanji.studyData.timesStudied > 0 && (
              <div className="bg-indigo-900/30 border border-indigo-700/30 rounded p-3">
                <h4 className="font-medium text-indigo-300 mb-2">Progression :</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                  <div>Étudiée : {kanji.studyData.timesStudied} fois</div>
                  <div>Réussites : {kanji.studyData.correctAnswers}</div>
                  <div>
                    Taux de réussite : {' '}
                    {kanji.studyData.timesStudied > 0 
                      ? Math.round((kanji.studyData.correctAnswers / kanji.studyData.timesStudied) * 100)
                      : 0
                    }%
                  </div>
                  <div>Difficulté : {kanji.studyData.difficulty}</div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="text-xs text-slate-500 border-t border-slate-600/30 pt-2">
              <div>Ajouté le : {formatDate(kanji.dateAdded)}</div>
              <div>Modifié le : {formatDate(kanji.lastModified)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface KanjiListProps {
  kanjis: KanjiEntry[];
  loading?: boolean;
  onEdit?: (kanji: KanjiEntry) => void;
  onDelete?: (id: string) => void;
}

export default function KanjiList({ kanjis, loading, onEdit, onDelete }: KanjiListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'kanji' | 'frequency'>('date');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extraire tous les tags uniques des kanjis (normalisés en minuscules)
  const allTags = Array.from(new Set(
    kanjis.flatMap(kanji => kanji.tags || [])
      .map(tag => tag.toLowerCase())
  )).sort();

  // Fonctions pour gérer les tags
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  // Écouter les événements de filtrage par tag depuis les cartes
  useEffect(() => {
    const handleFilterByTag = (event: CustomEvent) => {
      const tag = event.detail;
      if (!selectedTags.includes(tag)) {
        setSelectedTags(prev => [...prev, tag]);
      }
    };

    document.addEventListener('filterByTag', handleFilterByTag as EventListener);
    return () => {
      document.removeEventListener('filterByTag', handleFilterByTag as EventListener);
    };
  }, [selectedTags]);

  // Filtrer et trier les kanjis
  const filteredAndSortedKanjis = kanjis
    .filter(kanji => {
      // Filtrage par recherche textuelle
      const matchesSearch = searchQuery === '' || (
        kanji.kanji.includes(searchQuery) ||
        kanji.meanings.some(meaning => 
          meaning.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        kanji.onyomi.some(reading => reading.includes(searchQuery)) ||
        kanji.kunyomi.some(reading => reading.includes(searchQuery))
      );

      // Filtrage par tags sélectionnés (insensible à la casse)
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(selectedTag => 
          kanji.tags?.some(kanjiTag => 
            kanjiTag.toLowerCase() === selectedTag.toLowerCase()
          )
        );

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'kanji':
          return a.kanji.localeCompare(b.kanji);
        case 'frequency':
          return (a.frequency || 9999) - (b.frequency || 9999);
        case 'date':
        default:
          return b.dateAdded.getTime() - a.dateAdded.getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400">Chargement des kanjis...</span>
        </div>
      </div>
    );
  }

  if (kanjis.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          Aucun kanji dans votre collection
        </h3>
        <p className="text-slate-400">
          Utilisez le formulaire ci-dessus pour ajouter votre premier kanji !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un kanji, signification, ou lecture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Trier par :</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'kanji' | 'frequency')}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Date d'ajout</option>
              <option value="kanji">Kanji (A-Z)</option>
              <option value="frequency">Fréquence</option>
            </select>
          </div>
        </div>

        {/* Sélecteur de tags */}
        {allTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-300">Filtrer par tags :</h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearAllTags}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Effacer tout
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                const kanjiCount = kanjis.filter(k => 
                  k.tags?.some(kanjiTag => kanjiTag.toLowerCase() === tag.toLowerCase())
                ).length;
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md border border-indigo-500'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
                    }`}
                  >
                    #{tag}
                    <span className="ml-1 text-xs opacity-75">({kanjiCount})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Statistiques */}
        <div className="mt-3 pt-3 border-t border-slate-600/30 text-sm text-slate-400">
          {filteredAndSortedKanjis.length} kanji(s) 
          {searchQuery && ` trouvé(s) pour "${searchQuery}"`}
          {selectedTags.length > 0 && ` avec les tags: ${selectedTags.map(t => `#${t}`).join(', ')}`}
          {kanjis.length > filteredAndSortedKanjis.length && 
            ` sur ${kanjis.length} au total`
          }
        </div>
      </div>

      {/* Liste des cartes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAndSortedKanjis.map((kanji) => (
          <KanjiCard
            key={kanji.id}
            kanji={kanji}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}