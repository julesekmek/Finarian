# 📈 Guide de la Page Performance

## 🎯 Vue d'ensemble

La page Performance offre une vue détaillée et comparative de tous vos actifs financiers. Elle permet d'analyser la performance individuelle de chaque actif et de les comparer entre eux.

---

## ✨ Fonctionnalités principales

### 1️⃣ Vue d'ensemble globale (Comparison Card)

Une carte en dégradé violet affiche les statistiques clés du portefeuille :

| Métrique | Description |
|----------|-------------|
| **Valeur totale** | Somme de la valeur actuelle de tous les actifs |
| **Investissement total** | Somme des montants investis |
| **Performance globale** | Pourcentage de gain/perte sur la période |
| **Meilleure performance** | Actif avec le plus fort % de gain |
| **Plus faible performance** | Actif avec la plus forte baisse |
| **Répartition** | Nombre d'actifs en hausse/baisse/stable |

### 2️⃣ Cartes de performance par actif

Chaque actif dispose de sa propre carte interactive avec :

#### Vue compacte (par défaut)
- **Nom et symbole** de l'actif
- **Catégorie**
- **Prix actuel**
- **Variation en %** sur la période sélectionnée
- **Mini graphique** de tendance

#### Vue étendue (clic sur ▶)
- **Métriques détaillées** :
  - Quantité possédée
  - Prix d'achat moyen
  - Valeur actuelle
  - Gain/Perte réalisable
- **Graphique complet** avec axes et tooltip
- **Résumé de performance** dans un encadré coloré

### 3️⃣ Contrôles et filtres

#### Sélection de période
- **7 jours** : Performance court terme
- **30 jours** : Performance mensuelle (par défaut)
- **90 jours** : Performance trimestrielle

#### Tri des actifs
- **Par performance** : Du meilleur au pire (ou inverse)
- **Par valeur** : Du plus valorisé au moins valorisé
- **Par nom** : Ordre alphabétique

Cliquez une deuxième fois sur le même critère pour inverser l'ordre (↑/↓).

---

## 🎨 Codes couleurs

### Tendances
- 🟢 **Vert** : Performance positive (> +0.5%)
- 🔴 **Rouge** : Performance négative (< -0.5%)
- 🔵 **Bleu** : Performance neutre (-0.5% à +0.5%)

### États
- **Dégradé violet** : Vue d'ensemble (overview)
- **Blanc** : Cartes d'actifs individuels
- **Gris clair** : Métriques détaillées dans la vue étendue

---

## 📊 Comment utiliser la page

### Cas d'usage 1 : Identifier les actifs performants

1. Allez sur la page **Performance**
2. Regardez la section "Meilleure performance" dans la vue d'ensemble
3. Ou triez par **Performance** (ordre décroissant)
4. Les actifs en tête de liste sont les plus performants

### Cas d'usage 2 : Analyser un actif spécifique

1. Trouvez l'actif dans la liste
2. Cliquez sur le bouton **▶** pour développer
3. Observez le graphique complet
4. Consultez les métriques détaillées (quantité, valeur, gain/perte)

### Cas d'usage 3 : Comparer deux périodes

1. Sélectionnez **7J** pour voir la performance hebdomadaire
2. Notez les actifs en hausse/baisse
3. Changez pour **30J** ou **90J**
4. Comparez les variations : un actif peut être en hausse sur 7J mais en baisse sur 90J

### Cas d'usage 4 : Rééquilibrer le portefeuille

1. Triez par **Valeur** (ordre décroissant)
2. Identifiez les actifs qui représentent une trop grande part
3. Consultez leur performance pour décider de vendre/acheter
4. Utilisez les données pour prendre des décisions éclairées

---

## 🔧 Architecture technique

### Structure des composants

```
Performance.jsx (Parent)
  ├─> Overview Card (Statistiques globales)
  ├─> Controls (Période + Tri)
  └─> AssetPerformanceCard[] (Grille d'actifs)
        └─> Mini chart / Full chart
```

### Flux de données

1. **`Performance.jsx`** appelle `getAllAssetsHistory(userId, period)`
2. Pour chaque actif, récupère l'historique depuis `asset_history`
3. Calcule les métriques avec `calculateAssetPerformance()`
4. Enrichit les actifs avec `history` et `metrics`
5. Passe les données à **`AssetPerformanceCard`** pour l'affichage

### Fonctions utilitaires (`portfolioHistory.js`)

| Fonction | Rôle |
|----------|------|
| `getAssetHistory(assetId, days)` | Récupère l'historique d'un actif |
| `getAllAssetsHistory(userId, days)` | Récupère l'historique de tous les actifs |
| `calculateAssetPerformance(history, asset)` | Calcule les métriques de performance |

---

## 📐 Calculs de performance

### Prix et variation de prix

```javascript
priceChange = currentPrice - startPrice
priceChangePercent = (priceChange / startPrice) * 100
```

### Valeur et gain/perte

```javascript
currentValue = currentPrice × quantity
investedValue = purchasePrice × quantity
valueChange = currentValue - investedValue
valueChangePercent = (valueChange / investedValue) * 100
```

### Détermination de la tendance

```javascript
if (priceChangePercent > 0.5) → trend = 'positive'
if (priceChangePercent < -0.5) → trend = 'negative'
else → trend = 'neutral'
```

---

## 🎯 Métriques expliquées

### Dans la carte Overview

| Métrique | Formule | Signification |
|----------|---------|---------------|
| Valeur totale | Σ(prix actuel × quantité) | Combien vaut votre portefeuille aujourd'hui |
| Investissement total | Σ(prix d'achat × quantité) | Combien vous avez investi au total |
| Performance globale | ((Valeur - Investi) / Investi) × 100 | Votre gain/perte en % |

### Dans les cartes d'actifs

| Métrique | Formule | Signification |
|----------|---------|---------------|
| Prix actuel | Dernier prix mis à jour | Prix de marché actuel |
| Variation (période) | ((Prix fin - Prix début) / Prix début) × 100 | Performance sur X jours |
| Valeur actuelle | Prix actuel × Quantité | Valeur totale de cet actif |
| Gain/Perte | (Prix actuel - Prix achat) × Quantité | Profit/perte réalisable |

---

## 🚀 Cas d'usage avancés

### Détection de tendances

**Actif volatile** : Grande différence entre 7J, 30J et 90J
- Exemple : +15% sur 7J, -5% sur 30J, +2% sur 90J
- Indication : Forte volatilité, peut-être opportunité de trading

**Actif stable** : Variations similaires sur toutes les périodes
- Exemple : +2% sur 7J, +3% sur 30J, +2.5% sur 90J
- Indication : Croissance régulière, bon pour investissement long terme

### Diversification

1. Triez par **Performance** sur 90 jours
2. Identifiez les secteurs surreprésentés en tête/queue de liste
3. Rééquilibrez en ajoutant des actifs de secteurs différents

### Alerte manuelle

1. Notez les performances actuelles de vos actifs
2. Revenez dans quelques jours
3. Si un actif chute de plus de X%, considérez vendre ou renforcer

---

## 💡 Bonnes pratiques

### ✅ À faire
- Consultez la page Performance au moins 1 fois par semaine
- Comparez les périodes pour identifier les tendances
- Développez les actifs pour voir les graphiques détaillés
- Utilisez les tris pour repérer rapidement les anomalies

### ❌ À éviter
- Ne vous fiez pas uniquement à la performance court terme (7J)
- Ne vendez pas en panique sur une baisse temporaire
- N'oubliez pas que les performances passées ne garantissent pas les futures

---

## 🧪 Scénarios de test

### Test 1 : Page vide
**Conditions** : Aucun actif dans le portefeuille  
**Résultat attendu** : Message "Aucun actif dans votre portefeuille"

### Test 2 : Actifs sans historique
**Conditions** : Actifs ajoutés mais jamais de mise à jour de prix  
**Résultat attendu** : Message "Aucune donnée historique disponible"

### Test 3 : Affichage normal
**Conditions** : 3+ actifs avec historique  
**Résultat attendu** :
- Vue d'ensemble affichée
- Meilleur/pire performer identifiés
- Grille d'actifs avec mini-graphiques
- Tri fonctionnel

### Test 4 : Vue étendue
**Conditions** : Cliquer sur ▶ d'un actif  
**Résultat attendu** :
- Carte s'agrandit
- Graphique complet affiché
- 4 métriques détaillées visibles
- Tooltip au survol du graphique

### Test 5 : Changement de période
**Conditions** : Cliquer sur 7J, 30J, 90J  
**Résultat attendu** :
- Données rechargées
- Graphiques mis à jour
- Métriques recalculées
- Tri conservé

---

## 🔮 Évolutions futures possibles

### Court terme
- 📊 **Export PDF** : Générer un rapport de performance
- 🔔 **Alertes** : Notifications si performance < -X%
- 📱 **Vue mobile optimisée** : Cartes empilées verticalement

### Moyen terme
- 🎯 **Objectifs** : Définir des objectifs de performance par actif
- 📈 **Prédictions** : Tendance projetée basée sur l'historique
- 🏷️ **Tags** : Filtrer par secteur, risque, type d'actif

### Long terme
- 🤖 **Recommandations IA** : Suggestions de rééquilibrage
- 📊 **Backtesting** : Simulation "Et si j'avais acheté à X date ?"
- 🌍 **Comparaison avec indices** : Votre performance vs CAC40/S&P500

---

## ❓ FAQ

**Q : Pourquoi certains actifs n'apparaissent pas ?**  
R : Seuls les actifs avec historique (au moins 1 mise à jour de prix) sont affichés.

**Q : La performance affichée est différente du Dashboard, pourquoi ?**  
R : Le Dashboard montre la performance depuis l'achat (prix achat vs prix actuel). La page Performance montre la variation sur la période sélectionnée (prix début période vs prix fin période).

**Q : Puis-je voir l'évolution sur 1 an ?**  
R : Pas encore, mais vous pouvez facilement ajouter une option "365J" dans le code.

**Q : Les graphiques sont vides, que faire ?**  
R : Assurez-vous d'avoir mis à jour les prix au moins une fois. L'historique commence à se construire à partir de la première mise à jour.

**Q : Comment interpréter une performance de +5% sur 7J et -2% sur 30J ?**  
R : L'actif a fortement monté récemment (7 derniers jours) mais est toujours en baisse sur le mois. Cela peut indiquer un rebond après une chute.

**Q : Le tri ne fonctionne pas correctement**  
R : Vérifiez que vous avez bien cliqué sur le bouton de tri. La flèche indique la direction (↑ croissant, ↓ décroissant).

---

## 🛠️ Dépannage

### Problème : "Erreur de chargement"

**Causes possibles** :
1. Problème de connexion à Supabase
2. Erreur dans la requête SQL
3. Données corrompues

**Solutions** :
1. Vérifiez votre connexion Internet
2. Rechargez la page (F5)
3. Vérifiez les logs de la console du navigateur

### Problème : Graphiques ne s'affichent pas

**Causes possibles** :
1. Recharts non installé
2. Données au mauvais format

**Solutions** :
```bash
npm install recharts
```

### Problème : Performances lentes

**Causes possibles** :
1. Trop d'actifs (50+)
2. Période trop longue (90J avec beaucoup d'actifs)

**Solutions** :
1. Utilisez des périodes plus courtes (7J)
2. Fermez les cartes étendues inutilisées
3. Optimisez les requêtes SQL (ajoutez des index)

---

## 📚 Ressources

- [Documentation Recharts](https://recharts.org/)
- [Supabase Queries](https://supabase.com/docs/guides/database/joins-and-nesting)
- [Performance Metrics en Finance](https://www.investopedia.com/terms/p/performance-metric.asp)

---

**Profitez de votre nouvelle page Performance ! 📈✨**

