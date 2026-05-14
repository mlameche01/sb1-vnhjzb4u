import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { searchVideos, NormalizedVideo } from "../lib/youtube";
import VideoCard from "../components/VideoCard";

interface SearchPageProps {
  query: string;
  onNavigate: (path: string) => void;
  onSearch: (q: string) => void;
}

export default function SearchPage({ query, onNavigate, onSearch }: SearchPageProps) {
  const [input, setInput] = useState(query);
  const [videos, setVideos] = useState<NormalizedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  const doSearch = useCallback(async (q: string, pageToken?: string) => {
    if (!q.trim()) return;
    if (!pageToken) setLoading(true);
    try {
      const educationalQuery = `${q} education français apprentissage`;
      const result = await searchVideos(educationalQuery, pageToken);
      setVideos((prev) => pageToken ? [...prev, ...result.videos] : result.videos);
      setNextPageToken(result.nextPageToken);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (query) {
      setInput(query);
      setVideos([]);
      doSearch(query);
    }
  }, [query, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSearch(input.trim());
  };

  const handleLoadMore = () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    doSearch(query, nextPageToken);
  };

  return (
    <div className="px-6 py-8">
      <div className="max-w-2xl mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">Search</h1>
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Recherche éducative française..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all duration-200"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        </div>
      )}

      {!loading && query && videos.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No results for "{query}"</p>
        </div>
      )}

      {!loading && !query && (
        <div className="text-center py-20 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Recherche optimisée pour le contenu éducatif français</p>
        </div>
      )}

      {videos.length > 0 && (
        <>
          <p className="text-gray-500 text-sm mb-6">
            Results for <span className="text-white font-medium">"{query}"</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={(v) => onNavigate(`/video/${v.id}`)}
              />
            ))}
          </div>

          {nextPageToken && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
