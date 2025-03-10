// src/components/preview.tsx
'use client';

import { useRef, useEffect } from 'react';
import { GameGenerator, GameConfig } from '@/app/services/gamegenerator'; // Korrigierte Importanweisung

interface PreviewProps {
  gameConfig?: GameConfig | null;
  isLoading: boolean;
}

export default function Preview({ gameConfig, isLoading }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameGenerator | null>(null);

  useEffect(() => {
    // Clean up previous game instance
    if (gameRef.current) {
      gameRef.current.cleanup();
      gameRef.current = null;
    }

    // Initialize new game if config is provided
    if (gameConfig && containerRef.current) {
      gameRef.current = new GameGenerator(containerRef.current, gameConfig);
      gameRef.current.initialize();
    }

    // Clean up on component unmount
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