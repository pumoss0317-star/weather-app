import type { SavedCity } from "@/lib/city-storage";

interface FavoriteCitiesProps {
  favorites: SavedCity[];
  onSelect: (city: SavedCity) => void;
  onRemove: (city: SavedCity) => void;
}

export default function FavoriteCities({ favorites, onSelect, onRemove }: FavoriteCitiesProps) {
  if (favorites.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {favorites.map((city) => (
        <span
          key={`${city.name}-${city.country}`}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white pl-3 pr-1 py-1 text-xs text-zinc-700"
        >
          <button type="button" onClick={() => onSelect(city)} className="hover:text-sky-600">
            ★ {city.name}
          </button>
          <button
            type="button"
            onClick={() => onRemove(city)}
            aria-label={`${city.name}をお気に入りから削除`}
            className="rounded-full px-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
