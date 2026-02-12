/**
 * AddPurchaseModal component - Modal to add a new purchase to an existing asset
 * Automatically calculates new weighted average price (PRU)
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import { assetService } from "../services/assetService";
import { authService } from "../services/authService";
import { backfillHistory } from "../services/priceService";
import { formatCurrency } from "../utils/formatters";

export default function AddPurchaseModal({ asset, onClose, onSave }) {
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newMetrics, setNewMetrics] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

  // Calculate projected metrics when inputs change
  useEffect(() => {
    const qty = parseFloat(quantityToAdd);
    const price = parseFloat(purchasePrice);

    if (!isNaN(qty) && qty > 0 && !isNaN(price) && price >= 0) {
      const currentQty = asset.quantity || 0;
      const currentPRU = asset.purchase_price || 0;

      const newTotalQty = currentQty + qty;

      // Weigthed Average Price Formula:
      // ((Old Qty * Old Price) + (New Qty * New Price)) / New Total Qty
      const totalCost = currentQty * currentPRU + qty * price;
      const newPRU = totalCost / newTotalQty;

      setNewMetrics({
        totalQuantity: newTotalQty,
        newPRU: newPRU,
        totalInvested: totalCost,
      });
    } else {
      setNewMetrics(null);
    }
  }, [quantityToAdd, purchasePrice, asset]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMetrics) {
      setError("Veuillez entrer des valeurs valides");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Update asset with new quantity and PRU
      // detailed data for history/transactions could be stored in a separate table in the future
      const data = await assetService.updateAsset(asset.id, {
        quantity: newMetrics.totalQuantity,
        purchase_price: newMetrics.newPRU,
        last_updated: new Date().toISOString(),
      });

      const updatedAsset = data || {
        ...asset,
        quantity: newMetrics.totalQuantity,
        purchase_price: newMetrics.newPRU,
        last_updated: new Date().toISOString(),
      };

      // 2. Backfill history if needed (optional, depends on if we want to reflect this in history immediately)
      const session = await authService.getSession();
      if (session && asset.symbol) {
        try {
          // We might want to trigger a history update here depending on business logic
          await backfillHistory(
            asset.id,
            asset.symbol,
            asset.current_price, // Keep current price as is
            session,
          );
        } catch (historyError) {
          console.error("Failed to update history:", historyError);
        }
      }

      if (onSave) {
        onSave(updatedAsset);
      }

      onClose();
    } catch (err) {
      console.error("Error adding purchase:", err);
      setError(err.message || "Erreur lors de l'ajout de l'achat");
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

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={handleBackdropClick}
      />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-dark-card border border-border-subtle rounded-2xl shadow-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Ajouter un achat
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {asset.name} ({asset.symbol})
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 rounded-xl hover:bg-dark-hover text-text-muted hover:text-text-primary transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Quantité ajoutée
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                    placeholder="0.00"
                    className="input-field w-full"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Prix d'achat unitaire (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="input-field w-full"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Simulation Results */}
              <div className="bg-dark-hover/50 rounded-xl p-4 border border-border-subtle space-y-3">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Nouvelle situation simulée
                </h3>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">
                    Nouvelle quantité totale
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary line-through opacity-70">
                      {asset.quantity?.toFixed(2)}
                    </span>
                    <span className="text-accent-primary font-bold">
                      {newMetrics ? newMetrics.totalQuantity.toFixed(2) : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">
                    Nouveau PRU (Prix Moyen)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary line-through opacity-70">
                      {formatCurrency(asset.purchase_price)}
                    </span>
                    <span className="text-accent-primary font-bold">
                      {newMetrics ? formatCurrency(newMetrics.newPRU) : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2 border-t border-border-subtle/50">
                  <span className="text-text-muted">
                    Investissement total ajouté
                  </span>
                  <span className="text-text-primary font-semibold">
                    {newMetrics
                      ? formatCurrency(
                          newMetrics.totalInvested -
                            asset.quantity * asset.purchase_price,
                        )
                      : "-"}
                  </span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm p-3 rounded-xl bg-accent-red/10 text-accent-red border border-accent-red/20"
                >
                  {error}
                </motion.div>
              )}

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
                  disabled={loading || !newMetrics}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ajout...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>,
    document.body,
  );
}
