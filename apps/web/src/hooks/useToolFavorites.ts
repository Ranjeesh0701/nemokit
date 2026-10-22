import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'nemokit:favorites';
const RECENTS_KEY = 'nemokit:recents';

const DEFAULT_FAVORITES = ['json-formatter', 'diff-tool', 'curl-converter', 'password-tool'];

export function useToolFavorites(activeToolId?: string) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_FAVORITES;
    } catch {
      return DEFAULT_FAVORITES;
    }
  });

  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track recents whenever activeToolId changes
  useEffect(() => {
    if (!activeToolId || activeToolId === 'dashboard' || activeToolId === 'home') return;

    setRecents(prev => {
      const filtered = prev.filter(id => id !== activeToolId);
      const next = [activeToolId, ...filtered].slice(0, 5); // Keep top 5 recents
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [activeToolId]);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites(prev => {
      const next = prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => {
      return favorites.includes(toolId);
    },
    [favorites]
  );

  const clearAllData = useCallback(() => {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(RECENTS_KEY);
      setFavorites(DEFAULT_FAVORITES);
      setRecents([]);
    } catch {
      // ignore
    }
  }, []);

  return {
    favorites,
    recents,
    toggleFavorite,
    isFavorite,
    clearAllData,
  };
}
