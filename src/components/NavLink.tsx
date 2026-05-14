import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export default function NavLink({ href, children, icon, active, onClick }: NavLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon && <span className="w-5 h-5 flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </a>
  );
}
