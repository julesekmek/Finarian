# 📊 Guide du Graphique d'Évolution du Patrimoine

## 🎯 Vue d'ensemble

Le graphique d'évolution du patrimoine permet de visualiser la performance de votre portefeuille au fil du temps. Il affiche :

- ✅ Évolution visuelle de la valeur totale du patrimoine
- ✅ Sélection de période (7, 30 ou 90 jours)
- ✅ Indicateurs de performance clés
- ✅ Ligne de tendance colorée selon la performance
- ✅ Graphique interactif avec tooltip détaillé

---

## 📦 Fichiers créés

### 1. `src/lib/portfolioHistory.js`

Fonctions utilitaires pour récupérer et calculer l'historique du patrimoine :

- **`getPortfolioHistory(userId, days)`** : Récupère les données historiques depuis `asset_history`
- **`calculatePerformanceMetrics(history)`** : Calcule les métriques de performance

### 2. `src/components/PortfolioChart.jsx`

Composant React principal qui affiche le graphique avec Recharts.

### 3. Intégration dans `src/App.jsx`

Le composant est automatiquement affiché dans le dashboard après connexion.

---

## 🎨 Fonctionnalités

### 1️⃣ Sélection de période

Trois boutons permettent de changer la période affichée :
- **7J** : Évolution sur 7 jours (vue court terme)
- **30J** : Évolution sur 30 jours (vue mensuelle, par défaut)
- **90J** : Évolution sur 90 jours (vue trimestrielle)

### 2️⃣ Indicateurs de performance

Quatre métriques clés sont affichées au-dessus du graphique :

| Indicateur | Description |
|------------|-------------|
| **Valeur actuelle** | Valeur totale du portefeuille aujourd'hui |
| **Valeur initiale** | Valeur au début de la période sélectionnée |
| **Variation** | Différence absolue en € (vert si positif, rouge si négatif) |
| **Performance** | Variation en pourcentage |

### 3️⃣ Graphique interactif

- **Graphique en aires** avec dégradé de couleur
- **Couleur dynamique** selon la tendance :
  - 🟢 Vert : Performance positive (> +0.5%)
  - 🔴 Rouge : Performance négative (< -0.5%)
  - 🔵 Bleu : Performance neutre
- **Tooltip** : Survolez le graphique pour voir la valeur exacte à une date donnée
- **Responsive** : S'adapte automatiquement à toutes les tailles d'écran

### 4️⃣ États d'affichage

Le composant gère automatiquement différents états :

- **Chargement** : Animation de skeleton pendant le chargement
- **Vide** : Message informatif si aucune donnée historique
- **Erreur** : Affichage d'un message d'erreur en cas de problème
- **Données** : Affichage du graphique complet

---

## 🔧 Comment ça fonctionne

### Flux de données

1. **Composant chargé** → Appel de `getPortfolioHistory(userId, period)`
2. **Requête SQL** → Récupération des données de `asset_history` pour la période
3. **Calcul** → Agrégation des prix × quantités par jour
4. **Métriques** → Calcul de la performance via `calculatePerformanceMetrics()`
5. **Affichage** → Rendu du graphique avec Recharts

### Requête SQL sous-jacente

```sql
-- Récupère l'historique des prix pour les X derniers jours
SELECT date, price, asset_id
FROM asset_history
WHERE user_id = 'USER_ID'
  AND date >= CURRENT_DATE - INTERVAL 'X days'
ORDER BY date ASC
```

Puis :
- Joint avec la table `assets` pour obtenir les quantités
- Calcule `valeur = prix × quantité` pour chaque actif
- Agrège par jour pour obtenir la valeur totale du portefeuille

---

## 💡 Exemples d'utilisation

### Cas 1 : Voir la performance hebdomadaire

1. Cliquez sur le bouton **7J**
2. Observez l'évolution sur la dernière semaine
3. Regardez les métriques : si vous êtes en vert (+X%), votre portefeuille a gagné de la valeur

### Cas 2 : Comparer les périodes

1. Cliquez sur **7J** : Performance court terme
2. Puis sur **30J** : Performance mensuelle
3. Puis sur **90J** : Performance trimestrielle
4. Comparez les pourcentages pour voir quelle période a été la meilleure

### Cas 3 : Identifier les tendances

- **Courbe ascendante** 📈 : Votre patrimoine augmente
- **Courbe descendante** 📉 : Votre patrimoine diminue
- **Courbe plate** ➡️ : Votre patrimoine est stable

---

## 🎨 Personnalisation

### Changer la devise

Modifiez la fonction `formatCurrency` dans `PortfolioChart.jsx` :

```jsx
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {  // Changez 'fr-FR' en 'en-US'
    style: 'currency',
    currency: 'USD',  // Changez 'EUR' en 'USD'
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
```

### Ajouter d'autres périodes

Dans `PortfolioChart.jsx`, modifiez le tableau des périodes :

```jsx
{[7, 30, 90, 180, 365].map((days) => (  // Ajoutez 180 et 365 par exemple
  <button
    key={days}
    onClick={() => setPeriod(days)}
    className={...}
  >
    {days}J
  </button>
))}
```

### Changer le type de graphique

Remplacez `AreaChart` par `LineChart` dans le composant :

```jsx
<LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
  <Line 
    type="monotone" 
    dataKey="value" 
    stroke={trendColor}
    strokeWidth={2}
    dot={false}
  />
</LineChart>
```

---

## 🚀 Fonctionnalités futures possibles

### Idées d'amélioration

1. **Comparaison avec un indice** 📊
   - Ajouter une ligne pour comparer avec le CAC40, S&P500, etc.
   
2. **Graphique par actif** 💰
   - Cliquer sur un actif pour voir son évolution individuelle
   
3. **Annotations** 📝
   - Marquer des événements importants sur le graphique (achat, vente, etc.)
   
4. **Export** 📤
   - Télécharger le graphique en PNG
   - Exporter les données en CSV
   
5. **Période personnalisée** 📅
   - Date picker pour sélectionner une plage précise
   
6. **Multiple métriques** 📈
   - Afficher plusieurs lignes (valeur investie vs valeur actuelle)
   - Afficher le gain/perte latent

---

## 🧪 Tests

### Test manuel

1. **Vérifier l'affichage vide**
   - Connectez-vous avec un compte qui n'a jamais mis à jour les prix
   - Vérifiez que le message "Aucune donnée historique disponible" s'affiche

2. **Vérifier les données**
   - Ajoutez des actifs avec des symboles
   - Cliquez sur "🔄 Mettre à jour les prix"
   - Actualisez la page
   - Le graphique devrait afficher au moins 1 point (aujourd'hui)

3. **Vérifier la sélection de période**
   - Cliquez sur chaque bouton (7J, 30J, 90J)
   - Vérifiez que le graphique se met à jour
   - Vérifiez que les métriques changent

4. **Vérifier le tooltip**
   - Survolez le graphique avec la souris
   - Un tooltip devrait apparaître avec la date et la valeur

---

## ❓ FAQ

**Q : Le graphique est vide, pourquoi ?**  
R : Vous devez avoir des données dans la table `asset_history`. Cliquez sur "Mettre à jour les prix" pour créer le premier point de données.

**Q : J'ai mis à jour les prix mais le graphique ne s'affiche toujours pas**  
R : Actualisez la page (F5) ou attendez quelques secondes. Le composant recharge automatiquement après les mises à jour.

**Q : Puis-je voir l'évolution d'un seul actif ?**  
R : Pour le moment, le graphique affiche la valeur totale du portefeuille. Une vue par actif pourra être ajoutée dans une prochaine version.

**Q : Les performances affichées incluent-elles les dividendes ?**  
R : Non, seule la variation de prix est prise en compte. Les dividendes ne sont pas trackés pour le moment.

**Q : Puis-je exporter les données du graphique ?**  
R : Pas encore implémenté, mais vous pouvez exporter les données depuis Supabase (Table Editor → Export to CSV).

---

## 🛠️ Dépendances

Le graphique utilise **Recharts**, une bibliothèque de graphiques pour React :

```bash
npm install recharts
```

Déjà installé dans votre projet ! ✅

---

## 📚 Ressources

- [Documentation Recharts](https://recharts.org/)
- [Exemples Recharts](https://recharts.org/en-US/examples)
- [Supabase Queries](https://supabase.com/docs/reference/javascript/select)

---

**Profitez de votre nouveau graphique d'évolution ! 📊✨**

