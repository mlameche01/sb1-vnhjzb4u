import { X, Youtube, Zap, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("lumentv_welcome_dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("lumentv_welcome_dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">LumenTV</h2>
            <p className="text-gray-400 text-sm">Powered by YouTube</p>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          Welcome to LumenTV — a clean, distraction-free way to discover and watch YouTube content.
        </p>

        <div className="space-y-3 mb-6">
          {[
            { icon: <Zap className="w-4 h-4" />, text: "Browse trending videos from around the world" },
            { icon: <Search className="w-4 h-4" />, text: "Search any topic across YouTube's library" },
            { icon: <Heart className="w-4 h-4" />, text: "Save favorites to revisit anytime" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
              <span className="text-red-500 flex-shrink-0">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={dismiss}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
