/**
 * ConfirmDeleteContributionModal - Modal de confirmation de suppression
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { formatCurrency, formatDate } from "../lib/utils/formatters";

export default function ConfirmDeleteContributionModal({
  contribution,
  onClose,
  onConfirm,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("savings_contributions")
        .delete()
        .eq("id", contribution.id);

      if (deleteError) throw deleteError;

      onConfirm();
    } catch (err) {
      console.error("Error deleting contribution:", err);
      setError(err.message || "Erreur lors de la suppression");
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-red/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-accent-red" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">
                Supprimer le versement
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-dark-hover text-text-muted hover:text-text-primary transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-text-secondary">
              Êtes-vous sûr de vouloir supprimer ce versement ? Cette action est
              irréversible.
            </p>

            {/* Contribution Details */}
            <div className="bg-dark-hover rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Date</span>
                <span className="font-medium text-text-primary">
                  {formatDate(contribution.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Montant</span>
                <span className="font-medium text-text-primary">
                  {formatCurrency(contribution.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Rendement</span>
                <span className="font-medium text-text-primary">
                  {contribution.yield_rate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Intérêts</span>
                <span className="font-medium text-accent-green">
                  {formatCurrency(contribution.interest || 0)}
                </span>
              </div>
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
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-accent-red text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:bg-accent-red/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
