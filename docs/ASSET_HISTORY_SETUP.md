# 📊 Configuration de l'Historique des Prix (V2)

## 🎯 Objectif

Cette fonctionnalité permet de **suivre l'évolution du patrimoine dans le temps** en historisant automatiquement les prix des actifs lors des mises à jour quotidiennes.

### Caractéristiques
- ✅ **1 seul point par jour et par actif** (pas de doublons)
- ✅ Historique automatique lors des mises à jour de prix
- ✅ Si vous relancez plusieurs fois dans la journée, seul le dernier prix est conservé
- ✅ Base de données optimisée pour des requêtes temporelles rapides

---

## 🚀 Étapes d'installation

### 1️⃣ Appliquer la migration SQL

Connectez-vous à votre **tableau de bord Supabase** :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu du fichier `supabase/migrations/20251026_create_asset_history.sql`
3. Exécutez la requête (cliquez sur "Run")
4. ✅ Vérifiez que la table `asset_history` apparaît dans votre schéma

### 2️⃣ Redéployer la fonction Edge

La fonction `update-prices` a été modifiée pour inclure l'insertion dans l'historique.

**Option A : Via Supabase CLI (recommandé)**
```bash
# Depuis le répertoire du projet
supabase functions deploy update-prices
```

**Option B : Depuis le tableau de bord Supabase**
1. Allez dans **Edge Functions**
2. Cliquez sur `update-prices`
3. Copiez-collez le contenu de `supabase/functions/update-prices/index.ts`
4. Cliquez sur "Deploy"

---

## 📊 Structure de la table `asset_history`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `asset_id` | UUID | Référence vers `assets.id` |
| `user_id` | UUID | Propriétaire de l'actif |
| `price` | NUMERIC(15,2) | Prix enregistré |
| `date` | DATE | Date du snapshot (YYYY-MM-DD) |
| `recorded_at` | TIMESTAMP | Timestamp exact de l'enregistrement |

**Contrainte unique** : `(asset_id, date)` → 1 seul enregistrement par actif et par jour

---

## 🔄 Fonctionnement

### Lors d'une mise à jour de prix :

1. ✅ La fonction récupère les prix depuis Yahoo Finance
2. ✅ Met à jour `assets.current_price`
3. ✅ **UPSERT** dans `asset_history` :
   - Si un enregistrement existe pour aujourd'hui → **mise à jour du prix**
   - Sinon → **création d'un nouvel enregistrement**

### Exemple

**Matin (08h00)** : Mise à jour automatique
```
asset_history: [
  { asset_id: "xxx", date: "2025-10-26", price: 150.50 }
]
```

**Après-midi (14h00)** : Vous relancez manuellement
```
asset_history: [
  { asset_id: "xxx", date: "2025-10-26", price: 152.30 } ← Mise à jour !
]
```

---

## 📈 Requêtes SQL utiles

### Historique d'un actif sur 30 jours
```sql
SELECT 
  date,
  price,
  recorded_at
FROM asset_history
WHERE asset_id = 'ASSET_ID_HERE'
  AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

### Évolution du patrimoine total sur 30 jours
```sql
SELECT 
  h.date,
  SUM(h.price * a.quantity) as total_value,
  COUNT(DISTINCT h.asset_id) as nb_assets
FROM asset_history h
JOIN assets a ON a.id = h.asset_id
WHERE h.user_id = 'USER_ID_HERE'
  AND h.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY h.date
ORDER BY h.date DESC;
```

### Performance d'un actif (premier vs dernier prix)
```sql
WITH first_last AS (
  SELECT 
    asset_id,
    FIRST_VALUE(price) OVER (PARTITION BY asset_id ORDER BY date ASC) as first_price,
    FIRST_VALUE(price) OVER (PARTITION BY asset_id ORDER BY date DESC) as last_price
  FROM asset_history
  WHERE user_id = 'USER_ID_HERE'
)
SELECT DISTINCT
  a.name,
  a.symbol,
  fl.first_price,
  fl.last_price,
  ((fl.last_price - fl.first_price) / fl.first_price * 100) as performance_pct
FROM first_last fl
JOIN assets a ON a.id = fl.asset_id;
```

---

## 🧪 Tests

### Vérifier que l'historique est créé

1. Ajoutez un actif avec un symbole (ex: `AAPL`)
2. Cliquez sur "🔄 Mettre à jour les prix"
3. Vérifiez dans Supabase :

```sql
SELECT * FROM asset_history 
WHERE date = CURRENT_DATE 
ORDER BY recorded_at DESC;
```

### Vérifier l'UPSERT (pas de doublons)

1. Cliquez 2 fois sur "Mettre à jour les prix"
2. Vérifiez qu'il n'y a **qu'un seul enregistrement** par actif pour aujourd'hui :

```sql
SELECT asset_id, date, COUNT(*) 
FROM asset_history 
WHERE date = CURRENT_DATE
GROUP BY asset_id, date
HAVING COUNT(*) > 1; -- Devrait retourner 0 lignes
```

---

## ⏰ Automatisation quotidienne (optionnel)

Pour automatiser la mise à jour tous les matins, plusieurs options :

### Option 1 : Supabase Cron (à venir)
Supabase prévoit d'ajouter des cron jobs natifs. En attendant :

### Option 2 : GitHub Actions
Créez `.github/workflows/daily-price-update.yml` :

```yaml
name: Daily Price Update
on:
  schedule:
    - cron: '0 8 * * *' # 8h UTC = 10h Paris

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Function
        run: |
          curl -X POST \
            'https://YOUR_PROJECT.supabase.co/functions/v1/update-prices' \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

### Option 3 : Service externe (cron-job.org, EasyCron)
Configurez un appel HTTP quotidien vers votre Edge Function.

---

## 🛡️ Sécurité

- ✅ **Row Level Security (RLS)** activé
- ✅ Utilisateurs ne peuvent voir que leur propre historique
- ✅ Contrainte d'intégrité référentielle (`ON DELETE CASCADE`)
- ✅ Validation des prix positifs (`CHECK price >= 0`)

---

## 🚀 Prochaines étapes

Maintenant que l'historique est en place, vous pouvez :

1. 📊 Créer un composant React pour afficher des graphiques d'évolution
2. 📈 Calculer la performance du portefeuille sur différentes périodes
3. 🎯 Ajouter des alertes basées sur des seuils de performance
4. 📤 Exporter l'historique en CSV/PDF

---

## ❓ FAQ

**Q : Que se passe-t-il si je modifie manuellement un prix ?**  
R : Seule la fonction `update-prices` écrit dans l'historique. Les modifications manuelles n'affectent que la table `assets`.

**Q : L'historique prend-il beaucoup d'espace ?**  
R : Non. Pour 10 actifs sur 1 an = 3650 lignes (~150 KB). Très léger.

**Q : Puis-je supprimer l'historique ?**  
R : Oui. Supprimez des lignes dans `asset_history`. Si vous supprimez un actif, son historique est supprimé automatiquement (`ON DELETE CASCADE`).

**Q : Comment pré-remplir l'historique avec des données passées ?**  
R : Vous pouvez insérer manuellement des données ou utiliser l'API Yahoo Finance pour récupérer des données historiques.

---

**Prêt pour la V2 !** 🎉

