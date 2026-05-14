import { useEffect, useState, useCallback } from "react";
import { TrendingUp, Loader2, ChevronDown } from "lucide-react";
import { fetchTrending, NormalizedVideo } from "../lib/youtube";
import VideoCard from "../components/VideoCard";

interface IndexProps {
  onNavigate: (path: string) => void;
}

export default function Index({ onNavigate }: IndexProps) {
  const [videos, setVideos] = useState<NormalizedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pageToken?: string) => {
    try {
      const result = await fetchTrending("US", pageToken);
      setVideos((prev) => pageToken ? [...prev, ...result.videos] : result.videos);
      setNextPageToken(result.nextPageToken);
    } catch {
      setError("Failed to load trending videos. Check that your YouTube API key is configured.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleVideoClick = (video: NormalizedVideo) => {
    onNavigate(`/video/${video.id}`);
  };

  const handleLoadMore = () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    load(nextPageToken);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          <p className="text-gray-400 text-sm">Loading trending videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Trending</h1>
          <p className="text-gray-500 text-sm">Most popular videos right now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onClick={handleVideoClick} />
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
    </div>
  );
}
