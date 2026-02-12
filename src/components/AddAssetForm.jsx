/**
 * AddAssetForm component - Modern floating action button with modal form
 * Minimalist design with smooth animations
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";
import { assetService } from "../services/assetService";
import { authService } from "../services/authService";
import { backfillHistory, callUpdatePrices } from "../services/priceService";

import YahooFinanceAutocomplete from "./YahooFinanceAutocomplete";
import AutocompleteInput from "./AutocompleteInput";

export default function AddAssetForm({ userId, assets = [] }) {
  const [showModal, setShowModal] = useState(false);
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

  // Derive unique categories, regions, and sectors from existing assets
  const existingCategories = [
    ...new Set(assets.map((a) => a.category).filter(Boolean)),
  ].sort();
  const existingRegions = [
    ...new Set(assets.map((a) => a.region).filter(Boolean)),
  ].sort();
  const existingSectors = [
    ...new Set(assets.map((a) => a.sector).filter(Boolean)),
  ].sort();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!name.trim() || !category.trim() || !quantity || !purchasePrice) {
      setError("Veuillez remplir tous les champs requis");
      return;
    }

    const numericQuantity = parseFloat(quantity);
    const numericPurchasePrice = parseFloat(purchasePrice);
    const numericCurrentPrice = currentPrice
      ? parseFloat(currentPrice)
      : numericPurchasePrice;

    if (isNaN(numericQuantity) || numericQuantity <= 0) {
      setError("Veuillez entrer une quantité valide");
      return;
    }

    if (isNaN(numericPurchasePrice) || numericPurchasePrice < 0) {
      setError("Veuillez entrer un prix d'achat valide");
      return;
    }

    if (
      currentPrice &&
      (isNaN(numericCurrentPrice) || numericCurrentPrice < 0)
    ) {
      setError("Veuillez entrer un prix actuel valide");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newAsset = await assetService.createAsset({
        user_id: userId,
        name: name.trim(),
        category: category.trim(),
        symbol: symbol.trim() || null,
        quantity: numericQuantity,
        purchase_price: numericPurchasePrice,
        current_price: numericCurrentPrice,
        region: region.trim() || null,
        sector: sector.trim() || null,
      });

      // 🎯 Backfill historical data (YTD from 2025-01-02)
      if (newAsset) {
        console.log(`Backfilling YTD historical data for ${newAsset.name}...`);

        const session = await authService.getSession();

        if (session) {
          try {
            const result = await backfillHistory(
              newAsset.id,
              symbol.trim(),
              numericCurrentPrice,
              session,
            );

            if (result.success) {
              console.log(
                `✓ Historical data backfilled: ${result.inserted} points (${result.source})`,
              );
            } else {
              console.warn("Historical data backfill failed:", result.message);
            }
          } catch (historyError) {
            // Don't fail the whole operation if history fetch fails
            console.error("Failed to backfill historical data:", historyError);
          }
        }
      }

      // Force update of daily history to avoid chart dip
      console.log("Updating daily prices and history...");
      await callUpdatePrices();

      // Reset form and close modal
      setName("");
      setCategory("");
      setSymbol("");
      setQuantity("");
      setPurchasePrice("");
      setCurrentPrice("");
      setRegion("");
      setSector("");
      setShowModal(false);
    } catch (err) {
      console.error("Error adding asset:", err);
      setError(err.message || "Échec de l'ajout de l'actif");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setShowModal(false);
      setError("");
      setName("");
      setCategory("");
      setSymbol("");
      setQuantity("");
      setPurchasePrice("");
      setCurrentPrice("");
      setRegion("");
      setSector("");
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 md:bottom-8 right-8 z-30 w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow-primary flex items-center justify-center text-white hover:shadow-glow-primary/80 transition-all"
        title="Ajouter un actif"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                onClick={handleClose}
              />

              {/* Modal Container - Scrollable */}
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
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
                        Ajouter un actif
                      </h2>
                      <button
                        onClick={handleClose}
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
                          Nom de l'actif{" "}
                          <span className="text-accent-red">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="ex: Épargne, Actions Apple"
                          className="input-field w-full"
                          disabled={loading}
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Catégorie <span className="text-accent-red">*</span>
                        </label>
                        <AutocompleteInput
                          value={category}
                          onChange={setCategory}
                          options={existingCategories}
                          placeholder="ex: Actions, Crypto, Immobilier"
                          disabled={loading}
                        />
                      </div>

                      {/* Symbol */}
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Symbole Yahoo Finance{" "}
                          <span className="text-text-muted text-xs">
                            (optionnel)
                          </span>
                        </label>
                        <YahooFinanceAutocomplete
                          value={symbol}
                          onChange={setSymbol}
                          onSymbolSelect={(result) => {
                            // Auto-fill name if empty
                            if (!name.trim()) {
                              setName(
                                result.shortName ||
                                  result.longName ||
                                  result.symbol,
                              );
                            }
                          }}
                          disabled={loading}
                          placeholder="ex: AAPL, MSFT, BTC-USD"
                        />
                        <p className="text-xs text-text-muted mt-1">
                          Pour une mise à jour automatique des prix
                        </p>
                      </div>

                      {/* Region and Sector */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Zone géographique
                          </label>
                          <AutocompleteInput
                            value={region}
                            onChange={setRegion}
                            options={existingRegions}
                            placeholder="ex: Europe, US"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Domaine d'activité
                          </label>
                          <AutocompleteInput
                            value={sector}
                            onChange={setSector}
                            options={existingSectors}
                            placeholder="ex: Tech, Santé"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Quantity and Purchase Price */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Quantité <span className="text-accent-red">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="1.00"
                            className="input-field w-full"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Prix d'achat (€){" "}
                            <span className="text-accent-red">*</span>
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

                      {/* Current Price */}
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Prix actuel (€){" "}
                          <span className="text-text-muted text-xs">
                            (optionnel)
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={currentPrice}
                          onChange={(e) => setCurrentPrice(e.target.value)}
                          placeholder="0.00"
                          className="input-field w-full"
                          disabled={loading}
                        />
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

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Ajout en cours...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            <span>Ajouter l'actif</span>
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
