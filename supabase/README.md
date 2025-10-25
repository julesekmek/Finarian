# 🔧 Supabase - Configuration et fonctions

Ce dossier contient la configuration Supabase de Finarian, incluant les Edge Functions et les migrations de base de données.

## 📁 Structure

```
supabase/
├── functions/                    # Edge Functions (Deno)
│   ├── _shared/                 # Utilitaires partagés
│   │   └── cors.ts              # Configuration CORS
│   └── update-prices/           # Fonction de mise à jour des prix
│       ├── index.ts             # Code principal
│       └── deno.json            # Config Deno
├── migrations/                   # Migrations SQL
│   ├── 20251025153835_remote_schema.sql
│   └── 20251025_add_symbol_column.sql
└── config.toml                  # Config projet (optionnel)
```

---

## 🚀 Edge Functions

### update-prices

**URL de production :**
```
https://oqjeiwtbvsjablvmlpuw.supabase.co/functions/v1/update-prices
```

**Rôle :**
- Récupère les prix depuis Yahoo Finance
- Met à jour la table `assets` avec les nouveaux prix
- Vérifie l'authentification JWT
- Gère les erreurs gracieusement

**Variables d'environnement automatiques :**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Commandes utiles :**

```bash
# Déployer la fonction
npx supabase functions deploy update-prices

# Voir les logs
npx supabase functions logs update-prices

# Tester localement (nécessite Docker)
npx supabase functions serve update-prices
```

---

## 🗄️ Migrations

### 20251025_add_symbol_column.sql

Ajoute la colonne `symbol` à la table `assets` pour stocker les symboles Yahoo Finance.

**Appliquer manuellement :**
```bash
npx supabase db push
```

**Vérifier l'état :**
```bash
npx supabase migration list
```

---

## 🔐 Secrets

Les secrets sont injectés automatiquement par Supabase dans l'environnement des Edge Functions.

**Pas besoin de configuration manuelle !** ✅

---

## 🛠️ Développement

### Créer une nouvelle fonction

```bash
npx supabase functions new ma-fonction
```

### Créer une nouvelle migration

```bash
npx supabase migration new nom_de_la_migration
```

### Se connecter au projet

```bash
npx supabase link --project-ref oqjeiwtbvsjablvmlpuw
```

---

## 📚 Documentation

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.land/)
- [Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

---

**⚡ Toutes les fonctions sont déployées et opérationnelles !**

