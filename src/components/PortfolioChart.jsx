/**
 * PortfolioChart component - Modern portfolio evolution chart
 * Beautiful dark mode chart with smooth animations
 *
 * Refactored to:
 * - Fetch ALL data once (KPIs use all data - constants)
 * - Filter data by period only for chart display
 * - Improved design with filters integrated into chart area
 */

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  getPortfolioHistory,
  calculatePerformanceMetrics,
} from "../lib/portfolioHistory";
import { formatCurrency, formatShortDate } from "../lib/utils/formatters";
import { DEFAULT_PERIOD, CHART_PERIODS } from "../lib/utils/constants";
import { usePullToRefresh } from "../lib/hooks/usePullToRefresh";
import { callUpdatePrices } from "../lib/updatePrices";

export default function PortfolioChart({ userId }) {
  // Chart filter state (only affects chart display, not KPIs)
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  // All data (fetched once, used for KPIs - constants)
  const [allHistory, setAllHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalInvested, setTotalInvested] = useState(0);

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    const result = await callUpdatePrices();
    if (result.success) {
      // Refetch data after price update
      const data = await getPortfolioHistory(userId, "all");
      setAllHistory(data);
    }
  };

  const { containerRef, isPulling, isRefreshing, pullDistance, pullThreshold } =
    usePullToRefresh(handleRefresh);

  // Fetch total invested amount (real investment) - KPI constant
  useEffect(() => {
    if (!userId) return;

    async function fetchTotalInvested() {
      try {
        const { data: assets, error } = await supabase
          .from("assets")
          .select("quantity, purchase_price")
          .eq("user_id", userId);

        if (error) throw error;

        const invested = assets.reduce((sum, asset) => {
          return (
            sum + parseFloat(asset.quantity) * parseFloat(asset.purchase_price)
          );
        }, 0);

        setTotalInvested(invested);
      } catch (err) {
        console.error("Error calculating total invested:", err);
      }
    }

    fetchTotalInvested();

    // Realtime subscription to update when assets change
    const channel = supabase
      .channel(`portfolio_invested_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assets",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchTotalInvested();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Fetch ALL portfolio history once (used for KPIs)
  useEffect(() => {
    if (!userId) return;

    async function fetchAllHistory() {
      setLoading(true);
      setError(null);

      try {
        // Fetch ALL data (no period filter)
        const data = await getPortfolioHistory(userId, "all");
        setAllHistory(data);
      } catch (err) {
        console.error("Error loading portfolio history:", err);
        setError("Impossible de charger l'historique");
      } finally {
        setLoading(false);
      }
    }

    fetchAllHistory();
  }, [userId]);

  // Filter history by selected period (for chart display only)
  const filteredHistory = useMemo(() => {
    if (period === "all") return allHistory;

    if (!allHistory || allHistory.length === 0) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    return allHistory.filter((item) => item.date >= cutoffStr);
  }, [allHistory, period]);

  // Calculate KPI metrics from ALL data (constants)
  const kpiMetrics = useMemo(() => {
    return calculatePerformanceMetrics(allHistory);
  }, [allHistory]);

  // Calculate dynamic Y-axis domain for better visualization of price movements
  const yAxisDomain = useMemo(() => {
    if (!filteredHistory || filteredHistory.length === 0)
      return ["auto", "auto"];

    const values = filteredHistory.map((item) => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Calculate range and add 8% padding on each side for better visibility
    const range = maxValue - minValue;
    const padding = range * 0.08;

    // If range is very small (flat line), use a default padding
    const effectivePadding =
      range < maxValue * 0.01 ? maxValue * 0.02 : padding;

    const adjustedMin = Math.max(0, minValue - effectivePadding);
    const adjustedMax = maxValue + effectivePadding;

    return [Math.floor(adjustedMin), Math.ceil(adjustedMax)];
  }, [filteredHistory]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      const formattedDate = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Calculate change from first point in filtered data
      const firstValue = filteredHistory[0]?.value || data.value;
      const change = data.value - firstValue;
      const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;

      return (
        <div className="bg-dark-card border border-border-subtle px-4 py-3 rounded-xl shadow-card">
          <p className="text-sm text-text-muted mb-2">{formattedDate}</p>
          <p className="text-lg font-semibold text-text-primary mb-1">
            {formatCurrency(data.value, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          {Math.abs(changePercent) > 0.01 && (
            <p
              className={`text-xs font-medium ${
                changePercent >= 0 ? "text-accent-green" : "text-accent-red"
              }`}
            >
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}% depuis le début
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Render loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-dark-hover rounded-lg w-1/4 mb-6"></div>
          <div className="h-64 bg-dark-hover rounded-xl"></div>
        </div>
      </motion.div>
    );
  }

  // Render error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-accent-red mx-auto mb-4" />
          <p className="text-accent-red">{error}</p>
        </div>
      </motion.div>
    );
  }

  // Render empty state
  if (!allHistory || allHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent-primary" />
          Évolution du patrimoine
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-lg text-text-secondary mb-2">
            Aucune donnée historique
          </p>
          <p className="text-sm text-text-muted">
            Mettez à jour vos prix pour commencer à suivre l'évolution
          </p>
        </div>
      </motion.div>
    );
  }

  // Determine color and gradient based on overall trend (from KPI metrics)
  const getTrendColor = () => {
    if (!kpiMetrics) return { stroke: "#3B82F6", fill: "url(#colorBlue)" };
    if (kpiMetrics.trend === "positive")
      return { stroke: "#F1C086", fill: "url(#colorPrimary)" };
    if (kpiMetrics.trend === "negative")
      return { stroke: "#EF4444", fill: "url(#colorRed)" };
    return { stroke: "#3B82F6", fill: "url(#colorBlue)" };
  };

  const { stroke, fill } = getTrendColor();

  return (
    <div ref={containerRef} className="relative">
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 bg-dark-card border border-border-subtle rounded-full px-4 py-2 shadow-glow-primary flex items-center gap-2"
          style={{ marginTop: `${Math.min(pullDistance * 0.5, 40)}px` }}
        >
          <RefreshCw
            className={`w-4 h-4 text-accent-primary ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          <span className="text-xs font-medium text-text-primary">
            {isRefreshing
              ? "Actualisation..."
              : pullDistance >= pullThreshold
              ? "Relâcher pour actualiser"
              : "Tirer pour actualiser"}
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Header - Title only (no period selector here) */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent-primary" />
            Évolution du patrimoine
          </h2>
        </div>

        {/* Performance metrics - KPIs (constants, based on ALL data) */}
        {kpiMetrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-hover rounded-xl p-4"
            >
              <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">
                Investi
              </p>
              <p className="text-xl font-bold text-text-secondary">
                {formatCurrency(totalInvested)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-dark-hover rounded-xl p-4"
            >
              <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">
                Valeur actuelle
              </p>
              <p className="text-xl font-bold text-text-primary">
                {formatCurrency(kpiMetrics.currentValue)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-hover rounded-xl p-4"
            >
              <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">
                Variation
              </p>
              <div className="flex items-center gap-1">
                {kpiMetrics.currentValue - totalInvested >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-accent-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-accent-red" />
                )}
                <p
                  className={`text-xl font-bold ${
                    kpiMetrics.currentValue - totalInvested >= 0
                      ? "text-accent-green"
                      : "text-accent-red"
                  }`}
                >
                  {kpiMetrics.currentValue - totalInvested >= 0 ? "+" : ""}
                  {formatCurrency(kpiMetrics.currentValue - totalInvested)}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="bg-dark-hover rounded-xl p-4"
            >
              <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">
                Performance
              </p>
              <div className="flex items-center gap-1">
                {((kpiMetrics.currentValue - totalInvested) / totalInvested) *
                  100 >=
                0 ? (
                  <TrendingUp className="w-4 h-4 text-accent-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-accent-red" />
                )}
                <p
                  className={`text-xl font-bold ${
                    ((kpiMetrics.currentValue - totalInvested) /
                      totalInvested) *
                      100 >=
                    0
                      ? "text-accent-green"
                      : "text-accent-red"
                  }`}
                >
                  {((kpiMetrics.currentValue - totalInvested) / totalInvested) *
                    100 >=
                  0
                    ? "+"
                    : ""}
                  {totalInvested > 0
                    ? (
                        ((kpiMetrics.currentValue - totalInvested) /
                          totalInvested) *
                        100
                      ).toFixed(2)
                    : "0.00"}
                  %
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Chart Container with integrated filters - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden md:block bg-dark-hover/50 rounded-2xl p-4 md:p-6"
        >
          {/* Period selector - Integrated in chart area */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stroke }}
              ></div>
              <span className="text-sm font-medium text-text-secondary">
                {period === "all"
                  ? "Toutes les données"
                  : `${period} derniers jours`}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {Object.entries(CHART_PERIODS).map(([key, days]) => (
                <button
                  key={key}
                  onClick={() => setPeriod(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    period === days
                      ? "bg-accent-primary text-white shadow-glow-primary"
                      : "bg-dark-card text-text-secondary hover:bg-dark-card/80 hover:text-text-primary"
                  }`}
                >
                  {days === "all" ? "Tout" : `${days}J`}
                </button>
              ))}
            </div>
          </div>

          {/* Chart - Now visible on mobile too with better sizing */}
          <div className="w-full h-64 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredHistory}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F1C086" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#F1C086" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#F1C086" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1E293B"
                  vertical={false}
                  opacity={0.4}
                  strokeWidth={1}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  stroke="#64748B"
                  style={{ fontSize: "11px" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  domain={yAxisDomain}
                  tickFormatter={(value) =>
                    formatCurrency(value, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  }
                  stroke="#64748B"
                  style={{ fontSize: "11px" }}
                  width={70}
                  tickLine={false}
                  axisLine={false}
                  tickCount={7}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: stroke,
                    strokeWidth: 1,
                    strokeDasharray: "5 5",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={stroke}
                  strokeWidth={3}
                  fill={fill}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: stroke,
                    strokeWidth: 3,
                    stroke: "#1A1F2E",
                    style: {
                      filter: "drop-shadow(0 0 4px rgba(241, 192, 134, 0.6))",
                    },
                  }}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Footer info with data count */}
          <div className="mt-4 text-center">
            <p className="text-xs text-text-muted">
              {filteredHistory.length} points de données affichés
              {period !== "all" && ` sur les ${period} derniers jours`}
              {allHistory.length > 0 && ` • ${allHistory.length} au total`}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
