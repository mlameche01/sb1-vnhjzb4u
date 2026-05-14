import { useEffect, useState, useCallback } from "react";
import { Loader2, Users, Video, Calendar, ChevronDown } from "lucide-react";
import { fetchChannel, fetchChannelVideos, YouTubeChannel, NormalizedVideo, formatViews, formatDate } from "../lib/youtube";
import VideoCard from "../components/VideoCard";

interface ChannelPageProps {
  channelId: string;
  onNavigate: (path: string) => void;
}

export default function ChannelPage({ channelId, onNavigate }: ChannelPageProps) {
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<NormalizedVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadVideos = useCallback(async (cid: string, pageToken?: string) => {
    const result = await fetchChannelVideos(cid, pageToken);
    setVideos((prev) => pageToken ? [...prev, ...result.videos] : result.videos);
    setNextPageToken(result.nextPageToken);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    setVideos([]);
    Promise.all([fetchChannel(channelId), fetchChannelVideos(channelId)]).then(([ch, vids]) => {
      setChannel(ch);
      setVideos(vids.videos);
      setNextPageToken(vids.nextPageToken);
      setLoading(false);
    });
  }, [channelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Channel not found
      </div>
    );
  }

  const banner = channel.brandingSettings?.image?.bannerExternalUrl;
  const avatar = channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url;

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 lg:h-56 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {banner && (
          <img src={`${banner}=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`} alt="" className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
      </div>

      {/* Channel info */}
      <div className="px-6 pb-8 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gray-800 border-4 border-gray-950 overflow-hidden flex-shrink-0 shadow-xl">
            {avatar ? (
              <img src={avatar} alt={channel.snippet.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <Users className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{channel.snippet.title}</h1>
            {channel.snippet.customUrl && (
              <p className="text-gray-500 text-sm">{channel.snippet.customUrl}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-2">
              {channel.statistics?.subscriberCount && (
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Users className="w-4 h-4 text-gray-500" />
                  {formatViews(channel.statistics.subscriberCount)} subscribers
                </span>
              )}
              {channel.statistics?.videoCount && (
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Video className="w-4 h-4 text-gray-500" />
                  {formatViews(channel.statistics.videoCount)} videos
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-gray-500" />
                Joined {formatDate(channel.snippet.publishedAt)}
              </span>
            </div>
          </div>
        </div>

        {channel.snippet.description && (
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl line-clamp-3 mb-8">
            {channel.snippet.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-6">
          <span className="w-1 h-5 bg-red-600 rounded-full" />
          <h2 className="text-lg font-semibold text-white">Videos</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onClick={(v) => onNavigate(`/video/${v.id}`)} />
          ))}
        </div>

        {nextPageToken && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => { setLoadingMore(true); loadVideos(channelId, nextPageToken); }}
              disabled={loadingMore}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
