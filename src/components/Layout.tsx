
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Camera, History, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/camera", icon: Camera, label: "Capture" },
    { path: "/history", icon: History, label: "History" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      <main className="flex-1 container max-w-md mx-auto px-4 pt-6 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-border/40 shadow-lg animate-slide-up">
        <div className="container max-w-md mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon 
                  size={24} 
                  className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`} 
                />
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-10 h-1 rounded-t-full bg-primary animate-fade-in" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
