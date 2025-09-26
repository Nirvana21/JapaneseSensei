'use client';

import { useState } from 'react';

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export default function TagSelector({ availableTags, selectedTags, onTagsChange, className = '' }: TagSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
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
      <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <span>🏷️</span>
            <span>Filtrer par tags</span>
            {selectedTags.length > 0 && (
              <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                {selectedTags.length}
              </span>
            )}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors"
              >
                Tout sélectionner
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 text-xs rounded-lg transition-colors"
              >
                Tout désélectionner
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-600/50 text-slate-300 border-slate-500/50 hover:bg-slate-500/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-slate-500 mt-2">
              {selectedTags.length === 0 
                ? "Tous les kanjis seront inclus" 
                : `${selectedTags.length} tag(s) sélectionné(s)`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}