/**
 * ConfirmDeleteModal component - Modern delete confirmation
 * Clean dark mode design with clear warning
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { assetService } from "../services/assetService";

export default function ConfirmDeleteModal({ asset, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, loading]);

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await assetService.deleteAsset(asset.id);

      if (onConfirm) {
        onConfirm(asset.id);
      }

      onClose();
    } catch (err) {
      console.error("Error deleting asset:", err);
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

  if (!asset) return null;

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
          {/* Header with Icon */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-accent-red/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-accent-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-1">
                  Confirmer la suppression
                </h2>
                <p className="text-sm text-text-muted">
                  Cette action est irréversible
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-dark-hover text-text-muted hover:text-text-primary transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Asset Info */}
          <div className="bg-dark-hover border border-border-subtle rounded-xl p-4 mb-4">
            <p className="font-semibold text-text-primary text-lg mb-1">
              {asset.name}
            </p>
            <p className="text-sm text-text-muted capitalize">
              {asset.category}
            </p>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-3 bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent-red">
              Êtes-vous sûr de vouloir supprimer cet actif ? Toutes les données
              associées seront perdues.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm p-3 rounded-xl bg-accent-red/10 text-accent-red border border-accent-red/20 mb-4"
            >
              {error}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="button"
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
        </motion.div>
      </div>
    </>
  );
}
