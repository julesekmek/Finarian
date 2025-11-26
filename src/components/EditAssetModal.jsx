/**
 * EditAssetModal component - Modern dark mode edit modal
 * Smooth animations and clean design
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { assetService } from "../services/assetService";
import { authService } from "../services/authService";
import { backfillHistory } from "../services/priceService";

export default function EditAssetModal({ asset, onClose, onSave }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form with asset data
  useEffect(() => {
    if (asset) {
      setName(asset.name || "");
      setCategory(asset.category || "");
      setSymbol(asset.symbol || "");
      setQuantity(asset.quantity?.toString() || "0");
      setPurchasePrice(asset.purchase_price?.toString() || "0");
      setCurrentPrice(asset.current_price?.toString() || "0");
      setRegion(asset.region || "");
      setSector(asset.sector || "");
    }
  }, [asset]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!name.trim() || !category.trim()) {
      setError("Le nom et la catégorie sont requis");
      return;
    }

    const numericQuantity = parseFloat(quantity);
    const numericPurchasePrice = parseFloat(purchasePrice);
    const numericCurrentPrice = parseFloat(currentPrice);

    if (isNaN(numericQuantity) || numericQuantity < 0) {
      setError("Veuillez entrer une quantité valide");
      return;
    }

    if (isNaN(numericPurchasePrice) || numericPurchasePrice < 0) {
      setError("Veuillez entrer un prix d'achat valide");
      return;
    }

    if (isNaN(numericCurrentPrice) || numericCurrentPrice < 0) {
      setError("Veuillez entrer un prix actuel valide");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await assetService.updateAsset(asset.id, {
        name: name.trim(),
        category: category.trim(),
        symbol: symbol.trim() || null,
        quantity: numericQuantity,
        purchase_price: numericPurchasePrice,
        current_price: numericCurrentPrice,
        region: region.trim() || null,
        sector: sector.trim() || null,
        last_updated: new Date().toISOString(),
      });

      const updatedAsset = data || {
        ...asset,
        name: name.trim(),
        category: category.trim(),
        symbol: symbol.trim() || null,
        region: region.trim() || null,
        sector: sector.trim() || null,
        quantity: numericQuantity,
        purchase_price: numericPurchasePrice,
        current_price: numericCurrentPrice,
        last_updated: new Date().toISOString(),
      };

      // 🎯 Backfill historical data (YTD from 2025-01-02)
      // This updates the entire YTD history with new values
      console.log(
        `Backfilling YTD historical data for ${updatedAsset.name}...`
      );

      const session = await authService.getSession();

      if (session) {
        try {
          const result = await backfillHistory(
            asset.id,
            symbol.trim(),
            numericCurrentPrice,
            session
          );

          if (result.success) {
            console.log(
              `✓ Historical data backfilled: ${result.inserted} points (${result.source})`
            );
          } else {
            console.warn("Historical data backfill failed:", result.message);
          }
        } catch (historyError) {
          // Don't fail the whole operation if history fetch fails
          console.error("Failed to backfill historical data:", historyError);
        }
      }

      if (onSave) {
        onSave(updatedAsset);
      }

      onClose();
    } catch (err) {
      console.error("Error updating asset:", err);
      setError(err.message || "Erreur lors de la mise à jour");
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              Modifier l'actif
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
            {/* Asset Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Nom de l'actif
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Actions Apple"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Catégorie
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ex: Actions, Crypto, Immobilier"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Symbole Yahoo Finance{" "}
                <span className="text-text-muted text-xs">(optionnel)</span>
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="ex: AAPL, MSFT, BTC-USD"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {/* Region and Sector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Zone géographique
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="ex: Europe, US"
                  className="input-field w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Domaine d'activité
                </label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="ex: Tech, Santé"
                  className="input-field w-full"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Quantity, Purchase Price, Current Price */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Quantité
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input-field w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Prix achat (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="input-field w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Prix actuel (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="input-field w-full"
                  disabled={loading}
                />
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
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
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
