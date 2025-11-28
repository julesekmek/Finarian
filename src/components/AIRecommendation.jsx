/**
 * AIRecommendation component
 * Generates an investment strategy prompt for ChatGPT based on user inputs and portfolio
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Clock,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  Info,
} from "lucide-react";
import { assetService } from "../services/assetService";
import { buildRecommendationPrompt } from "../utils/promptBuilder";
import {
  INVESTMENT_OBJECTIVES,
  INVESTMENT_HORIZONS,
  DEFAULT_MONTHLY_INVESTMENT,
  MAX_MONTHLY_INVESTMENT,
} from "../constants";

export default function AIRecommendation({ userId }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState([]);
  const [horizons, setHorizons] = useState([]);
  const [monthlyInvestment, setMonthlyInvestment] = useState(
    DEFAULT_MONTHLY_INVESTMENT
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // Fetch assets on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await assetService.fetchAssets(userId);
        setAssets(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAssets();
    }
  }, [userId]);

  // Toggle selection for multi-select
  const toggleSelection = (item, currentList, setList) => {
    if (currentList.find((i) => i.id === item.id)) {
      setList(currentList.filter((i) => i.id !== item.id));
    } else {
      setList([...currentList, item]);
    }
  };

  // Handle generate button click
  const handleGenerate = async () => {
    if (objectives.length === 0 || horizons.length === 0) {
      alert("Veuillez sélectionner au moins un objectif et un horizon.");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = buildRecommendationPrompt({
        objectives,
        horizons,
        monthlyInvestment,
        assets,
      });

      await navigator.clipboard.writeText(prompt);
      setShowCopied(true);

      // Reset copied state after 3 seconds
      setTimeout(() => setShowCopied(false), 3000);

      // Open ChatGPT in new tab
      window.open("https://chat.openai.com", "_blank");
    } catch (error) {
      console.error("Error generating recommendation:", error);
      alert("Une erreur est survenue lors de la copie du prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Sort assets by value descending
  const sortedAssets = [...assets].sort((a, b) => {
    const valA = a.quantity * a.current_price;
    const valB = b.quantity * b.current_price;
    return valB - valA;
  });

  // Calculate portfolio stats
  const totalValue = assets.reduce(
    (sum, asset) => sum + asset.quantity * asset.current_price,
    0
  );

  return (
    <div className="space-y-6 pb-40 md:pb-24">
      {/* Intro Block */}
      <div className="card">
        <h2 className="text-xl font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent-primary" />
          Recommandation IA
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Générez une stratégie d'investissement sur mesure. Complétez votre
          profil ci-dessous et vérifiez votre portefeuille pour obtenir votre
          prompt personnalisé.
        </p>
      </div>

      {/* Configuration Block */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold text-sm">
            1
          </div>
          Votre Profil
        </h2>

        <div className="space-y-6">
          {/* Objectives Section */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-primary" />
              Vos Objectifs
            </h3>
            <div className="flex flex-wrap gap-2">
              {INVESTMENT_OBJECTIVES.map((obj) => {
                const isSelected = objectives.find((o) => o.id === obj.id);
                return (
                  <motion.button
                    key={obj.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      toggleSelection(obj, objectives, setObjectives)
                    }
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-accent-primary text-white border-accent-primary shadow-glow-primary"
                        : "bg-dark-hover border-border-subtle text-text-secondary hover:border-text-muted hover:text-text-primary"
                    }`}
                  >
                    {obj.label}
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Horizons Section */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-primary" />
              Horizon
            </h3>
            <div className="flex flex-wrap gap-2">
              {INVESTMENT_HORIZONS.map((hor) => {
                const isSelected = horizons.find((h) => h.id === hor.id);
                return (
                  <motion.button
                    key={hor.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSelection(hor, horizons, setHorizons)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-accent-primary text-white border-accent-primary shadow-glow-primary"
                        : "bg-dark-hover border-border-subtle text-text-secondary hover:border-text-muted hover:text-text-primary"
                    }`}
                  >
                    {hor.label}
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Monthly Investment Section */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-accent-primary" />
              Investissement mensuel
            </h3>
            <div className="bg-dark-hover rounded-xl p-4 border border-border-subtle">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-text-muted">Montant</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-text-primary">
                    {monthlyInvestment}
                  </span>
                  <span className="text-text-muted">€</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={MAX_MONTHLY_INVESTMENT}
                step="50"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full h-2 bg-dark-card rounded-lg appearance-none cursor-pointer accent-accent-primary"
              />
              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>0€</span>
                <span>{MAX_MONTHLY_INVESTMENT}€+</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Portfolio Summary Block */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold text-sm">
            2
          </div>
          Votre Portefeuille
        </h2>

        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-dark-hover rounded w-3/4"></div>
            <div className="h-4 bg-dark-hover rounded w-1/2"></div>
          </div>
        ) : assets.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-dark-hover rounded-xl border border-border-subtle">
              <span className="text-text-secondary font-medium">
                Valeur totale
              </span>
              <span className="text-2xl font-bold text-text-primary">
                {totalValue.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Détail des actifs
              </h3>
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {sortedAssets.map((asset) => {
                  const value = asset.quantity * asset.current_price;
                  const percentage =
                    totalValue > 0 ? (value / totalValue) * 100 : 0;
                  return (
                    <div
                      key={asset.id}
                      className="p-3 rounded-xl bg-dark-hover border border-border-subtle"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-medium text-text-primary block">
                            {asset.name}
                          </span>
                          <span className="text-xs text-text-muted uppercase tracking-wider">
                            {asset.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-text-primary block">
                            {value.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </span>
                          <span className="text-xs text-text-muted">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-dark-card rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-accent-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            <p>Aucun actif dans votre portefeuille.</p>
          </div>
        )}
      </div>

      {/* Action Button - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-dark-bg/95 backdrop-blur-md border-t border-border-subtle z-50 px-4 md:px-8 py-4 md:py-6 safe-area-bottom">
        <div className="max-w-7xl mx-auto w-full">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full btn-primary py-4 text-lg shadow-lg shadow-accent-primary/20 flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-2">
              {showCopied ? (
                <Check className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
              <span>
                {showCopied ? "Copié !" : "Obtenir ma recommandation IA"}
              </span>
            </div>
          </motion.button>

          {/* Enhanced Explanation */}
          <div className="mt-3 text-center space-y-1">
            <p className="text-xs text-text-muted max-w-2xl mx-auto">
              Cette action va générer un prompt optimisé contenant vos données
              anonymisées, le copier dans votre presse-papier et ouvrir ChatGPT.
              Il vous suffira de coller le texte pour obtenir votre analyse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
