"use client";

import { useState, useEffect } from "react";
import AddKanjiForm from "@/components/AddKanjiForm";
import KanjiList from "@/components/KanjiList";
import EditKanjiModal from "@/components/EditKanjiModal";
import { useKanjis } from "@/hooks/useKanjis";
import { KanjiEntry } from "@/types/kanji";
import { KanjiStorageService } from "@/services/kanjiStorage";

interface StorageInfo {
  quota?: number;
  usage?: number;
  persistent?: boolean;
}

export default function Home() {
  const [isOnline, setIsOnline] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({});
  const [editingKanji, setEditingKanji] = useState<KanjiEntry | null>(null);
  const [stats, setStats] = useState<{
    totalKanjis: number;
    studiedKanjis: number;
    averageCorrectRate: number;
    lastStudyDate?: Date;
  } | null>(null);

  const { kanjis, loading, error, updateKanji, deleteKanji, refreshKanjis } = useKanjis();

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check persistent storage and quota
    const checkStorage = async () => {
      try {
        // Check if persistent storage is granted
        const persistent = await navigator.storage.persist();
        
        // Get storage estimate
        if ('estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          setStorageInfo({
            quota: estimate.quota,
            usage: estimate.usage,
            persistent,
          });
        }
      } catch (error) {
        console.error('Storage API not supported:', error);
      }
    };

    checkStorage();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load statistics when kanjis change
  useEffect(() => {
    const loadStats = async () => {
      const kanjiStats = await KanjiStorageService.getStats();
      setStats(kanjiStats);
    };
    
    if (!loading) {
      loadStats();
    }
  }, [kanjis, loading]);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Japanese Sensei 🇯🇵
              </h1>
              <p className="text-gray-600">Votre assistant d&apos;apprentissage des kanjis</p>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-4">
              {/* Online/Offline Status */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isOnline
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isOnline ? "🟢 Online" : "🔴 Offline"}
              </div>
              
              {/* Storage Status */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  storageInfo.persistent 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                📱 {storageInfo.persistent ? "Stockage persistant" : "Stockage temporaire"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalKanjis}</div>
              <div className="text-sm text-gray-600">Kanjis dans votre collection</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.studiedKanjis}</div>
              <div className="text-sm text-gray-600">Kanjis étudiés</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageCorrectRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taux de réussite</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-orange-600">
                {formatBytes(storageInfo.usage)}
              </div>
              <div className="text-sm text-gray-600">Stockage utilisé</div>
            </div>
          </div>
        )}

        {/* Add Kanji Form */}
        <AddKanjiForm onKanjiAdded={handleKanjiAdded} />

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Kanji List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Votre collection de kanjis
          </h2>
          <KanjiList
            kanjis={kanjis}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Storage Details (Expandable) */}
        {storageInfo.quota && storageInfo.usage && (
          <details className="bg-white rounded-lg shadow-sm p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              📊 Détails du stockage
            </summary>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Utilisé :</span>
                <span className="font-mono">{formatBytes(storageInfo.usage)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quota total :</span>
                <span className="font-mono">{formatBytes(storageInfo.quota)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pourcentage :</span>
                <span>
                  {((storageInfo.usage / storageInfo.quota) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (storageInfo.usage / storageInfo.quota) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </details>
        )}
      </main>

      {/* Edit Modal */}
      <EditKanjiModal
        kanji={editingKanji}
        isOpen={!!editingKanji}
        onClose={() => setEditingKanji(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
