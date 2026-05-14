import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    let apiUrl = "";

    if (action === "trending") {
      const regionCode = url.searchParams.get("regionCode") || "US";
      const pageToken = url.searchParams.get("pageToken") || "";
      apiUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${regionCode}&maxResults=24&key=${apiKey}`;
      if (pageToken) apiUrl += `&pageToken=${pageToken}`;
    } else if (action === "search") {
      const q = url.searchParams.get("q") || "";
      const pageToken = url.searchParams.get("pageToken") || "";
      apiUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=24&key=${apiKey}`;
      if (pageToken) apiUrl += `&pageToken=${pageToken}`;
    } else if (action === "video") {
      const id = url.searchParams.get("id") || "";
      apiUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${id}&key=${apiKey}`;
    } else if (action === "channel") {
      const id = url.searchParams.get("id") || "";
      apiUrl = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&id=${id}&key=${apiKey}`;
    } else if (action === "channel_videos") {
      const id = url.searchParams.get("id") || "";
      const pageToken = url.searchParams.get("pageToken") || "";
      apiUrl = `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${id}&type=video&order=date&maxResults=24&key=${apiKey}`;
      if (pageToken) apiUrl += `&pageToken=${pageToken}`;
    } else if (action === "related") {
      const id = url.searchParams.get("id") || "";
      // YouTube removed relatedToVideoId from v3, use search with video topic instead
      apiUrl = `${YOUTUBE_API_BASE}/search?part=snippet&relatedToVideoId=${id}&type=video&maxResults=12&key=${apiKey}`;
    } else if (action === "categories") {
      const regionCode = url.searchParams.get("regionCode") || "US";
      apiUrl = `${YOUTUBE_API_BASE}/videoCategories?part=snippet&regionCode=${regionCode}&key=${apiKey}`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
