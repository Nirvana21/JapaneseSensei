"use client";

import { useEffect, useState } from "react";

interface StorageInfo {
  quota?: number;
  usage?: number;
  persistent?: boolean;
}

export default function Home() {
  const [isOnline, setIsOnline] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({});

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

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full space-y-6">
        {/* Main Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Japanese Study
          </h1>
          <p className="text-lg text-blue-600 font-medium">Base PWA</p>
        </div>

        {/* Online/Offline Status Badge */}
        <div className="flex justify-center">
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isOnline
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {isOnline ? "🟢 Online" : "🔴 Offline"}
          </div>
        </div>

        {/* Storage Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Storage Status</h2>
          
          {/* Persistent Storage */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Persistent Storage:</span>
            <span
              className={`text-sm font-medium ${
                storageInfo.persistent ? "text-green-600" : "text-red-600"
              }`}
            >
              {storageInfo.persistent ? "✓ Granted" : "✗ Not Granted"}
            </span>
          </div>

          {/* Storage Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage Used:</span>
              <span className="text-sm font-mono">
                {formatBytes(storageInfo.usage)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage Quota:</span>
              <span className="text-sm font-mono">
                {formatBytes(storageInfo.quota)}
              </span>
            </div>

            {storageInfo.quota && storageInfo.usage && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Usage</span>
                  <span>
                    {((storageInfo.usage / storageInfo.quota) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
            )}
          </div>
        </div>

        {/* PWA Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            This is a Progressive Web App built with Next.js, TypeScript, and
            Tailwind CSS.
          </p>
          <p className="mt-2">
            Ready for deployment on Vercel with offline support.
          </p>
        </div>
      </div>
    </div>
  );
}
