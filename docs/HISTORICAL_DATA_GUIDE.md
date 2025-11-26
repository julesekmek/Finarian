# 📊 Guide Historique Automatique des Prix

Ce guide explique comment fonctionne la récupération automatique de l'historique des prix lors de l'ajout d'un nouvel actif.

## 🎯 Fonctionnalité

Quand vous ajoutez un actif avec un **symbole Yahoo Finance** (ex: AAPL, MSFT, BTC-USD), l'application récupère automatiquement l'historique complet des prix depuis le **début de l'année** en cours.

---

## 🚀 Déploiement de la Fonction

### **Étape 1 : Déployer la Fonction Edge**

```bash
# Déployer la nouvelle fonction
npx supabase functions deploy fetch-historical-prices

# Vérifier le déploiement
npx supabase functions list
```

### **Étape 2 : Tester**

Une fois déployée, testez en ajoutant un nouvel actif :

1. Allez sur votre application
2. Cliquez sur le bouton **"+"** (Ajouter un actif)
3. Remplissez le formulaire avec un symbole (ex: **AAPL**)
4. Soumettez

**Résultat attendu** :
- L'actif est créé ✅
- L'historique est récupéré en arrière-plan ✅
- Les graphiques affichent les données historiques immédiatement ✅

---

## 🔧 Comment ça fonctionne ?

### **Flux de Données**

```
┌─────────────────────────────────────────────────┐
│  1. Utilisateur ajoute un actif (ex: AAPL)     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  2. Asset créé dans la table "assets"           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  3. Appel à fetch-historical-prices             │
│     - Paramètres: assetId, symbol               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  4. Yahoo Finance interrogé                     │
│     - Période: 01/01/2025 → Aujourd'hui        │
│     - Intervalle: 1 jour                        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  5. ~250 points de prix récupérés               │
│     - Date + Prix de clôture                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  6. Insertion dans asset_history                │
│     - 1 ligne par jour                          │
│     - Upsert (évite les doublons)               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  7. ✅ Graphiques affichent l'historique        │
└─────────────────────────────────────────────────┘
```

---

## 📂 Structure des Fichiers

### **Edge Function**

```
supabase/functions/fetch-historical-prices/
├── index.ts         # Logique principale
└── deno.json        # Configuration Deno
```

### **Code Frontend**

```javascript
// src/components/AddAssetForm.jsx
// Ligne ~54-110

// Après insertion de l'asset
if (symbol.trim() && newAsset) {
  // Appel à la fonction Edge
  fetch(`${SUPABASE_URL}/functions/v1/fetch-historical-prices`, {
    method: 'POST',
    body: JSON.stringify({ assetId, symbol })
  })
}
```

---

## 🔍 Symboles Yahoo Finance

### **Exemples de Symboles Valides**

| Type | Symbole | Description |
|------|---------|-------------|
| **Actions US** | `AAPL` | Apple Inc. |
| **Actions FR** | `MC.PA` | LVMH (Paris) |
| **Crypto** | `BTC-USD` | Bitcoin en USD |
| **ETF** | `SPY` | S&P 500 ETF |
| **Indices** | `^GSPC` | S&P 500 Index |

### **Trouver un Symbole**

1. Allez sur **https://finance.yahoo.com/**
2. Cherchez votre actif
3. Le symbole est dans l'URL : `finance.yahoo.com/quote/AAPL`
4. Utilisez `AAPL` dans votre formulaire

---

## ⚙️ Configuration

### **Variables d'Environnement**

La fonction utilise automatiquement :
- `SUPABASE_URL` (fourni par Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (fourni par Supabase)

**Aucune configuration supplémentaire nécessaire !** ✅

### **Limites et Quotas**

**Yahoo Finance (Gratuit)** :
- ✅ Illimité pour usage personnel
- ✅ Pas de clé API nécessaire
- ✅ Historique jusqu'à plusieurs années

**Supabase Edge Functions (Plan Gratuit)** :
- ✅ 500,000 invocations/mois
- ✅ Largement suffisant

---

## 🐛 Dépannage

### **Problème : Aucun historique récupéré**

**Causes possibles :**
1. Symbole invalide ou incorrect
2. Asset sans symbole Yahoo Finance
3. Fonction Edge non déployée

**Solutions :**
```bash
# Vérifier les logs de la fonction
npx supabase functions logs fetch-historical-prices

# Re-déployer la fonction
npx supabase functions deploy fetch-historical-prices
```

### **Problème : Erreur 401 (Unauthorized)**

**Cause** : Token d'authentification invalide

**Solution** :
- Vérifiez que l'utilisateur est bien connecté
- Reconnectez-vous à l'application

### **Problème : Symbole non trouvé sur Yahoo Finance**

**Cause** : Le symbole n'existe pas ou est incorrect

**Solutions** :
- Vérifiez l'orthographe du symbole
- Ajoutez le suffixe du marché si nécessaire (`.PA` pour Paris, `.L` pour Londres)
- Testez le symbole sur https://finance.yahoo.com/ avant

---

## 📊 Exemples de Résultats

### **Console Browser (succès)**

```
Fetching historical data for AAPL...
✓ Historical data imported: 298 points
```

### **Console Supabase (succès)**

```
✓ Fetched 298 historical points for AAPL
✓ Historical data import complete: 298 inserted, 0 failed
```

### **Console Browser (échec gracieux)**

```
Fetching historical data for INVALID_SYMBOL...
Historical data import failed: No historical data available for this symbol
```

**Note** : L'échec de l'import historique **ne bloque pas** l'ajout de l'actif. L'actif est créé quand même, seul l'historique manque.

---

## 🔄 Mise à Jour de l'Historique

### **Données Quotidiennes**

L'historique est complété automatiquement **chaque jour** par la fonction `update-prices` :

```bash
# update-prices s'exécute régulièrement et ajoute 1 point par jour
# Pas besoin de rappeler fetch-historical-prices
```

### **Combler les Trous**

Si vous avez des assets ajoutés **avant** le déploiement de cette fonction, vous pouvez manuellement récupérer l'historique :

```javascript
// Script à exécuter dans la console browser
const { data: assets } = await supabase
  .from('assets')
  .select('id, symbol')
  .not('symbol', 'is', null)

for (const asset of assets) {
  await fetch(`${SUPABASE_URL}/functions/v1/fetch-historical-prices`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assetId: asset.id,
      symbol: asset.symbol
    })
  })
  
  // Attendre 1 seconde entre chaque appel
  await new Promise(resolve => setTimeout(resolve, 1000))
}
```

---

## 📈 Performances

### **Temps d'Exécution**

- **Récupération Yahoo Finance** : ~1-2 secondes
- **Insertion en base** : ~2-3 secondes (300 points)
- **Total** : ~3-5 secondes

**L'opération est asynchrone** : L'utilisateur n'attend pas, le formulaire se ferme immédiatement après la création de l'asset.

### **Volume de Données**

Pour 1 asset avec historique complet (1 an) :
- **~300 lignes** dans `asset_history`
- **~30 KB** de données
- Négligeable pour Supabase

---

## ✅ Checklist de Déploiement

Avant d'utiliser cette fonctionnalité :

- [ ] La fonction `fetch-historical-prices` est déployée
- [ ] Le fichier `AddAssetForm.jsx` est modifié
- [ ] La variable `VITE_SUPABASE_URL` est configurée
- [ ] Les tests ont été effectués avec un symbole valide
- [ ] Les logs Supabase confirment le bon fonctionnement

---

## 🎉 Résultat Final

Quand vous ajoutez un actif maintenant :

1. ✅ **Asset créé** instantanément
2. ✅ **Historique récupéré** automatiquement (3-5 sec)
3. ✅ **Graphiques remplis** dès le premier affichage
4. ✅ **Évolution visible** depuis le début de l'année
5. ✅ **Aucune manipulation manuelle** nécessaire

**Vos graphiques sont maintenant complets dès le premier jour !** 🚀

---

## 📞 Support

### **Documentation Supabase**
- Edge Functions : https://supabase.com/docs/guides/functions
- Database : https://supabase.com/docs/guides/database

### **API Yahoo Finance**
- Chart API : https://query1.finance.yahoo.com/v8/finance/chart/
- Symboles : https://finance.yahoo.com/lookup

---

*Guide Historique Automatique - Finarian V3*

