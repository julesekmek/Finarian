/**
 * BottomNavigation component - Mobile bottom navigation bar
 * Fixed navigation at the bottom of the screen for mobile devices
 */

import { motion } from "framer-motion";
import { LayoutDashboard, FolderKanban, BarChart3, LogOut } from "lucide-react";

export default function BottomNavigation({
  currentPage,
  onPageChange,
  onSignOut,
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "categories", label: "Catégories", icon: FolderKanban },
    { id: "performance", label: "Performance", icon: BarChart3 },
    { id: "logout", label: "Déconnexion", icon: LogOut, action: onSignOut },
  ];

  const handleNavClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      onPageChange(item.id);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-dark-card border-t border-border-subtle safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id && !item.action;
          const isLogoutButton = item.id === "logout";

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item)}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all flex-1 ${
                isActive
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span
                className={`text-xs font-medium ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
