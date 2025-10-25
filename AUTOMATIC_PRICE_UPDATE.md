# 🔄 Mise à jour automatique des prix - Documentation

## Vue d'ensemble

Cette fonctionnalité permet de mettre à jour automatiquement les prix des actifs via Yahoo Finance en utilisant une Supabase Edge Function.

## Architecture

```
┌─────────────────┐
│  Frontend React │
│   (Header.jsx)  │
└────────┬────────┘
         │
         │ POST avec JWT token
         │
         ▼
┌─────────────────────────────┐
│ Supabase Edge Function      │
│   update-prices             │
│ (Deno Runtime)              │
└────────┬────────────────────┘
         │
         ├─► Yahoo Finance API
         │   (fetch prices)
         │
         └─► Supabase Database
             (update assets)
```

## 📁 Fichiers créés/modifiés

### Backend (Supabase Edge Function)
- `supabase/functions/update-prices/index.ts` - Fonction principale
- `supabase/functions/_shared/cors.ts` - Headers CORS partagés
- `supabase/migrations/20251025_add_symbol_column.sql` - Migration DB

### Frontend
- `src/lib/updatePrices.js` - Utilitaire pour appeler la fonction Edge
- `src/components/Header.jsx` - Ajout du bouton et de la logique
- `src/components/AddAssetForm.jsx` - Ajout du champ `symbol`
- `src/components/EditAssetModal.jsx` - Ajout du champ `symbol`
- `src/components/AssetList.jsx` - Affichage du symbole

### Configuration
- `src/App.jsx` - Passage de la fonction `onPricesUpdated`

## 🔧 Configuration technique

### 1. Base de données

La table `assets` a été étendue avec :

```sql
-- Nouvelle colonne
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS symbol TEXT;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_assets_symbol 
ON public.assets(symbol) WHERE symbol IS NOT NULL;
```

### 2. Edge Function

**URL de la fonction :**
```
https://oqjeiwtbvsjablvmlpuw.supabase.co/functions/v1/update-prices
```

**Variables d'environnement automatiques :**
- `SUPABASE_URL` - Injectée automatiquement
- `SUPABASE_SERVICE_ROLE_KEY` - Injectée automatiquement

**Fonctionnement :**
1. Vérifie le JWT token de l'utilisateur
2. Récupère tous les assets avec un `symbol` pour cet utilisateur
3. Pour chaque asset, fait un appel à Yahoo Finance
4. Met à jour `current_price` et `last_updated` dans la DB
5. Retourne un résumé (succès/échecs)

### 3. API Yahoo Finance

**Endpoint utilisé :**
```
https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}
```

**Symboles acceptés :**
- Actions US : `AAPL`, `MSFT`, `GOOGL`
- Actions françaises : `AI.PA`, `MC.PA`
- Indices : `^FCHI` (CAC 40), `^GSPC` (S&P 500)
- Crypto : `BTC-USD`, `ETH-USD`
- Forex : `EURUSD=X`

## 🚀 Utilisation

### Ajouter un asset avec symbole

1. Allez dans "Add New Asset"
2. Remplissez les champs normalement
3. **Important** : Ajoutez le symbole Yahoo Finance
   - Exemple : `AAPL` pour Apple
   - Exemple : `BTC-USD` pour Bitcoin
   - Exemple : `^FCHI` pour le CAC 40

### Mettre à jour les prix

1. Cliquez sur le bouton **"🔄 Mettre à jour les prix"** dans le header
2. L'application va :
   - Afficher "Mise à jour..." avec un spinner
   - Appeler la fonction Edge qui interroge Yahoo Finance
   - Mettre à jour tous les assets ayant un symbole
   - Afficher un message de succès/erreur
   - Rafraîchir automatiquement les valeurs

### Résultat

Après la mise à jour :
- ✅ Les champs `current_price` sont mis à jour
- ✅ Le champ `last_updated` est mis à jour
- ✅ Les totaux sont recalculés automatiquement
- ✅ Les gains/pertes sont actualisés

## 🔒 Sécurité

### Authentification
- Chaque requête doit inclure un JWT token valide
- La fonction vérifie l'identité de l'utilisateur
- Seuls les assets de l'utilisateur connecté sont mis à jour

### Service Role Key
- ⚠️ **JAMAIS** dans le frontend
- Injectée automatiquement dans la fonction Edge par Supabase
- Permet les opérations admin côté serveur uniquement

### CORS
- Headers configurés pour accepter les requêtes du frontend
- Méthodes autorisées : `GET`, `POST`, `OPTIONS`

## 📊 Gestion des erreurs

### Symbole invalide
Si un symbole n'est pas trouvé sur Yahoo Finance :
- Le prix n'est pas mis à jour
- L'asset est marqué comme "failed" dans la réponse
- L'utilisateur voit le nombre d'échecs

### API indisponible
Si Yahoo Finance ne répond pas :
- Timeout après quelques secondes
- Erreur loggée dans la console Edge Function
- Message d'erreur affiché à l'utilisateur

### Token expiré
Si le JWT token est expiré :
- Status 401 retourné
- Message "Invalid or expired token"
- L'utilisateur doit se reconnecter

## 🧪 Tests

### Test manuel
1. Ajoutez un asset avec le symbole `AAPL`
2. Cliquez sur "Mettre à jour les prix"
3. Vérifiez que le `current_price` change
4. Vérifiez que `last_updated` est mis à jour

### Test avec symbole invalide
1. Ajoutez un asset avec le symbole `INVALID_SYMBOL_XYZ`
2. Cliquez sur "Mettre à jour les prix"
3. Vérifiez que le message indique "1 échec"

### Tester localement (optionnel)
Si Docker est installé :
```bash
# Démarrer Supabase local
supabase start

# Servir la fonction localement
supabase functions serve update-prices

# Tester avec curl
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/update-prices' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json'
```

## 🎯 Étape optionnelle : Planification automatique

Pour mettre à jour les prix automatiquement chaque jour à 7h :

```bash
supabase functions schedule create daily-price-update \
  --function update-prices \
  --cron "0 7 * * *"
```

**Note** : Cette fonctionnalité nécessite un plan Supabase Pro.

## 📈 Améliorations futures possibles

### Court terme
- [ ] Ajouter un indicateur de fraîcheur des prix (< 1h, < 24h, > 24h)
- [ ] Permettre la mise à jour d'un seul asset spécifique
- [ ] Afficher l'heure de dernière mise à jour dans le header

### Moyen terme
- [ ] Cache des prix pendant 15 minutes pour éviter trop d'appels
- [ ] Batch updates optimisés (Promise.all au lieu de séquentiel)
- [ ] Webhook pour mise à jour temps réel

### Long terme
- [ ] Support de plusieurs sources de prix (Alpha Vantage, Coinbase)
- [ ] Historique des prix pour graphiques
- [ ] Alertes de prix (push notifications)

## 🐛 Debugging

### La fonction ne se déclenche pas
1. Vérifiez que vous êtes bien connecté
2. Ouvrez la console du navigateur (F12)
3. Regardez les erreurs réseau
4. Vérifiez l'URL de la fonction dans `.env`

### Les prix ne se mettent pas à jour
1. Vérifiez que le symbole est correct
2. Testez le symbole sur Yahoo Finance directement
3. Regardez les logs Supabase : Dashboard → Edge Functions → Logs
4. Vérifiez que `symbol` n'est pas null dans la DB

### Erreur 401 Unauthorized
1. Votre token a expiré → reconnectez-vous
2. Vérifiez que `VITE_SUPABASE_URL` est correct dans `.env`

## 📚 Ressources

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Yahoo Finance API (unofficial)](https://github.com/ranaroussi/yfinance)
- [Deno Runtime](https://deno.land/)

---

**✅ Fonctionnalité déployée et opérationnelle !**

Date de création : 25 octobre 2025  
Version : 1.0.0

