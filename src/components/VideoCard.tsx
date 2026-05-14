import { Play, Eye, Clock } from "lucide-react";
import { NormalizedVideo, formatViews, formatDate } from "../lib/youtube";

interface VideoCardProps {
  video: NormalizedVideo;
  onClick: (video: NormalizedVideo) => void;
  layout?: "grid" | "list";
}

export default function VideoCard({ video, onClick, layout = "grid" }: VideoCardProps) {
  if (layout === "list") {
    return (
      <div
        onClick={() => onClick(video)}
        className="flex gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all duration-200"
      >
        <div className="relative flex-shrink-0 w-48 h-28 rounded-lg overflow-hidden bg-gray-800">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200">
              <Play className="w-4 h-4 text-gray-900 fill-gray-900 ml-0.5" />
            </div>
          </div>
          {video.duration && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
              {video.duration}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-white font-medium text-sm line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-gray-400 text-xs mt-1.5 font-medium">{video.channelTitle}</p>
          <div className="flex items-center gap-3 mt-2 text-gray-500 text-xs">
            {video.viewCount && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(video.viewCount)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(video.publishedAt)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(video)}
      className="group cursor-pointer"
    >
      <div className="relative rounded-xl overflow-hidden bg-gray-800 aspect-video mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200 shadow-2xl">
            <Play className="w-6 h-6 text-gray-900 fill-gray-900 ml-0.5" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium">
            {video.duration}
          </span>
        )}
      </div>
      <div className="px-1">
        <h3 className="text-white font-medium text-sm line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-gray-400 text-xs mt-1.5 font-medium hover:text-gray-300 cursor-pointer">
          {video.channelTitle}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-gray-500 text-xs">
          {video.viewCount && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViews(video.viewCount)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(video.publishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
