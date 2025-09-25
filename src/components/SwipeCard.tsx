'use client';

import { useState, useRef, useEffect } from 'react';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  className?: string;
}

export default function SwipeCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onTap,
  className = '' 
}: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100; // Distance minimum pour déclencher un swipe
  const VERTICAL_THRESHOLD = 50; // Distance verticale max pour considérer comme swipe horizontal

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setStartY(clientY);
    setDragOffset(0);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Vérifier si c'est un mouvement horizontal (swipe) et non vertical (scroll)
    if (Math.abs(deltaY) > VERTICAL_THRESHOLD && Math.abs(deltaX) < 30) {
      // Si l'utilisateur fait un mouvement vertical, on considère que c'est un scroll
      // On arrête le drag
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    // Si c'est un mouvement horizontal, on suit
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDragOffset(deltaX);
    }
  };

  const handleEnd = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Vérifier si c'est un tap (pas de mouvement significatif)
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && onTap) {
      onTap();
    }
    // Sinon vérifier si c'est un swipe
    else if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaY) < VERTICAL_THRESHOLD) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset
    setIsDragging(false);
    setDragOffset(0);
  };

  // Événements souris
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    handleEnd(e.clientX, e.clientY);
  };

  // Événements tactiles
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleEnd(touch.clientX, touch.clientY);
  };

  // Gérer les événements globaux quand on drag
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      };

      const handleGlobalMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        handleEnd(e.clientX, e.clientY);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, startX, startY]);

  const getCardStyle = () => {
    const rotation = dragOffset * 0.1; // Légère rotation selon le drag
    const opacity = Math.max(0.7, 1 - Math.abs(dragOffset) / 300);

    return {
      transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
      opacity,
      transition: isDragging ? 'none' : 'all 0.3s ease-out',
      touchAction: 'none',
      userSelect: 'none' as const
    };
  };

  const getIndicatorOpacity = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      return Math.min(1, Math.abs(Math.min(0, dragOffset)) / SWIPE_THRESHOLD);
    } else {
      return Math.min(1, Math.abs(Math.max(0, dragOffset)) / SWIPE_THRESHOLD);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Indicateurs de swipe */}
      <div 
        className="absolute inset-0 flex items-center justify-start pl-8 pointer-events-none z-10"
        style={{ opacity: getIndicatorOpacity('left') }}
      >
        <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
          ❌ Pas connu
        </div>
      </div>

      <div 
        className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none z-10"
        style={{ opacity: getIndicatorOpacity('right') }}
      >
        <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">
          ✅ Connu
        </div>
      </div>

      {/* Carte principale */}
      <div
        ref={cardRef}
        className="bg-white rounded-xl shadow-lg cursor-grab active:cursor-grabbing"
        style={getCardStyle()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          👆 Appuyez pour révéler • 👈 Pas connu • 👉 Connu
        </p>
      </div>
    </div>
  );
}