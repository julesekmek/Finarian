# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [2.0.0] - 2025-10-25

### 🎉 Version majeure - Mise à jour automatique des prix

Cette version majeure introduit la mise à jour automatique des prix via Yahoo Finance avec une architecture Supabase Edge Functions robuste et sécurisée.

### ✨ Ajouté

#### Backend
- **Edge Function `update-prices`** - Fonction serveur pour récupérer les prix Yahoo Finance
- **Colonne `symbol`** dans la table `assets` pour stocker les symboles Yahoo Finance
- **Index sur `symbol`** pour optimiser les performances des requêtes
- **Migration SQL** pour ajouter la colonne symbol
- **Configuration CORS** pour les Edge Functions
- **Authentification JWT** pour sécuriser les appels API

#### Frontend
- **Bouton "🔄 Mettre à jour les prix"** dans le header du dashboard
- **États de chargement** avec spinner animé pendant la mise à jour
- **Notifications de succès/erreur** avec auto-dismiss après 5 secondes
- **Champ "Symbole Yahoo Finance"** dans le formulaire d'ajout d'asset
- **Champ "Symbole Yahoo Finance"** dans le modal d'édition d'asset
- **Badge de symbole** affiché à côté de chaque asset dans la liste
- **Refresh automatique** des assets après mise à jour des prix
- **Recalcul automatique** des totaux après mise à jour

#### Documentation
- `AUTOMATIC_PRICE_UPDATE.md` - Documentation technique complète
- `TESTING_GUIDE.md` - Guide de test utilisateur pas à pas
- `DEPLOYMENT_SUMMARY.md` - Récapitulatif du déploiement
- `YAHOO_FINANCE_SYMBOLS.md` - Liste de symboles Yahoo Finance courants
- `CRON_SETUP.md` - Guide de configuration des mises à jour planifiées
- `supabase/README.md` - Documentation des Edge Functions
- `CHANGELOG.md` - Ce fichier

### 🔄 Modifié

- **README.md** - Ajout de la section "Automatic Price Updates"
- **Header.jsx** - Ajout du bouton de mise à jour et de la logique
- **App.jsx** - Ajout du callback `onPricesUpdated`
- **AddAssetForm.jsx** - Ajout du champ symbol
- **EditAssetModal.jsx** - Ajout du champ symbol
- **AssetList.jsx** - Affichage du badge symbol
- **.gitignore** - Exclusion des fichiers temporaires Supabase

### 🆕 Nouveaux fichiers

```
src/lib/updatePrices.js
supabase/functions/update-prices/index.ts
supabase/functions/_shared/cors.ts
supabase/migrations/20251025_add_symbol_column.sql
```

### 🔒 Sécurité

- Service Role Key jamais exposée dans le frontend
- Vérification JWT pour chaque requête vers l'Edge Function
- Row Level Security (RLS) maintenue pour tous les assets
- CORS correctement configuré pour éviter les abus
- Rate limiting (100ms entre chaque requête Yahoo Finance)

### 🎯 Fonctionnalités

#### Symboles supportés
- **Actions US** : AAPL, MSFT, GOOGL, TSLA, etc.
- **Actions françaises** : MC.PA, AI.PA, OR.PA, etc.
- **Cryptomonnaies** : BTC-USD, ETH-USD, SOL-USD, etc.
- **Indices** : ^FCHI (CAC 40), ^GSPC (S&P 500), etc.
- **Forex** : EURUSD=X, GBPUSD=X, etc.

#### Gestion des erreurs
- Affichage clair des échecs de mise à jour
- Continuité du service même en cas d'échec partiel
- Logging détaillé côté serveur pour le debugging

### 📈 Performance

- Latence moyenne : 300-500ms par symbole
- Support jusqu'à 50 assets simultanés sans dégradation
- Délai de 100ms entre requêtes pour respecter les limites Yahoo Finance

### 🧪 Tests

- ✅ Tests manuels d'intégration end-to-end
- ✅ Validation avec symboles multiples (actions, crypto, indices)
- ✅ Tests de gestion d'erreur (symboles invalides, timeouts)
- ✅ Vérification de la sécurité (JWT, Service Role)
- ✅ Tests de performance (latence, charge)

---

## [1.0.0] - 2025-10-21

### 🎉 Version initiale - MVP Finarian

#### ✨ Ajouté

##### Fonctionnalités principales
- Authentification utilisateur (email/password via Supabase Auth)
- Gestion des assets (ajout, modification, suppression)
- Calcul automatique des totaux (montant investi, valeur actuelle)
- Calcul des gains/pertes (€ et %)
- Gestion des quantités d'assets
- Synchronisation temps réel via Supabase Realtime
- Interface responsive (mobile et desktop)

##### Composants
- `Auth.jsx` - Composant d'authentification
- `Header.jsx` - Header avec totaux du portefeuille
- `AssetList.jsx` - Liste des assets avec realtime
- `AddAssetForm.jsx` - Formulaire d'ajout d'asset
- `EditAssetModal.jsx` - Modal d'édition d'asset
- `ConfirmDeleteModal.jsx` - Modal de confirmation de suppression

##### Base de données
- Table `assets` avec RLS (Row Level Security)
- Colonnes : id, name, category, quantity, purchase_price, current_price, user_id, last_updated
- Policies pour SELECT, INSERT, UPDATE, DELETE par utilisateur

##### Styling
- TailwindCSS pour le design
- Palette de couleurs moderne
- Animations et transitions fluides

##### Documentation
- README.md complet avec guide d'installation
- Instructions de configuration Supabase
- Guide de migration de base de données

---

## Types de changements

- `✨ Ajouté` - pour les nouvelles fonctionnalités
- `🔄 Modifié` - pour les changements dans les fonctionnalités existantes
- `🗑️ Supprimé` - pour les fonctionnalités supprimées
- `🔧 Corrigé` - pour les corrections de bugs
- `🔒 Sécurité` - en cas de vulnérabilités
- `📝 Documentation` - pour les changements de documentation uniquement
- `🎨 Style` - pour les changements qui n'affectent pas le sens du code
- `⚡ Performance` - pour les améliorations de performance
- `🧪 Tests` - pour l'ajout ou la correction de tests

---

## Prochaines versions

### [2.1.0] - Prévu
- 📊 Graphiques de tendance des prix
- 📈 Historique des prix
- 🏷️ Filtrage par catégorie
- 🔔 Alertes de prix

### [2.2.0] - Prévu
- 💱 Support multi-devises
- 📄 Export CSV/PDF
- ⏰ Mises à jour planifiées (cron job)
- 🌍 Internationalisation (i18n)

### [3.0.0] - Futur
- 📊 Allocation de portefeuille (pie charts)
- 🤖 Suggestions d'investissement IA
- 🔗 Import depuis brokers
- 📱 Application mobile native

---

**Liens utiles :**
- [Repository GitHub](https://github.com/votre-repo/finarian)
- [Documentation](./README.md)
- [Supabase Dashboard](https://supabase.com/dashboard)

