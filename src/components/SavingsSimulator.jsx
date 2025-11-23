/**
 * SavingsSimulator - Interface spéciale pour actifs d'épargne
 * Affiche un simulateur de rendement avec suivi des versements quinzomadaires
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Wallet,
  Calculator,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
} from "../lib/utils/formatters";
import AddContributionModal from "./AddContributionModal";
import EditContributionModal from "./EditContributionModal";
import ConfirmDeleteContributionModal from "./ConfirmDeleteContributionModal";

export default function SavingsSimulator({ asset, onBack, userId }) {
  const [contributions, setContributions] = useState([]);
  const [annualYield, setAnnualYield] = useState(3.0); // Rendement annuel par défaut
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);

  // Fetch contributions from database
  useEffect(() => {
    fetchContributions();
  }, [asset.id]);

  const fetchContributions = async () => {
    try {
      const { data, error } = await supabase
        .from("savings_contributions")
        .select("*")
        .eq("asset_id", asset.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalCapital = contributions.reduce(
    (sum, c) => sum + parseFloat(c.amount),
    0
  );
  const totalInterest = contributions.reduce(
    (sum, c) => sum + parseFloat(c.interest || 0),
    0
  );
  const currentValue = totalCapital + totalInterest;
  const realYield = totalCapital > 0 ? (totalInterest / totalCapital) * 100 : 0;

  // Project end of year (simple estimation)
  const today = new Date();
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  const daysRemaining = Math.max(
    0,
    (endOfYear - today) / (1000 * 60 * 60 * 24)
  );
  const yearProgress = (365 - daysRemaining) / 365;

  // Estimate future contributions (assume same rate as current)
  const avgMonthlyContribution = totalCapital / (yearProgress * 12 || 1);
  const monthsRemaining = Math.ceil(daysRemaining / 30);
  const estimatedFutureContributions = avgMonthlyContribution * monthsRemaining;

  const projectedCapital = totalCapital + estimatedFutureContributions;
  const projectedInterest = projectedCapital * (annualYield / 100);
  const projectedValue = projectedCapital + projectedInterest;

  // Prepare chart data (cumulative evolution)
  const chartData = [];
  let cumulativeCapital = 0;
  let cumulativeInterest = 0;

  contributions.forEach((contribution) => {
    cumulativeCapital += parseFloat(contribution.amount);
    cumulativeInterest += parseFloat(contribution.interest || 0);

    chartData.push({
      date: contribution.date,
      capital: Math.round(cumulativeCapital * 100) / 100,
      value: Math.round((cumulativeCapital + cumulativeInterest) * 100) / 100,
    });
  });

  // Modal handlers
  const handleOpenAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => setShowAddModal(false);
  const handleSaveAdd = () => {
    handleCloseAdd();
    fetchContributions();
  };

  const handleOpenEdit = (contribution) => {
    setSelectedContribution(contribution);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedContribution(null);
  };
  const handleSaveEdit = () => {
    handleCloseEdit();
    fetchContributions();
  };

  const handleOpenDelete = (contribution) => {
    setSelectedContribution(contribution);
    setShowDeleteModal(true);
  };
  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setSelectedContribution(null);
  };
  const handleConfirmDelete = () => {
    handleCloseDelete();
    fetchContributions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-dark-hover rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-text-primary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{asset.name}</h1>
          <p className="text-sm text-text-muted">Simulateur d'épargne</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <p className="text-sm text-text-muted uppercase tracking-wide mb-2">
            Capital
          </p>
          <p className="text-3xl font-bold text-text-primary">
            {formatCurrency(totalCapital)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {contributions.length} versement(s)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <p className="text-sm text-text-muted uppercase tracking-wide mb-2">
            Intérêts
          </p>
          <p className="text-3xl font-bold text-accent-green">
            {formatCurrency(totalInterest)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Rendement réel: {realYield.toFixed(2)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <p className="text-sm text-text-muted uppercase tracking-wide mb-2">
            Valeur actuelle
          </p>
          <p className="text-3xl font-bold text-text-primary">
            {formatCurrency(currentValue)}
          </p>
          <p className="text-xs text-accent-green mt-1">
            +{formatCurrency(totalInterest)} depuis le début
          </p>
        </motion.div>
      </div>

      {/* Yield Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-accent-primary" />
          Simulateur de rendement
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Rendement annuel prévisionnel (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={annualYield}
              onChange={(e) => setAnnualYield(parseFloat(e.target.value) || 0)}
              className="input-field w-full md:w-64"
            />
          </div>

          <div className="bg-dark-hover rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-primary" />
              Projection fin d'année
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-text-muted mb-1">Capital projeté</p>
                <p className="font-semibold text-text-primary text-lg">
                  {formatCurrency(projectedCapital)}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Intérêts projetés</p>
                <p className="font-semibold text-accent-green text-lg">
                  {formatCurrency(projectedInterest)}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Valeur finale</p>
                <p className="font-semibold text-text-primary text-lg">
                  {formatCurrency(projectedValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Evolution Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Évolution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                stroke="#718096"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#718096"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `${Math.round(value)}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A202C",
                  border: "1px solid #2D3748",
                  borderRadius: "8px",
                }}
                labelFormatter={(label) => formatDate(label)}
                formatter={(value) => [formatCurrency(value), ""]}
              />
              <Line
                type="monotone"
                dataKey="capital"
                stroke="#60A5FA"
                strokeWidth={2}
                dot={false}
                name="Capital"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#F1C086"
                strokeWidth={2}
                dot={false}
                name="Valeur totale"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Contributions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent-primary" />
            Versements quinzomadaires
          </h2>
          <button
            onClick={handleOpenAdd}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {contributions.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun versement enregistré</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contributions.map((contribution, index) => (
              <motion.div
                key={contribution.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-dark-hover rounded-xl hover:bg-dark-hover/80 transition-colors"
              >
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                      Date
                    </p>
                    <p className="font-medium text-text-primary">
                      {formatDate(contribution.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                      Montant
                    </p>
                    <p className="font-medium text-text-primary">
                      {formatCurrency(contribution.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                      Rendement
                    </p>
                    <p className="font-medium text-text-primary">
                      {contribution.yield_rate
                        ? `${contribution.yield_rate}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                      Intérêts
                    </p>
                    <p className="font-medium text-accent-green">
                      {formatCurrency(contribution.interest || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenEdit(contribution)}
                    className="p-2 hover:bg-dark-card rounded-lg transition-colors text-text-secondary hover:text-accent-primary"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(contribution)}
                    className="p-2 hover:bg-dark-card rounded-lg transition-colors text-text-secondary hover:text-accent-red"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddContributionModal
            asset={asset}
            userId={userId}
            onClose={handleCloseAdd}
            onSave={handleSaveAdd}
          />
        )}

        {showEditModal && selectedContribution && (
          <EditContributionModal
            contribution={selectedContribution}
            onClose={handleCloseEdit}
            onSave={handleSaveEdit}
          />
        )}

        {showDeleteModal && selectedContribution && (
          <ConfirmDeleteContributionModal
            contribution={selectedContribution}
            onClose={handleCloseDelete}
            onConfirm={handleConfirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
