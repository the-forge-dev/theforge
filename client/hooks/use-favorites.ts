import { useCallback, useState } from "react";

const STORAGE_KEY = "forge-favorites";

function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

// Favoritos guardados solo en este navegador (localStorage), sin cuenta ni backend.
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => readFavorites());

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // localStorage no disponible (modo privado, etc.) — el toggle solo dura la sesión
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((productId: string) => favorites.has(productId), [favorites]);

  return { isFavorite, toggleFavorite };
}
