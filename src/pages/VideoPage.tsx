import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Eye,
  ThumbsUp,
  Calendar,
  Heart,
  Share2,
  ArrowLeft,
  User,
} from "lucide-react";
import {
  fetchVideo,
  fetchRelatedVideos,
  NormalizedVideo,
  formatViews,
  formatDate,
} from "../lib/youtube";
import VideoCard from "../components/VideoCard";
import WalletBar from "../components/WalletBar";
import { toggleFavorite, isFavorite } from "./FavoritesPage";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: () => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => { destroy: () => void };
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPageProps {
  videoId: string;
  onNavigate: (path: string) => void;
}

export default function VideoPage({ videoId, onNavigate }: VideoPageProps) {
  const [video, setVideo] = useState<NormalizedVideo | null>(null);
  const [related, setRelated] = useState<NormalizedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    setLoading(true);
    setVideo(null);
    setRelated([]);
    setShowFullDesc(false);

    Promise.all([fetchVideo(videoId), fetchRelatedVideos(videoId)]).then(([v, r]) => {
      setVideo(v);
      setRelated(r.filter((rv) => rv.id));
      if (v) setFavorited(isFavorite(v.id));
      setLoading(false);
    });
  }, [videoId]);

  useEffect(() => {
    if (!video || !playerContainerRef.current) return;

    const initPlayer = () => {
      if (!playerContainerRef.current) return;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: video.id,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [video]);

  const handleFavorite = () => {
    if (!video) return;
    const added = toggleFavorite(video);
    setFavorited(added);
  };

  const handleShare = async () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-400">Video not found</p>
        <button onClick={() => onNavigate("/")} className="text-red-400 hover:text-red-300 text-sm">
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <button
        onClick={() => onNavigate("/")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="xl:col-span-2">
          <WalletBar />
          {/* Player */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-5 shadow-2xl">
            <div ref={playerContainerRef} className="w-full h-full" />
          </div>

          {/* Video info */}
          <h1 className="text-xl font-bold text-white leading-snug mb-4">{video.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <button
              onClick={() => onNavigate(`/channel/${video.channelId}`)}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                <User className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                {video.channelTitle}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  favorited
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? "fill-white" : ""}`} />
                {favorited ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white text-sm font-medium transition-all duration-200"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-4 mb-5">
            <p className="text-white font-semibold mb-2">Tip créateur avec FRN</p>
            <p className="text-sm text-gray-300 mb-3">Token FRN Polygon: 0xbff1721bc1009E842eD701cD7AA72ecfbCBB29DA</p>
            <a href="https://polygonscan.com/token/0xbff1721bc1009E842eD701cD7AA72ecfbCBB29DA" target="_blank" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm inline-block">Envoyer un tip</a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-5 p-4 bg-white/3 rounded-xl border border-white/5">
            {video.viewCount && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Eye className="w-4 h-4 text-gray-500" />
                <span>{formatViews(video.viewCount)} views</span>
              </div>
            )}
            {video.likeCount && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ThumbsUp className="w-4 h-4 text-gray-500" />
                <span>{formatViews(video.likeCount)} likes</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{formatDate(video.publishedAt)}</span>
            </div>
            {video.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-4 h-4 text-gray-500 font-bold text-xs flex items-center justify-center">▶</span>
                <span>{video.duration}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {video.description && (
            <div className="bg-white/3 rounded-xl border border-white/5 p-4">
              <p className={`text-gray-400 text-sm leading-relaxed whitespace-pre-wrap ${!showFullDesc ? "line-clamp-4" : ""}`}>
                {video.description}
              </p>
              {video.description.length > 200 && (
                <button
                  onClick={() => setShowFullDesc((v) => !v)}
                  className="text-red-400 hover:text-red-300 text-sm mt-2 transition-colors"
                >
                  {showFullDesc ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Related videos */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-600 rounded-full" />
            Related Videos
          </h2>
          <div className="space-y-2">
            {related.map((rv) => (
              <VideoCard
                key={rv.id}
                video={rv}
                layout="list"
                onClick={(v) => onNavigate(`/video/${v.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
