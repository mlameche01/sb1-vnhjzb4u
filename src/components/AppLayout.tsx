import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import WelcomePopup from "./WelcomePopup";

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AppSidebar currentPath={currentPath} />
      <main className="lg:pl-60">
        <div className="pt-16 lg:pt-0 min-h-screen">
          {children}
        </div>
      </main>
      <WelcomePopup />
    </div>
  );
}
