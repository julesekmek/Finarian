# 🧪 Guide de test - Mise à jour automatique des prix

## Checklist de test rapide

### ✅ Test 1 : Ajouter un asset avec symbole

1. Lancez l'application : `npm run dev`
2. Connectez-vous à votre compte
3. Cliquez sur "Add New Asset"
4. Remplissez :
   - **Asset Name** : Apple Stock
   - **Category** : Tech Stocks
   - **Symbole Yahoo Finance** : `AAPL`
   - **Quantité** : 10
   - **Prix d'achat unitaire** : 150.00
   - **Prix actuel** : 150.00 (optionnel)
5. Cliquez sur "Add Asset"

**Résultat attendu :**
- L'asset apparaît dans la liste
- Le badge `AAPL` est visible à côté de la catégorie
- Valeur totale = 1500€

---

### ✅ Test 2 : Mettre à jour les prix

1. Dans le header, cliquez sur **"🔄 Mettre à jour les prix"**
2. Observez le bouton pendant la mise à jour (spinner + "Mise à jour...")
3. Attendez le message de succès

**Résultat attendu :**
- Message vert : "✓ 1 prix mis à jour"
- Le `Prix actuel` de l'asset Apple change
- La `Valeur actuelle totale` est recalculée
- Le `Gain / Perte` est actualisé
- `Dernière mise à jour` affiche la date d'aujourd'hui

---

### ✅ Test 3 : Symbole invalide

1. Ajoutez un nouvel asset avec :
   - **Asset Name** : Test Asset
   - **Category** : Test
   - **Symbole Yahoo Finance** : `INVALID_XYZ_123`
   - **Quantité** : 1
   - **Prix d'achat** : 100
2. Cliquez sur "🔄 Mettre à jour les prix"

**Résultat attendu :**
- Message : "✓ 1 prix mis à jour, 1 échec(s)"
- L'asset Apple est mis à jour
- L'asset Test reste inchangé

---

### ✅ Test 4 : Éditer un asset et ajouter un symbole

1. Cliquez sur "✏️ Modifier" sur un asset sans symbole
2. Ajoutez un symbole (ex: `MSFT` pour Microsoft)
3. Cliquez sur "Enregistrer"
4. Cliquez sur "🔄 Mettre à jour les prix"

**Résultat attendu :**
- Le symbole apparaît dans la liste
- Le prix de cet asset est maintenant mis à jour

---

### ✅ Test 5 : Assets multiples

Ajoutez plusieurs assets avec différents symboles :

| Asset Name | Symbole | Type |
|------------|---------|------|
| Apple | `AAPL` | Action US |
| Microsoft | `MSFT` | Action US |
| Bitcoin | `BTC-USD` | Crypto |
| CAC 40 | `^FCHI` | Indice |
| LVMH | `MC.PA` | Action FR |

Cliquez sur "🔄 Mettre à jour les prix"

**Résultat attendu :**
- Tous les prix sont mis à jour
- Message : "✓ 5 prix mis à jour"
- Les totaux sont recalculés automatiquement

---

## 🐛 Tests de gestion d'erreur

### Test 6 : Sans connexion internet

1. Désactivez votre connexion internet
2. Cliquez sur "🔄 Mettre à jour les prix"

**Résultat attendu :**
- Message d'erreur rouge
- Les prix restent inchangés

### Test 7 : Token expiré (optionnel)

1. Ouvrez la console du navigateur (F12)
2. Allez dans Application → Storage → Local Storage
3. Supprimez la clé Supabase auth
4. Cliquez sur "🔄 Mettre à jour les prix"

**Résultat attendu :**
- Erreur d'authentification
- Redirection vers la page de connexion

---

## 📊 Vérification dans Supabase

### Logs de la fonction Edge

1. Allez sur https://supabase.com/dashboard/project/oqjeiwtbvsjablvmlpuw/functions
2. Cliquez sur "update-prices"
3. Onglet "Logs"

**Ce que vous devriez voir :**
```
Price update requested by user: <user_id>
Found X assets with symbols to update
✓ Updated AAPL: 182.52
✓ Updated MSFT: 378.91
```

### Vérification de la base de données

1. Allez sur https://supabase.com/dashboard/project/oqjeiwtbvsjablvmlpuw/editor
2. Sélectionnez la table `assets`
3. Vérifiez :
   - La colonne `symbol` existe
   - La colonne `current_price` a changé
   - La colonne `last_updated` est récente

---

## 🎯 Critères de succès global

- ✅ Le bouton "Mettre à jour les prix" est visible et fonctionnel
- ✅ Les prix sont récupérés depuis Yahoo Finance
- ✅ La base de données est mise à jour
- ✅ L'interface affiche les nouveaux prix instantanément
- ✅ Les totaux sont recalculés automatiquement
- ✅ Les erreurs sont gérées gracieusement
- ✅ Aucune clé secrète n'est exposée dans le code frontend

---

## 🚀 Test de performance

### Stress test (optionnel)

1. Ajoutez 20+ assets avec symboles différents
2. Cliquez sur "Mettre à jour les prix"
3. Observez la durée

**Résultat attendu :**
- Mise à jour complète en < 30 secondes
- Pas de timeout
- Message de succès avec le bon nombre d'assets

---

**✅ Tous les tests passés ? Félicitations, votre fonctionnalité est opérationnelle !**

