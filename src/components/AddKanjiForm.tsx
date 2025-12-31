"use client";

import { useState } from "react";
import { useKanjis } from "@/hooks/useKanjis";

interface AddKanjiFormProps {
  onKanjiAdded?: () => void;
}

export default function AddKanjiForm({ onKanjiAdded }: AddKanjiFormProps) {
  const [input, setInput] = useState("");
  const [tags, setTags] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [mode, setMode] = useState<"api" | "manual">("api");

  // États pour le mode manuel
  const [manualKanji, setManualKanji] = useState("");
  const [manualMeanings, setManualMeanings] = useState("");
  const [manualOnyomi, setManualOnyomi] = useState("");
  const [manualKunyomi, setManualKunyomi] = useState("");
  const [manualPrimaryMeaning, setManualPrimaryMeaning] = useState("");
  const [manualPrimaryReading, setManualPrimaryReading] = useState("");
  const [manualStrokeCount, setManualStrokeCount] = useState("");
  const [manualJlptLevel, setManualJlptLevel] = useState("");

  const { addKanjiFromCharacter, addKanjiManually, updateKanji, error } =
    useKanjis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      let addedKanji: any = null;

      if (mode === "api") {
        // Mode API : utiliser l'API Jisho
        if (!input.trim()) return;

        addedKanji = await addKanjiFromCharacter(input.trim());

        if (addedKanji) {
          // Ajouter les tags et notes personnalisées si fournis
          if (tags.trim() || customNotes.trim()) {
            const updatedKanji = { ...addedKanji };

            if (tags.trim()) {
              updatedKanji.tags = tags
                .split(",")
                .map((tag) => tag.trim().toLowerCase())
                .filter(Boolean);
            }

            if (customNotes.trim()) {
              updatedKanji.customNotes = customNotes.trim();
            }

            updatedKanji.lastModified = new Date();
            await updateKanji(updatedKanji);
          }

          setSuccessMessage(
            `✅ "${addedKanji.kanji}" ajouté via API avec succès !`
          );
          setInput("");
        }
      } else {
        // Mode manuel : créer le kanji à la main
        if (!manualKanji.trim() || !manualMeanings.trim()) {
          setSuccessMessage(
            "❌ Le kanji et au moins une signification sont requis"
          );
          return;
        }

        const kanjiData = {
          kanji: manualKanji.trim(),
          meanings: manualMeanings
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean),
          primaryMeaning:
            manualPrimaryMeaning.trim() || manualMeanings.split(",")[0]?.trim(),
          onyomi: manualOnyomi
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
          kunyomi: manualKunyomi
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
          primaryReading: manualPrimaryReading.trim(),
          strokeCount: manualStrokeCount
            ? parseInt(manualStrokeCount)
            : undefined,
          jlptLevel: manualJlptLevel || undefined,
          tags: tags.trim()
            ? tags
                .split(",")
                .map((tag) => tag.trim().toLowerCase())
                .filter(Boolean)
            : [],
          customNotes: customNotes.trim() || undefined,
          isCommon: false, // Par défaut pour les ajouts manuels
        };

        addedKanji = await addKanjiManually(kanjiData);

        if (addedKanji) {
          setSuccessMessage(
            `✅ "${addedKanji.kanji}" ajouté manuellement avec succès !`
          );
          // Réinitialiser les champs manuels
          setManualKanji("");
          setManualMeanings("");
          setManualOnyomi("");
          setManualKunyomi("");
          setManualPrimaryMeaning("");
          setManualPrimaryReading("");
          setManualStrokeCount("");
          setManualJlptLevel("");
        }
      }

      if (addedKanji) {
        setCustomNotes("");
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
    setSuccessMessage("");
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
    setSuccessMessage("");
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomNotes(e.target.value);
    setSuccessMessage("");
  };

  return (
    <div className="space-y-4">
      {/* Sélecteur de mode */}
      <div className="flex items-center gap-4 p-4 bg-orange-100/90 backdrop-blur-sm rounded-xl border border-orange-200/50">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("api")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === "api"
                ? "bg-red-600 text-white shadow-md"
                : "bg-orange-200 text-orange-800 hover:bg-orange-300"
            }`}
          >
            🔍 検索 Recherche API
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === "manual"
                ? "bg-red-600 text-white shadow-md"
                : "bg-orange-200 text-orange-800 hover:bg-orange-300"
            }`}
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-md overflow-hidden bg-orange-300/80 mr-2 align-middle">
              <img
                src="/sprites/logo_pensif.png"
                alt="Saisie manuelle"
                className="w-full h-full object-cover"
              />
            </span>
            <span>手動 Saisie manuelle</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "api" ? (
          // Mode API - Formulaire simple
          <div>
            <label
              htmlFor="kanji-input"
              className="block text-sm font-medium text-red-800 mb-2"
            >
              漢字・日本語 Kanji ou mot japonais
            </label>
            <div className="flex gap-3">
              <input
                id="kanji-input"
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="漢字 ou ひらがな... (APIが情報を検索 l'API va chercher les infos)"
                className="flex-1 px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg bg-white/80 text-red-900 placeholder-orange-600"
                disabled={isSubmitting}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>検索中... Recherche...</span>
                  </div>
                ) : (
                  "検索 Rechercher"
                )}
              </button>
            </div>
          </div>
        ) : (
          // Mode manuel - Formulaire complet
          <div className="space-y-4">
            {/* Kanji et signification principale (obligatoires) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  漢字 Kanji <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={manualKanji}
                  onChange={(e) => setManualKanji(e.target.value)}
                  placeholder="漢字"
                  className="w-full px-3 py-2 bg-white/80 border border-orange-300 text-red-900 placeholder-orange-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-2xl text-center"
                  disabled={isSubmitting}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  意味 Significations <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={manualMeanings}
                  onChange={(e) => setManualMeanings(e.target.value)}
                  placeholder="signification 1, signification 2, ..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white/80 border border-orange-300 text-red-900 placeholder-orange-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Lectures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  音読み On'yomi
                </label>
                <input
                  type="text"
                  value={manualOnyomi}
                  onChange={(e) => setManualOnyomi(e.target.value)}
                  placeholder="オン, ダイ, ..."
                  className="w-full px-3 py-2 bg-white/80 border border-orange-300 text-red-900 placeholder-orange-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors font-mono"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  訓読み Kun'yomi
                </label>
                <input
                  type="text"
                  value={manualKunyomi}
                  onChange={(e) => setManualKunyomi(e.target.value)}
                  placeholder="おお.きい, だい, ..."
                  className="w-full px-3 py-2 bg-white/80 border border-orange-300 text-red-900 placeholder-orange-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors font-mono"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Informations préférées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  希望意味 Signification préférée
                </label>
                <input
                  type="text"
                  value={manualPrimaryMeaning}
                  onChange={(e) => setManualPrimaryMeaning(e.target.value)}
                  placeholder="覚えたいもの Celle que tu préfères retenir"
                  className="w-full px-3 py-2 bg-white/80 border border-orange-300 text-red-900 placeholder-orange-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  希望読み Lecture préférée
                </label>
                <input
                  type="text"
                  value={manualPrimaryReading}
                  onChange={(e) => setManualPrimaryReading(e.target.value)}
                  placeholder="覚えたいもの Celle que tu préfères retenir"
                  className="w-full px-3 py-2 bg-white/80 border border-orange-300 text-red-900 placeholder-orange-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors font-mono"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Informations complémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  画数 Nombre de traits
                </label>
                <input
                  type="number"
                  value={manualStrokeCount}
                  onChange={(e) => setManualStrokeCount(e.target.value)}
                  placeholder="例: 12"
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 bg-white/80 border border-orange-300 text-red-900 placeholder-orange-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  JLPTレベル Niveau JLPT
                </label>
                <select
                  value={manualJlptLevel}
                  onChange={(e) => setManualJlptLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-orange-300 text-red-900 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="">未定義 Non défini</option>
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
              disabled={
                !manualKanji.trim() || !manualMeanings.trim() || isSubmitting
              }
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>追加中... Ajout en cours...</span>
                </div>
              ) : (
                "✏️ 手動追加 Ajouter manuellement"
              )}
            </button>
          </div>
        )}

        {/* Tags et notes (communs aux deux modes) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-orange-300/50">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="tags-input"
                className="block text-sm font-medium text-red-800"
              >
                タグ Tags (任意 optionnel)
              </label>
              {tags && (
                <button
                  type="button"
                  onClick={() => setTags("")}
                  className="text-xs text-orange-600 hover:text-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  🗑️ 削除 Effacer
                </button>
              )}
            </div>
            <input
              id="tags-input"
              type="text"
              value={tags}
              onChange={handleTagsChange}
              placeholder="簡単 facile, 重要 important, 授業1 cours-1..."
              className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80 text-red-900 placeholder-orange-600"
              disabled={isSubmitting}
            />
            {tags && (
              <p className="text-xs text-red-600 mt-1">
                • 次回追加用に保存 Conservés pour le prochain ajout
              </p>
            )}
          </div>

          {/* Notes personnelles */}
          <div>
            <label
              htmlFor="notes-input"
              className="block text-sm font-medium text-red-800 mb-2"
            >
              メモ Notes (任意 optionnel)
            </label>
            <textarea
              id="notes-input"
              value={customNotes}
              onChange={handleNotesChange}
              placeholder="記憶法、文脈... Mnémotechnique, contexte..."
              rows={2}
              className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80 text-red-900 placeholder-orange-600 resize-none"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="p-3 bg-red-100 backdrop-blur-sm border border-red-300 rounded-lg">
          <p className="text-red-800 text-sm">❌ {error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-100 backdrop-blur-sm border border-green-300 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
