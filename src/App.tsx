import { useCallback, useEffect, useState } from "react";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import VideoPage from "./pages/VideoPage";
import SearchPage from "./pages/SearchPage";
import ChannelPage from "./pages/ChannelPage";
import FavoritesPage from "./pages/FavoritesPage";
import FavoriteChannelsPage from "./pages/FavoriteChannelsPage";

function parsePath(pathname: string, search: string) {
  if (pathname === "/" || pathname === "") return { route: "search", param: "education france" };
  if (pathname === "/search") return { route: "search", param: new URLSearchParams(search).get("q") || "" };
  if (pathname.startsWith("/video/")) return { route: "video", param: pathname.replace("/video/", "") };
  if (pathname.startsWith("/channel/")) return { route: "channel", param: pathname.replace("/channel/", "") };
  if (pathname === "/favorites") return { route: "favorites", param: "" };
  if (pathname === "/channels") return { route: "channels", param: "" };
  return { route: "home", param: "" };
}

export default function App() {
  const [location, setLocation] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
  });

  useEffect(() => {
    const handler = () =>
      setLocation({ pathname: window.location.pathname, search: window.location.search });
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const handleSearch = useCallback(
    (q: string) => navigate(`/search?q=${encodeURIComponent(q)}`),
    [navigate]
  );

  const { route, param } = parsePath(location.pathname, location.search);

  const renderPage = () => {
    switch (route) {
      case "video":
        return <VideoPage videoId={param} onNavigate={navigate} />;
      case "search":
        return (
          <SearchPage
            query={new URLSearchParams(location.search).get("q") || ""}
            onNavigate={navigate}
            onSearch={handleSearch}
          />
        );
      case "channel":
        return <ChannelPage channelId={param} onNavigate={navigate} />;
      case "favorites":
        return <FavoritesPage onNavigate={navigate} />;
      case "channels":
        return <FavoriteChannelsPage onNavigate={navigate} />;
      default:
        return <SearchPage query="education france" onNavigate={navigate} onSearch={handleSearch} />;
    }
  };

  return <AppLayout currentPath={location.pathname}>{renderPage()}</AppLayout>;
}
