const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube`;

const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export interface YouTubeThumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface YouTubeSnippet {
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  thumbnails: {
    default?: YouTubeThumbnail;
    medium?: YouTubeThumbnail;
    high?: YouTubeThumbnail;
    standard?: YouTubeThumbnail;
    maxres?: YouTubeThumbnail;
  };
  tags?: string[];
  categoryId?: string;
}

export interface YouTubeStatistics {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  subscriberCount?: string;
  videoCount?: string;
}

export interface YouTubeContentDetails {
  duration?: string;
}

export interface YouTubeVideo {
  id: string;
  snippet: YouTubeSnippet;
  statistics?: YouTubeStatistics;
  contentDetails?: YouTubeContentDetails;
}

export interface YouTubeSearchItem {
  id: { videoId?: string; channelId?: string };
  snippet: YouTubeSnippet;
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
    };
    country?: string;
  };
  statistics?: YouTubeStatistics;
  brandingSettings?: {
    image?: { bannerExternalUrl?: string };
  };
}

export interface YouTubeListResponse<T> {
  items?: T[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo?: { totalResults: number; resultsPerPage: number };
}

function getThumbnail(video: YouTubeVideo | YouTubeSearchItem): string {
  const t = video.snippet.thumbnails;
  return (
    t.maxres?.url ||
    t.standard?.url ||
    t.high?.url ||
    t.medium?.url ||
    t.default?.url ||
    `https://img.youtube.com/vi/${getVideoId(video)}/hqdefault.jpg`
  );
}

function getVideoId(video: YouTubeVideo | YouTubeSearchItem): string {
  if ("statistics" in video || typeof video.id === "string") {
    return video.id as string;
  }
  return (video as YouTubeSearchItem).id.videoId || "";
}

export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatViews(count?: string): string {
  if (!count) return "0";
  const n = parseInt(count);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export interface NormalizedVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  likeCount?: string;
  duration?: string;
}

export function normalizeVideo(v: YouTubeVideo): NormalizedVideo {
  return {
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    thumbnail: getThumbnail(v),
    channelId: v.snippet.channelId,
    channelTitle: v.snippet.channelTitle,
    publishedAt: v.snippet.publishedAt,
    viewCount: v.statistics?.viewCount,
    likeCount: v.statistics?.likeCount,
    duration: v.contentDetails?.duration ? formatDuration(v.contentDetails.duration) : undefined,
  };
}

export function normalizeSearchItem(item: YouTubeSearchItem): NormalizedVideo {
  return {
    id: item.id.videoId || "",
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: getThumbnail(item),
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  };
}

async function callApi<T>(params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${EDGE_FUNCTION_URL}?${query}`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchTrending(regionCode = "US", pageToken?: string) {
  const params: Record<string, string> = { action: "trending", regionCode };
  if (pageToken) params.pageToken = pageToken;
  const data = await callApi<YouTubeListResponse<YouTubeVideo>>(params);
  return {
    videos: (data.items || []).map(normalizeVideo),
    nextPageToken: data.nextPageToken,
  };
}

export async function searchVideos(q: string, pageToken?: string) {
  const params: Record<string, string> = { action: "search", q };
  if (pageToken) params.pageToken = pageToken;
  const data = await callApi<YouTubeListResponse<YouTubeSearchItem>>(params);
  return {
    videos: (data.items || []).map(normalizeSearchItem),
    nextPageToken: data.nextPageToken,
  };
}

export async function fetchVideo(id: string): Promise<NormalizedVideo | null> {
  const data = await callApi<YouTubeListResponse<YouTubeVideo>>({ action: "video", id });
  const item = data.items?.[0];
  return item ? normalizeVideo(item) : null;
}

export async function fetchChannel(id: string): Promise<YouTubeChannel | null> {
  const data = await callApi<YouTubeListResponse<YouTubeChannel>>({ action: "channel", id });
  return data.items?.[0] || null;
}

export async function fetchChannelVideos(id: string, pageToken?: string) {
  const params: Record<string, string> = { action: "channel_videos", id };
  if (pageToken) params.pageToken = pageToken;
  const data = await callApi<YouTubeListResponse<YouTubeSearchItem>>(params);
  return {
    videos: (data.items || []).map(normalizeSearchItem),
    nextPageToken: data.nextPageToken,
  };
}

export async function fetchRelatedVideos(id: string) {
  const data = await callApi<YouTubeListResponse<YouTubeSearchItem>>({ action: "related", id });
  return (data.items || []).map(normalizeSearchItem);
}
