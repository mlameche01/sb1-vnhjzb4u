import { Home, Search, Heart, TrendingUp, Youtube, Menu, X } from "lucide-react";
import { useState } from "react";
import NavLink from "./NavLink";

interface AppSidebarProps {
  currentPath: string;
}

export default function AppSidebar({ currentPath }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { href: "/trending", label: "Trending", icon: <TrendingUp className="w-5 h-5" /> },
    { href: "/search", label: "Search", icon: <Search className="w-5 h-5" /> },
    { href: "/favorites", label: "Favorites", icon: <Heart className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-6 mb-2">
        <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30">
          <Youtube className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg leading-none">LumenTV</span>
          <span className="block text-gray-500 text-xs mt-0.5">YouTube Browser</span>
        </div>
      </div>

      <div className="px-2 flex-1 space-y-1">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider px-4 mb-3">
          Navigation
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            active={currentPath === item.href}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="px-4 py-4 border-t border-white/5">
        <p className="text-gray-600 text-xs text-center">Powered by YouTube Data API</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-950 border-r border-white/5 fixed left-0 top-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-950/95 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Youtube className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold">LumenTV</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-gray-950 border-r border-white/5 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
