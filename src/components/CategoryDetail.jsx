import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  calculateAssetMetrics,
  calculateCategoryMetrics,
} from "../utils/calculations";
import { assetService } from "../services/assetService";
import { authService } from "../services/authService";
import { getLiveQuotes } from "../services/priceService";
import EditAssetModal from "./EditAssetModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

// Colors for pie chart
const COLORS = [
  "#F1C086", // accent-primary
  "#60A5FA", // blue-400
  "#34D399", // green-400
  "#F87171", // red-400
  "#A78BFA", // purple-400
  "#FBBF24", // yellow-400
  "#FB923C", // orange-400
  "#EC4899", // pink-400
  "#14B8A6", // teal-400
  "#F472B6", // pink-300
];

// Component to handle savings yield input and calculation
const SavingsYieldControl = ({ asset }) => {
  const [apy, setApy] = useState(asset.apy || 0);

  // Update local state when prop changes (from DB update)
  useEffect(() => {
    setApy(asset.apy || 0);
  }, [asset.apy]);

  const handleBlur = async () => {
    const newApy = parseFloat(apy);
    const oldApy = parseFloat(asset.apy || 0);

    if (!isNaN(newApy) && newApy !== oldApy) {
      try {
        await assetService.updateAsset(asset.id, { apy: newApy });
      } catch (error) {
        console.error("Error updating APY:", error);
      }
    }
  };

  const annualYield =
    asset.metrics.totalCurrentValue * (parseFloat(apy || 0) / 100);
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysElapsed = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const accrued = annualYield * (daysElapsed / 365);

  return (
    <div className="flex items-center gap-4 bg-dark-bg/30 p-3 rounded-lg border border-border-subtle mt-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-muted">Rendement annuel</label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            min="0"
            value={apy}
            onChange={(e) => setApy(e.target.value)}
            onBlur={handleBlur}
            className="w-24 px-3 py-1.5 bg-dark-card border border-border-subtle rounded-lg text-sm text-text-primary focus:border-accent-primary focus:outline-none text-right pr-7 transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
            %
          </span>
        </div>
      </div>

      <div className="h-8 w-px bg-border-subtle"></div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-muted">
          Rendement acquis (YTD)
        </label>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-accent-green text-sm">
            +{formatCurrency(accrued)}
          </span>
          <span className="text-[10px] text-text-muted">
            ({daysElapsed} jours)
          </span>
        </div>
      </div>
    </div>
  );
};

export default function CategoryDetail({ categoryName, assets, onBack }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("value");
  const [sortDirection, setSortDirection] = useState("desc");
  const [liveQuotes, setLiveQuotes] = useState({});

  // Filter assets for this category
  const categoryAssets = useMemo(
    () => assets.filter((asset) => asset.category === categoryName),
    [assets, categoryName]
  );

  // Fetch live quotes for assets with symbols
  useEffect(() => {
    const fetchLiveQuotes = async () => {
      const symbols = categoryAssets
        .filter((a) => a.symbol && a.symbol.trim() !== "")
        .map((a) => a.symbol);

      if (symbols.length === 0) return;

      try {
        const session = await authService.getSession();
        const data = await getLiveQuotes(symbols, session);
        setLiveQuotes(data);
      } catch (error) {
        console.error("Error fetching live quotes:", error);
      }
    };

    fetchLiveQuotes();
  }, [categoryAssets]);

  // Calculate category totals using centralized utility
  const categoryMetrics = calculateCategoryMetrics(categoryAssets)[0] || {
    totalInvested: 0,
    totalCurrent: 0,
    totalGain: 0,
    gainPercent: 0,
    isPositive: false,
  };

  const { totalInvested, totalCurrent, totalGain, gainPercent, isPositive } =
    categoryMetrics;

  // Enrich assets with their individual metrics
  const enrichedAssets = categoryAssets.map((asset) => ({
    ...asset,
    metrics: calculateAssetMetrics(asset),
  }));

  // Check if this category contains manual assets (no symbol)
  const hasManualAssets = enrichedAssets.some((asset) => !asset.symbol);

  // Calculate total accrued yield for manual assets (without symbol)
  const totalAccruedYield = hasManualAssets
    ? enrichedAssets.reduce((sum, asset) => {
        if (asset.symbol) return sum; // Skip market assets
        const apy = parseFloat(asset.apy || 0);
        const annualYield = asset.metrics.totalCurrentValue * (apy / 100);
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const daysElapsed = Math.floor(
          (now - startOfYear) / (1000 * 60 * 60 * 24)
        );
        return sum + annualYield * (daysElapsed / 365);
      }, 0)
    : 0;

  // Helper to aggregate data by key
  const aggregateData = (assets, key) => {
    const data = {};
    let total = 0;
    assets.forEach((asset) => {
      const label = asset[key] || "Non renseigné";
      const value = asset.metrics.totalCurrentValue;
      data[label] = (data[label] || 0) + value;
      total += value;
    });
    return Object.entries(data)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const regionData = aggregateData(enrichedAssets, "region");
  const sectorData = aggregateData(enrichedAssets, "sector");

  // Filter assets by search query
  const filteredAssets = enrichedAssets.filter((asset) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchesName = asset.name.toLowerCase().includes(query);
    const matchesSymbol = asset.symbol?.toLowerCase().includes(query);

    return matchesName || matchesSymbol;
  });

  // Sort filtered assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "value":
        aValue = a.metrics.totalCurrentValue;
        bValue = b.metrics.totalCurrentValue;
        break;
      case "performance":
        aValue = a.metrics.unrealizedGain;
        bValue = b.metrics.unrealizedGain;
        break;
      case "quantity":
        aValue = a.metrics.quantity;
        bValue = b.metrics.quantity;
        break;
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      default:
        return 0;
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  // Toggle sort direction
  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortDirection("desc");
    }
  };

  // Modal handlers
  const handleOpenEdit = (asset) => {
    setSelectedAsset(asset);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedAsset(null);
  };

  const handleSaveEdit = () => {
    // No need to manually update - realtime subscription in App.jsx will handle it
    handleCloseEdit();
  };

  const handleOpenDelete = (asset) => {
    setSelectedAsset(asset);
    setShowDeleteModal(true);
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setSelectedAsset(null);
  };

  const handleConfirmDelete = () => {
    // No need to manually update - realtime subscription in App.jsx will handle it
    handleCloseDelete();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <h1 className="text-3xl font-bold text-text-primary mb-6 capitalize">
          {categoryName}
        </h1>

        {/* Category Totals */}
        <div
          className={`grid grid-cols-2 ${
            hasManualAssets ? "sm:grid-cols-5" : "sm:grid-cols-4"
          } gap-3`}
        >
          <div className="bg-dark-hover rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
              Investi
            </p>
            <p className="text-xl font-bold text-text-secondary">
              {formatCurrency(totalInvested)}
            </p>
          </div>

          <div className="bg-dark-hover rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
              Valeur actuelle
            </p>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(totalCurrent)}
            </p>
          </div>

          <div className="bg-dark-hover rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
              Variation
            </p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-accent-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-accent-red" />
              )}
              <p
                className={`text-xl font-bold ${
                  isPositive ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(totalGain)}
              </p>
            </div>
          </div>

          <div className="bg-dark-hover rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
              Performance
            </p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-accent-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-accent-red" />
              )}
              <p
                className={`text-xl font-bold ${
                  isPositive ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {isPositive ? "+" : ""}
                {gainPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* New Card for Manual Assets - YTD Yield */}
          {hasManualAssets && (
            <div className="bg-dark-hover rounded-xl p-4">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                Rendement YTD
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-accent-green" />
                <p className="text-xl font-bold text-accent-green">
                  +{formatCurrency(totalAccruedYield)}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pie Charts - Region and Sector Distribution */}
      {enrichedAssets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Region Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-accent-primary" />
              Répartition Géographique
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-64 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={800}
                    >
                      {regionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0];
                          return (
                            <div className="bg-dark-card border border-border-subtle px-4 py-3 rounded-xl shadow-card">
                              <p className="text-sm font-semibold text-text-primary mb-1">
                                {data.payload.name}
                              </p>
                              <p className="text-lg font-bold text-accent-primary">
                                {formatCurrency(data.value)}
                              </p>
                              <p className="text-xs text-text-muted">
                                {data.payload.percentage.toFixed(2)}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-2 max-h-64 overflow-y-auto pr-2">
                {regionData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-dark-hover rounded-lg hover:bg-dark-hover/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-xs text-text-primary truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="text-xs font-semibold text-text-primary">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sector Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-accent-secondary" />
              Répartition Sectorielle
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-64 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={800}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[(index + 5) % COLORS.length]} // Offset colors for variety
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0];
                          return (
                            <div className="bg-dark-card border border-border-subtle px-4 py-3 rounded-xl shadow-card">
                              <p className="text-sm font-semibold text-text-primary mb-1">
                                {data.payload.name}
                              </p>
                              <p className="text-lg font-bold text-accent-primary">
                                {formatCurrency(data.value)}
                              </p>
                              <p className="text-xs text-text-muted">
                                {data.payload.percentage.toFixed(2)}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-2 max-h-64 overflow-y-auto pr-2">
                {sectorData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-dark-hover rounded-lg hover:bg-dark-hover/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[(index + 5) % COLORS.length],
                        }}
                      />
                      <span className="text-xs text-text-primary truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="text-xs font-semibold text-text-primary">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-accent-primary" />
          Actifs ({enrichedAssets.length})
        </h2>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un actif (nom, symbole)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-hover border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary text-sm"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-text-secondary font-medium self-center">
            Trier par :
          </span>
          <button
            onClick={() => handleSort("value")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              sortBy === "value"
                ? "bg-accent-primary text-white shadow-glow-primary"
                : "bg-dark-hover text-text-secondary hover:bg-dark-hover/80"
            }`}
          >
            Valeur
            {sortBy === "value" && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => handleSort("performance")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              sortBy === "performance"
                ? "bg-accent-primary text-white shadow-glow-primary"
                : "bg-dark-hover text-text-secondary hover:bg-dark-hover/80"
            }`}
          >
            Performance
            {sortBy === "performance" && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => handleSort("quantity")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              sortBy === "quantity"
                ? "bg-accent-primary text-white shadow-glow-primary"
                : "bg-dark-hover text-text-secondary hover:bg-dark-hover/80"
            }`}
          >
            Quantité
            {sortBy === "quantity" && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => handleSort("name")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              sortBy === "name"
                ? "bg-accent-primary text-white shadow-glow-primary"
                : "bg-dark-hover text-text-secondary hover:bg-dark-hover/80"
            }`}
          >
            Nom
            {sortBy === "name" && <ArrowUpDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Empty search results */}
        {searchQuery && sortedAssets.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-lg text-text-secondary mb-2">Aucun résultat</p>
            <p className="text-sm text-text-muted">
              Aucun actif ne correspond à "{searchQuery}"
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sortedAssets.map((asset, index) => {
            const { metrics } = asset;

            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-card border border-border-subtle rounded-xl p-5 hover:border-accent-primary/30 transition-all"
              >
                {/* Asset Header */}
                <div className="flex justify-between items-start mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-text-primary text-lg">
                        {asset.name}
                      </h3>
                      {asset.symbol && (
                        <span className="text-xs bg-accent-beige/20 text-white px-2 py-1 rounded-lg font-mono">
                          {asset.symbol}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(asset)}
                      className="p-2 bg-dark-hover hover:bg-border-default text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                      title="Modifier l'actif"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(asset)}
                      className="p-2 bg-dark-hover hover:bg-border-default text-accent-red rounded-lg transition-colors"
                      title="Supprimer l'actif"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Asset Metrics Grid */}
                <div
                  className={`grid ${
                    !asset.symbol ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4"
                  } gap-3 mb-4`}
                >
                  {asset.symbol && (
                    <>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Quantité</p>
                        <p className="font-semibold text-text-primary">
                          {metrics.quantity.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">
                          Prix d'achat
                        </p>
                        <p className="font-semibold text-text-primary">
                          {formatCurrency(metrics.purchasePrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">
                          Prix actuel
                        </p>
                        <div className="flex flex-col">
                          <p className="font-semibold text-text-primary">
                            {formatCurrency(metrics.currentPrice)}
                          </p>
                          {asset.symbol && liveQuotes[asset.symbol] && (
                            <span
                              className={`text-xs font-medium ${
                                liveQuotes[asset.symbol].changePercent >= 0
                                  ? "text-accent-green"
                                  : "text-accent-red"
                              }`}
                            >
                              {liveQuotes[asset.symbol].changePercent >= 0
                                ? "+"
                                : ""}
                              {liveQuotes[asset.symbol].changePercent.toFixed(
                                2
                              )}
                              % (24h)
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-xs text-text-muted mb-1">
                      Investissement
                    </p>
                    <p className="font-semibold text-text-primary">
                      {formatCurrency(metrics.totalPurchaseValue)}
                    </p>
                  </div>
                </div>

                {/* Value and Performance */}
                <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                  <div>
                    <p className="text-xs text-text-muted mb-1">
                      Valeur actuelle
                    </p>
                    <p className="text-2xl font-bold text-accent-beige">
                      {formatCurrency(metrics.totalCurrentValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted mb-1">
                      Plus/Moins-value
                    </p>
                    <div className="flex items-center gap-1 justify-end mb-1">
                      {metrics.isPositive ? (
                        <TrendingUp className="w-5 h-5 text-accent-green" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-accent-red" />
                      )}
                      <p
                        className={`text-xl font-bold ${
                          metrics.isPositive
                            ? "text-accent-green"
                            : "text-accent-red"
                        }`}
                      >
                        {metrics.isPositive ? "+" : ""}
                        {formatCurrency(metrics.unrealizedGain)}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        metrics.isPositive
                          ? "text-accent-green"
                          : "text-accent-red"
                      }`}
                    >
                      {metrics.isPositive ? "+" : ""}
                      {metrics.gainPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Savings Yield Control - Only for manual assets (no symbol) */}
                {!asset.symbol && <SavingsYieldControl asset={asset} />}
              </motion.div>
            );
          })}
        </div>

        {/* Footer stats */}
        {sortedAssets.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border-subtle text-center text-sm text-text-muted">
            {sortedAssets.length} actif{sortedAssets.length > 1 ? "s" : ""}{" "}
            affiché{sortedAssets.length > 1 ? "s" : ""}
            {searchQuery &&
              ` (sur ${enrichedAssets.length} total${
                enrichedAssets.length > 1 ? "aux" : ""
              })`}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {showEditModal && selectedAsset && (
        <EditAssetModal
          asset={selectedAsset}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}

      {showDeleteModal && selectedAsset && (
        <ConfirmDeleteModal
          asset={selectedAsset}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
