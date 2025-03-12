// src/components/preview.tsx
'use client';

import { useRef, useEffect } from 'react';
import { GameGenerator, GameConfig } from '@/app/services/gameGenerator';

interface PreviewProps {
  gameConfig?: GameConfig | null;
  isLoading: boolean;
}

export default function Preview({ gameConfig, isLoading }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameGenerator | null>(null);

    useEffect(() => {
    // Ensure game is only initialized on the client side
    if (typeof window !== 'undefined') {
      // Cleanup any previous game instance
      if (gameRef.current) {
        gameRef.current.cleanup();
        gameRef.current = null;
      }

      // Initialize the game if gameConfig is provided
      if (gameConfig && containerRef.current) {
        gameRef.current = new GameGenerator(containerRef.current, gameConfig);
        gameRef.current.initialize();
      }
    }

    // Cleanup when the component is unmounted
    return () => {
      if (gameRef.current) {
        gameRef.current.cleanup();
      }
    };
  }, [gameConfig]);

  return (
    <div className="card h-full">
      <h2 className="text-2xl font-semibold mb-4 text-light-slate">Live Preview</h2>
      <div className="bg-black rounded-md h-64 flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="text-slate-blue">Generating preview...</div>
        ) : gameConfig ? (
          <div ref={containerRef} className="w-full h-full"></div>
        ) : (
          <p className="text-slate-blue text-center">
            Your app preview will appear here
          </p>
        )}
      </div>
    </div>
  );
}
