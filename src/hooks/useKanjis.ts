'use client';

import { useState, useEffect } from 'react';
import { KanjiEntry } from '@/types/kanji';
import { KanjiStorageService } from '@/services/kanjiStorage';
import { JishoApiService, KanjiEnrichmentService } from '@/services/jishoApi';

export function useKanjis() {
  const [kanjis, setKanjis] = useState<KanjiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les kanjis au démarrage
  useEffect(() => {
    loadKanjis();
  }, []);

  const loadKanjis = async () => {
    try {
      setLoading(true);
      await KanjiStorageService.initialize();
      const loadedKanjis = await KanjiStorageService.getAllKanjis();
      setKanjis(loadedKanjis);
    } catch (error) {
      setError('Erreur lors du chargement des kanjis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addKanjiFromCharacter = async (character: string): Promise<KanjiEntry | null> => {
    try {
      setError(null);
      
      // Vérifier si le kanji existe déjà
      const existing = await KanjiStorageService.getKanjiByCharacter(character);
      if (existing) {
        setError('Ce kanji est déjà dans votre collection');
        return null;
      }

      // Rechercher dans Jisho
      const jishoResults = await JishoApiService.searchKanji(character);
      
      if (jishoResults.length === 0) {
        setError('Aucune information trouvée pour ce caractère');
        return null;
      }

      // Prendre le premier résultat le plus pertinent
      const bestMatch = jishoResults.find(entry => 
        entry.japanese.some(jp => jp.word === character || jp.reading === character)
      ) || jishoResults[0];

      // Convertir en KanjiEntry
      let kanjiEntry = JishoApiService.convertJishoToKanjiEntry(bestMatch);
      
      // Enrichir avec des données supplémentaires
      kanjiEntry = await KanjiEnrichmentService.enrichKanjiData(kanjiEntry);

      // Catégoriser les lectures
      const allReadings = bestMatch.japanese.map(j => j.reading).filter(Boolean) as string[];
      const categorizedReadings = KanjiEnrichmentService.categorizeReadings(allReadings);
      
      kanjiEntry.onyomi = categorizedReadings.onyomi;
      kanjiEntry.kunyomi = categorizedReadings.kunyomi;

      // Sauvegarder
      await KanjiStorageService.saveKanji(kanjiEntry);
      
      // Recharger la liste
      await loadKanjis();
      
      return kanjiEntry;
    } catch (error) {
      setError('Erreur lors de l\'ajout du kanji');
      console.error(error);
      return null;
    }
  };

  const updateKanji = async (updatedKanji: KanjiEntry) => {
    try {
      setError(null);
      await KanjiStorageService.saveKanji(updatedKanji);
      await loadKanjis();
    } catch (error) {
      setError('Erreur lors de la mise à jour du kanji');
      console.error(error);
    }
  };

  const deleteKanji = async (id: string) => {
    try {
      setError(null);
      await KanjiStorageService.deleteKanji(id);
      await loadKanjis();
    } catch (error) {
      setError('Erreur lors de la suppression du kanji');
      console.error(error);
    }
  };

  const searchKanjis = async (query: string): Promise<KanjiEntry[]> => {
    try {
      return await KanjiStorageService.searchKanjis(query);
    } catch (error) {
      console.error('Erreur recherche:', error);
      return [];
    }
  };

  return {
    kanjis,
    loading,
    error,
    addKanjiFromCharacter,
    updateKanji,
    deleteKanji,
    searchKanjis,
    refreshKanjis: loadKanjis
  };
}