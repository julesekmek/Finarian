/**
 * Utility to build the AI recommendation prompt
 */

export const buildRecommendationPrompt = ({
  objectives,
  horizons,
  monthlyInvestment,
  assets,
}) => {
  // Format lists
  const objectivesList = objectives.map((o) => o.label).join(", ");
  const horizonsList = horizons.map((h) => h.label).join(", ");

  // Calculate total portfolio value
  const totalValue = assets.reduce(
    (sum, asset) => sum + asset.quantity * asset.current_price,
    0
  );

  // Format assets list with allocation
  const formattedAssets = assets
    .map((asset) => {
      const value = asset.quantity * asset.current_price;
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
      return `- ${asset.name} (${asset.category}): ${value.toFixed(
        2
      )}€ (${percentage.toFixed(1)}%)`;
    })
    .join("\n");

  // Build the prompt
  return `Mets toi à la place d’un trader expérimenté et accompagne-moi dans mes futurs investissements.
Mes objectifs sont : ${objectivesList}.
Mon horizon d’investissement est : ${horizonsList}.
Chaque mois je souhaite investir ${monthlyInvestment}€.
Voici mon portefeuille actuel et ses répartitions :
${formattedAssets || "Mon portefeuille est actuellement vide."}

Donne-moi une stratégie claire, pédagogique et compréhensible, adaptée à mon profil et incluant :
- des pistes de rééquilibrage de portefeuille,
- des conseils d’allocation optimisés,
- une stratégie en fonction de mon horizon d’investissement,
- des alertes sur les incohérences éventuelles,
- un plan d'action concret.

Réponds comme un expert pédagogue, pragmatique et avec un plan d'action très simple.`;
};
