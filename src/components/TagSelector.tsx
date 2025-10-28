"use client";

import { useState } from "react";

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export default function TagSelector({
  availableTags,
  selectedTags,
  onTagsChange,
  className = "",
}: TagSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAll = () => {
    onTagsChange([]);
  };

  const selectAll = () => {
    onTagsChange([...availableTags]);
  };

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="bg-orange-100/90 rounded-xl p-4 border border-orange-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
            <span>🏷️</span>
            <span>タグフィルター Filtrer par tags</span>
            {selectedTags.length > 0 && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                {selectedTags.length}
              </span>
            )}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-600 hover:text-red-700 transition-colors"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
              >
                全選択 Tout sélectionner
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 bg-orange-300 hover:bg-orange-400 text-orange-800 text-xs rounded-lg transition-colors"
              >
                全解除 Tout désélectionner
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-green-600 text-white border-green-500"
                      : "bg-orange-200 text-orange-800 border-orange-300 hover:bg-orange-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="text-xs text-orange-600 mt-2">
              {selectedTags.length === 0
                ? "全漢字が含まれます Tous les kanjis seront inclus"
                : `${selectedTags.length} タグ選択中 tag(s) sélectionné(s)`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
