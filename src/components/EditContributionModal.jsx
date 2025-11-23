/**
 * EditContributionModal - Modal pour modifier un versement existant
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2, Calendar } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function EditContributionModal({
  contribution,
  onClose,
  onSave,
}) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [yieldRate, setYieldRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form with contribution data
  useEffect(() => {
    if (contribution) {
      setDate(contribution.date);
      setAmount(contribution.amount?.toString() || "");
      setYieldRate(contribution.yield_rate?.toString() || "");
    }
  }, [contribution]);

  // Calculate interest automatically
  const calculatedInterest =
    amount && yieldRate
      ? (parseFloat(amount) * parseFloat(yieldRate)) / 100
      : 0;

  // Validate that date is 1st or 15th of month
  const validateDate = (dateString) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const day = selectedDate.getDate();

    // Must be 1st or 15th
    if (day !== 1 && day !== 15) {
      return false;
    }

    // Special case for February
    const month = selectedDate.getMonth();
    if (month === 1) {
      const year = selectedDate.getFullYear();
      const lastDayOfFeb = new Date(year, 2, 0).getDate();
      if (day === 15 && lastDayOfFeb < 15) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!date || !amount || !yieldRate) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!validateDate(date)) {
      setError("La date doit être le 1er ou le 15 du mois");
      return;
    }

    const numericAmount = parseFloat(amount);
    const numericYieldRate = parseFloat(yieldRate);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Veuillez entrer un montant valide");
      return;
    }

    if (isNaN(numericYieldRate) || numericYieldRate < 0) {
      setError("Veuillez entrer un rendement valide");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("savings_contributions")
        .update({
          date,
          amount: numericAmount,
          yield_rate: numericYieldRate,
          interest: calculatedInterest,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contribution.id);

      if (updateError) throw updateError;

      onSave();
    } catch (err) {
      console.error("Error updating contribution:", err);
      if (err.code === "23505") {
        setError("Un versement existe déjà pour cette date");
      } else {
        setError(err.message || "Erreur lors de la mise à jour");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!contribution) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-dark-card border border-border-subtle rounded-2xl shadow-card p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              Modifier le versement
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-dark-hover text-text-muted hover:text-text-primary transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Date <span className="text-accent-red">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field w-full pl-11"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-text-muted mt-1">
                Dates valides : 1er ou 15 de chaque mois
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Montant (€) <span className="text-accent-red">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field w-full"
                disabled={loading}
                required
              />
            </div>

            {/* Yield Rate */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Rendement annuel (%) <span className="text-accent-red">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={yieldRate}
                onChange={(e) => setYieldRate(e.target.value)}
                className="input-field w-full"
                disabled={loading}
                required
              />
            </div>

            {/* Calculated Interest */}
            <div className="bg-dark-hover rounded-xl p-4">
              <p className="text-sm text-text-muted mb-1">
                Intérêts calculés (annuels)
              </p>
              <p className="text-2xl font-bold text-accent-green">
                {calculatedInterest.toFixed(2)} €
              </p>
              <p className="text-xs text-text-muted mt-1">
                Calcul : {amount || "0"} € × {yieldRate || "0"}%
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm p-3 rounded-xl bg-accent-red/10 text-accent-red border border-accent-red/20"
              >
                {error}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
