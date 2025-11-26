# ⏰ Configuration de l'Automatisation Quotidienne

## 🎯 Objectif

Mettre en place une mise à jour automatique des prix de vos actifs **tous les jours à 8h UTC** (10h Paris en hiver) via GitHub Actions.

### Avantages de GitHub Actions
- ✅ **100% gratuit** (dans les limites d'utilisation)
- ✅ **Aucun serveur à gérer**
- ✅ **Exécution fiable et automatique**
- ✅ **Logs détaillés** de chaque exécution
- ✅ **Déclenchement manuel** possible depuis l'interface GitHub

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. ✅ Un compte GitHub
2. ✅ Votre projet Finarian pushé sur GitHub
3. ✅ Un utilisateur Supabase créé (via l'application)
4. ✅ Des actifs avec symboles Yahoo Finance
5. ✅ La fonction Edge `update-prices` déployée

---

## 🚀 Installation - Étape par étape

### Étape 1 : Pusher le workflow sur GitHub

Le fichier `.github/workflows/daily-price-update.yml` a été créé. Il faut maintenant le pousser sur GitHub :

```bash
cd /Users/jekmekdijan/Documents/Finarian

# Ajouter les fichiers
git add .github/workflows/daily-price-update.yml
git add scripts/test-cron.sh

# Commit
git commit -m "feat: Add automated daily price updates with GitHub Actions"

# Push
git push origin main
```

### Étape 2 : Configurer les secrets GitHub

Les secrets permettent de stocker de manière sécurisée vos identifiants.

1. **Allez sur votre dépôt GitHub** : `https://github.com/VOTRE_USERNAME/finarian`

2. **Cliquez sur "Settings"** (⚙️ en haut à droite)

3. **Dans le menu de gauche** : 
   - Cliquez sur **"Secrets and variables"**
   - Puis sur **"Actions"**

4. **Ajoutez les 4 secrets suivants** (bouton "New repository secret") :

| Nom du secret | Valeur | Où la trouver |
|---------------|--------|---------------|
| `SUPABASE_URL` | `https://XXXX.supabase.co` | Fichier `.env` → `VITE_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` (long token) | Fichier `.env` → `VITE_SUPABASE_KEY` |
| `SUPABASE_USER_EMAIL` | `votre-email@example.com` | Email utilisé pour vous connecter à l'app |
| `SUPABASE_USER_PASSWORD` | `votre-mot-de-passe` | Mot de passe de votre compte |

**⚠️ Important :** Utilisez un compte utilisateur **existant** dans Supabase Auth. Le workflow s'authentifiera avec ce compte pour appeler la fonction Edge.

### Étape 3 : Vérifier la configuration

Une fois les secrets configurés :

1. Allez dans l'onglet **"Actions"** de votre dépôt GitHub
2. Vous devriez voir le workflow **"Daily Price Update"** dans la liste
3. Cliquez dessus

### Étape 4 : Test manuel

Avant d'attendre le premier run automatique, testez manuellement :

1. Dans l'onglet **Actions**, cliquez sur **"Daily Price Update"**
2. Cliquez sur le bouton **"Run workflow"** (à droite)
3. Sélectionnez la branche `main`
4. Cliquez sur **"Run workflow"** (bouton vert)
5. Attendez ~30 secondes
6. Le workflow devrait apparaître avec un ✅ (succès) ou ❌ (échec)

### Étape 5 : Consulter les logs

1. Cliquez sur l'exécution du workflow
2. Cliquez sur le job **"update-prices"**
3. Consultez les logs détaillés :
   - Authentification réussie ?
   - Fonction Edge appelée ?
   - Combien de prix mis à jour ?
   - Y a-t-il des erreurs ?

---

## 🧪 Test local (optionnel)

Avant de configurer GitHub Actions, vous pouvez tester localement avec le script fourni.

### 1. Configurer les variables d'environnement

Ajoutez à votre fichier `.env` :

```env
# Variables existantes
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key

# Nouvelles variables pour le test
TEST_USER_EMAIL=votre-email@example.com
TEST_USER_PASSWORD=votre-mot-de-passe
```

### 2. Exécuter le script de test

```bash
./scripts/test-cron.sh
```

Vous devriez voir :

```
🧪 Testing automated price update...
==================================

📂 Loading environment variables from .env...
✅ Environment variables loaded

🔐 Step 1: Authenticating user...
✅ Authentication successful
🎟️  Token: eyJhbGciOiJIUzI1NiIs...

🔄 Step 2: Calling update-prices function...
📊 HTTP Status: 200

📋 Response:
---
{
  "message": "Price update completed",
  "updated": 5,
  "failed": 0,
  "details": { ... }
}
---

✅ Test successful! Prices updated.
📈 Updated: 5 asset(s)

🎉 The automated update is working correctly!
💡 You can now enable the GitHub Actions workflow.
```

---

## 📅 Planification

### Horaire par défaut

Le workflow est configuré pour s'exécuter **tous les jours à 8h UTC** :

```yaml
schedule:
  - cron: '0 8 * * *'  # minute heure jour mois jour_semaine
```

**Conversions** :
- 🇫🇷 **Paris** : 10h (hiver) / 9h (été)
- 🇬🇧 **Londres** : 8h (hiver) / 9h (été)
- 🇺🇸 **New York** : 3h (hiver) / 4h (été)

### Modifier l'horaire

Pour changer l'heure, éditez le fichier `.github/workflows/daily-price-update.yml` :

```yaml
# Exemples de configurations

# Tous les jours à 7h UTC (9h Paris hiver)
- cron: '0 7 * * *'

# Tous les jours à 12h UTC (14h Paris hiver)
- cron: '0 12 * * *'

# Deux fois par jour (8h et 18h UTC)
schedule:
  - cron: '0 8 * * *'
  - cron: '0 18 * * *'

# Seulement les jours de semaine (lundi-vendredi)
- cron: '0 8 * * 1-5'

# Toutes les heures (de 8h à 18h UTC)
- cron: '0 8-18 * * *'
```

**Format cron** : `minute heure jour mois jour_semaine`
- `*` = tous
- `1-5` = du lundi au vendredi
- `8-18` = de 8h à 18h

---

## 📊 Monitoring et logs

### Consulter l'historique des exécutions

1. Allez dans l'onglet **"Actions"** sur GitHub
2. Cliquez sur **"Daily Price Update"**
3. Vous verrez la liste de toutes les exécutions :
   - ✅ Succès (vert)
   - ❌ Échec (rouge)
   - 🟡 En cours (jaune)

### Analyser une exécution

Cliquez sur une exécution pour voir :
- **Durée** de l'exécution
- **Logs détaillés** de chaque étape
- **Nombre d'actifs** mis à jour
- **Erreurs** éventuelles

### Notifications par email

GitHub envoie automatiquement un email si :
- Le workflow échoue pour la première fois
- Le workflow réussit après avoir échoué

Pour configurer les notifications :
1. **Settings** → **Notifications** (votre profil GitHub)
2. Section **"Actions"**
3. Cochez **"Send notifications for failed workflows"**

---

## 🛠️ Dépannage

### Problème 1 : "Authentication failed"

**Symptôme** : Le workflow échoue avec "❌ Authentication failed"

**Causes possibles** :
1. Email ou mot de passe incorrect dans les secrets GitHub
2. L'utilisateur n'existe pas dans Supabase Auth
3. Le compte est désactivé

**Solutions** :
1. Vérifiez que vous pouvez vous connecter à l'application avec ces identifiants
2. Allez dans **Settings → Secrets** sur GitHub et vérifiez les secrets
3. Recréez les secrets si nécessaire

### Problème 2 : "Price update failed"

**Symptôme** : Authentification OK mais mise à jour échoue

**Causes possibles** :
1. La fonction Edge `update-prices` n'est pas déployée
2. Erreur dans la fonction Edge
3. Problème de RLS (Row Level Security) dans Supabase

**Solutions** :
1. Vérifiez que la fonction Edge existe dans Supabase
2. Testez manuellement depuis l'application
3. Consultez les logs de la fonction Edge dans Supabase

### Problème 3 : "No assets with symbols found"

**Symptôme** : Le workflow réussit mais 0 actifs mis à jour

**Causes possibles** :
1. Aucun actif avec un symbole Yahoo Finance
2. L'utilisateur n'a pas d'actifs

**Solutions** :
1. Connectez-vous à l'application
2. Ajoutez des symboles à vos actifs (ex: AAPL, BTC-USD)
3. Relancez le workflow manuellement

### Problème 4 : Le workflow ne s'exécute pas automatiquement

**Symptôme** : Aucune exécution automatique (scheduled)

**Causes possibles** :
1. Le dépôt est privé et inactif depuis 60 jours
2. Le workflow est désactivé
3. Erreur de syntaxe dans le cron

**Solutions** :
1. Faites un commit/push pour "réveiller" le dépôt
2. Vérifiez que le workflow est activé (onglet Actions)
3. Déclenchez manuellement pour vérifier

### Problème 5 : "Invalid or expired token"

**Symptôme** : Token d'authentification invalide

**Causes possibles** :
1. Le mot de passe a été changé
2. L'utilisateur a été supprimé
3. Session expirée

**Solutions** :
1. Mettez à jour le secret `SUPABASE_USER_PASSWORD`
2. Vérifiez que le compte existe toujours
3. Relancez le workflow

---

## 🔒 Sécurité

### Bonnes pratiques

✅ **À faire** :
- Utilisez les secrets GitHub (jamais de credentials en dur)
- Utilisez un compte dédié si possible (ex: `bot@finarian.com`)
- Changez régulièrement le mot de passe
- Surveillez les logs d'exécution
- Désactivez le workflow si vous ne l'utilisez plus

❌ **À éviter** :
- Ne commitez JAMAIS les credentials dans le code
- N'utilisez pas votre compte personnel principal
- Ne partagez pas les secrets
- Ne laissez pas le workflow actif sur un dépôt public avec des credentials

### Compte utilisateur dédié (recommandé)

Pour plus de sécurité, créez un compte utilisateur spécifique pour le bot :

1. Créez un nouveau compte : `bot@votre-domaine.com`
2. Connectez-vous avec ce compte dans l'application
3. Assurez-vous qu'il a accès aux actifs (via RLS)
4. Utilisez ces credentials dans les secrets GitHub

---

## 📈 Optimisations avancées

### Exécution conditionnelle

Exécuter seulement les jours de semaine (éviter weekends) :

```yaml
schedule:
  - cron: '0 8 * * 1-5'  # Lundi à vendredi seulement
```

### Notifications Slack/Discord (optionnel)

Ajoutez une étape pour envoyer une notification :

```yaml
- name: Send notification
  if: success()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"✅ Prices updated successfully!"}'
```

### Retry en cas d'échec

Ajoutez un retry automatique :

```yaml
- name: Call Supabase Edge Function
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 5
    max_attempts: 3
    command: |
      # ... votre commande curl
```

---

## 📊 Statistiques d'utilisation

### Limites GitHub Actions (compte gratuit)

- **2 000 minutes/mois** pour les dépôts privés
- **Illimité** pour les dépôts publics
- Ce workflow utilise **~1 minute/jour** = **30 minutes/mois**

### Surveillance de l'utilisation

1. **GitHub** → **Settings** → **Billing**
2. Section **"Actions"**
3. Consultez les minutes utilisées

---

## 🔮 Alternatives

Si GitHub Actions ne convient pas, voici d'autres options :

### 1. Supabase Cron (à venir)
Supabase prévoit d'ajouter des cron jobs natifs. Surveillez les annonces.

### 2. Services externes
- **cron-job.org** (gratuit, simple)
- **EasyCron** (gratuit avec limitations)
- **Zapier** (payant, très visuel)

### 3. Serveur personnel
Si vous avez un serveur Linux :

```bash
# Ajouter au crontab
0 8 * * * /path/to/scripts/test-cron.sh
```

---

## ✅ Checklist de vérification

Avant de considérer la configuration terminée :

- [ ] Workflow pushé sur GitHub
- [ ] 4 secrets configurés (URL, KEY, EMAIL, PASSWORD)
- [ ] Test manuel réussi
- [ ] Logs consultés et validés
- [ ] Au moins 1 actif avec symbole
- [ ] Historique actif dans la base de données
- [ ] Notifications configurées (optionnel)
- [ ] Documentation lue et comprise

---

## ❓ FAQ

**Q : Le workflow compte dans mon quota GitHub ?**  
R : Oui, mais il utilise seulement ~1 minute/jour. Pour un compte gratuit (2000 min/mois), c'est largement suffisant.

**Q : Puis-je exécuter plusieurs fois par jour ?**  
R : Oui ! Ajoutez plusieurs lignes cron dans le schedule. Mais attention : Yahoo Finance peut limiter si vous appelez trop souvent.

**Q : Le workflow fonctionne sur un dépôt privé ?**  
R : Oui, mais les minutes sont comptabilisées (2000/mois gratuit).

**Q : Que se passe-t-il si mon mot de passe change ?**  
R : Le workflow échouera. Mettez à jour le secret `SUPABASE_USER_PASSWORD` sur GitHub.

**Q : Puis-je désactiver temporairement l'automatisation ?**  
R : Oui. Allez dans Actions → Daily Price Update → "..." → Disable workflow.

**Q : Les prix sont-ils garantis d'être à jour ?**  
R : Non. Yahoo Finance peut avoir des délais ou être indisponible. C'est pourquoi on garde un bouton manuel dans l'app.

**Q : Comment savoir si ça a fonctionné ce matin ?**  
R : Allez dans l'onglet Actions sur GitHub, ou consultez l'historique dans votre base de données.

---

## 🎉 Résultat attendu

Une fois configuré, chaque matin :

1. ⏰ **8h00 UTC** : GitHub Actions se déclenche
2. 🔐 **Authentification** : Connexion avec votre compte
3. 🔄 **Mise à jour** : Appel de la fonction Edge
4. 📊 **Historique** : Nouveau point de données dans `asset_history`
5. 📈 **Graphiques** : Mise à jour automatique dans l'application
6. ✅ **Notification** : Email de GitHub (si configuré)

**Vous n'avez plus rien à faire !** 🎊

---

**Automatisation configurée et fonctionnelle ! ⏰✨**

