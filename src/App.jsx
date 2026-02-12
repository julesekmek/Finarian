/**
 * App component - Application principale avec sidebar
 * Gère l'authentification et le routing avec menu latéral
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";
import { authService } from "@/services/authService";
import { assetService } from "@/services/assetService";
import Auth from "@/components/Auth";
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/BottomNavigation";
import PortfolioChart from "@/components/PortfolioChart";
import AddAssetForm from "@/components/AddAssetForm";
import Performance from "@/components/Performance";
import CategoryEvolution from "@/components/CategoryEvolution";
import CategoryPieChart from "@/components/CategoryPieChart";
import CategoryDetail from "@/components/CategoryDetail";
import AIRecommendation from "@/components/AIRecommendation";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Monitor auth state changes
  useEffect(() => {
    authService.getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch assets for Header totals
  const fetchAssets = async () => {
    if (!user) {
      setAssets([]);
      return;
    }

    try {
      const data = await assetService.fetchAssets(user.id);
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  // Fetch assets and subscribe to realtime updates
  useEffect(() => {
    if (!user) {
      setAssets([]);
      return;
    }

    fetchAssets();

    const channel = assetService.subscribeToAssets(user.id, () => {
      fetchAssets();
    });

    return () => {
      assetService.removeChannel(channel);
    };
  }, [user]);

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // Handle back from category detail
  const handleBackFromCategory = () => {
    setSelectedCategory(null);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedCategory(null);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Loading state with modern spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-sm">
            Chargement de votre portefeuille...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />;
  }

  // Main dashboard with sidebar
  return (
    <div className="min-h-screen bg-gradient-dark flex">
      {/* Background decorative gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-beige/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        userEmail={user.email}
        onPricesUpdated={fetchAssets}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        {/* Page Content */}
        <main className="flex-1 px-4 md:px-8 py-6 w-full pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {/* Dashboard */}
              {currentPage === "dashboard" && !selectedCategory && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Portfolio Chart */}
                  <PortfolioChart userId={user.id} />

                  {/* Category Pie Chart - Dashboard Only */}
                  <CategoryPieChart
                    assets={assets}
                    onCategoryClick={handleCategoryClick}
                  />

                  {/* Floating Add Button */}
                  <AddAssetForm userId={user.id} assets={assets} />

                  {/* Logout Button - Mobile Only */}
                  <div className="md:hidden pt-4 pb-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Se déconnecter
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Categories Page */}
              {currentPage === "categories" && !selectedCategory && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CategoryEvolution
                    assets={assets}
                    onCategoryClick={handleCategoryClick}
                  />
                </motion.div>
              )}

              {/* Category Detail */}
              {selectedCategory && (
                <motion.div
                  key="category-detail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CategoryDetail
                    categoryName={selectedCategory}
                    assets={assets}
                    onBack={handleBackFromCategory}
                  />
                </motion.div>
              )}

              {/* Performance Page */}
              {currentPage === "performance" && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Performance userId={user.id} assets={assets} />
                </motion.div>
              )}

              {/* AI Recommendation Page */}
              {currentPage === "ai-recommendation" && (
                <motion.div
                  key="ai-recommendation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AIRecommendation userId={user.id} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
