import { Heart, Trash2 } from "lucide-react";
import { NormalizedVideo } from "../lib/youtube";
import VideoCard from "../components/VideoCard";

interface FavoritesPageProps {
  onNavigate: (path: string) => void;
}

export function getFavorites(): NormalizedVideo[] {
  try {
    return JSON.parse(localStorage.getItem("lumentv_favorites") || "[]");
  } catch {
    return [];
  }
}

export function toggleFavorite(video: NormalizedVideo): boolean {
  const favs = getFavorites();
  const exists = favs.some((f) => f.id === video.id);
  if (exists) {
    localStorage.setItem("lumentv_favorites", JSON.stringify(favs.filter((f) => f.id !== video.id)));
    return false;
  } else {
    localStorage.setItem("lumentv_favorites", JSON.stringify([video, ...favs]));
    return true;
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const favorites = getFavorites();

  const handleClearAll = () => {
    if (confirm("Remove all favorites?")) {
      localStorage.removeItem("lumentv_favorites");
      window.location.reload();
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Favorites</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Heart className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium text-gray-400">No favorites yet</p>
          <p className="text-sm mt-1">Save videos you love to watch them later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Favorites</h1>
            <p className="text-gray-500 text-sm">{favorites.length} saved video{favorites.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={(v) => onNavigate(`/video/${v.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
