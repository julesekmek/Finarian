# 🚀 Guide de Déploiement Render

Ce guide vous explique comment déployer Finarian sur Render.com en quelques minutes.

## 📋 Prérequis

- ✅ Compte GitHub (avec le repo Finarian)
- ✅ Compte Supabase configuré
- ✅ Node.js installé localement (pour tester)

---

## 🌐 Étape 1 : Créer un Compte Render

1. Allez sur **https://render.com/**
2. Cliquez sur **"Get Started for Free"**
3. Connectez-vous avec **GitHub**
4. Autorisez Render à accéder à vos repositories

---

## 📦 Étape 2 : Créer un Static Site

### 2.1 - Nouveau Service

1. Sur le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Static Site"**

### 2.2 - Connecter le Repository

1. Cherchez **"Finarian"** dans la liste
2. Cliquez sur **"Connect"**

### 2.3 - Configuration

Remplissez les champs suivants :

**Name** : `finarian` (ou le nom de votre choix)

**Branch** : `main`

**Build Command** :
```bash
npm install && npm run build
```

**Publish Directory** :
```
dist
```

### 2.4 - Variables d'Environnement

Cliquez sur **"Advanced"** puis ajoutez ces variables :

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Votre URL Supabase (ex: `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Votre clé publique Supabase |

**Où trouver vos clés Supabase ?**
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **API**
4. Copiez :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`

### 2.5 - Créer le Site

Cliquez sur **"Create Static Site"**

---

## ⏳ Étape 3 : Déploiement

Le déploiement démarre automatiquement :

1. **Installation des dépendances** (~1 min)
2. **Build de l'application** (~1 min)
3. **Déploiement sur le CDN** (~30 sec)

**Durée totale** : 2-3 minutes

Vous pouvez suivre les logs en temps réel dans l'interface Render.

---

## 🔧 Étape 4 : Configuration Supabase

Pour que l'authentification fonctionne, ajoutez votre URL Render dans Supabase :

1. Allez sur **Supabase Dashboard**
2. **Authentication** → **URL Configuration**
3. Dans **Site URL**, ajoutez :
   ```
   https://finarian.onrender.com
   ```
4. Dans **Redirect URLs**, ajoutez :
   ```
   https://finarian.onrender.com
   https://finarian.onrender.com/**
   ```

---

## ✅ Étape 5 : Vérification

Une fois le déploiement terminé :

1. Cliquez sur l'URL fournie par Render (ex: `https://finarian.onrender.com`)
2. Testez :
   - ✅ La page se charge
   - ✅ Connexion fonctionne
   - ✅ Les données s'affichent
   - ✅ Les graphiques fonctionnent
   - ✅ La navigation est fluide

---

## 🔄 Déploiements Automatiques

**Super !** Render déploie automatiquement à chaque push sur `main` :

```bash
# Faire des modifications
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# 🚀 Déploiement automatique sur Render !
```

Vous recevrez une notification par email à chaque déploiement.

---

## 💰 Plan Gratuit

Le plan gratuit Render inclut :

✅ **Avantages**
- 100 GB de bande passante/mois
- Déploiements illimités
- SSL/HTTPS automatique
- CDN global
- Builds automatiques
- Custom domain support

⚠️ **Limitations**
- Le service s'endort après 15 min d'inactivité
- Redémarrage en ~30 secondes à la première visite
- 750 heures/mois (suffisant pour usage personnel)

---

## 🎯 Domaine Personnalisé (Optionnel)

Pour utiliser votre propre domaine (ex: `app.finarian.com`) :

1. Sur Render, allez dans **Settings** → **Custom Domains**
2. Cliquez sur **"Add Custom Domain"**
3. Entrez votre domaine
4. Configurez les DNS chez votre registrar :
   ```
   Type: CNAME
   Name: app (ou @)
   Value: finarian.onrender.com
   ```

---

## 📊 Monitoring

### Dashboard Render

Vous pouvez monitorer :
- 📈 Trafic et bande passante
- 📝 Logs en temps réel
- ⚙️ Statut des builds
- 🔄 Historique des déploiements
- 💾 Utilisation des ressources

### Notifications

Configurez les notifications dans **Settings** → **Notifications** :
- ✅ Email pour chaque déploiement
- ✅ Alertes en cas d'erreur
- ✅ Status updates

---

## 🐛 Troubleshooting

### Erreur : "Build failed"

**Causes possibles :**
1. Erreur de syntaxe dans le code
2. Dépendances manquantes
3. Variables d'environnement incorrectes

**Solution :**
- Vérifiez les logs de build
- Testez localement : `npm run build`
- Vérifiez les variables d'environnement

### Erreur : "Cannot connect to Supabase"

**Causes possibles :**
1. Variables d'environnement incorrectes
2. URL non autorisée dans Supabase

**Solution :**
- Vérifiez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- Ajoutez votre URL Render dans Supabase Auth settings

### Page blanche après déploiement

**Causes possibles :**
1. Erreur JavaScript
2. Variables d'environnement manquantes

**Solution :**
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs
- Assurez-vous que toutes les variables sont configurées

---

## 🔐 Sécurité

### Variables d'Environnement

- ✅ Ne committez JAMAIS les vraies clés dans git
- ✅ Utilisez `.env.example` pour la documentation
- ✅ Configurez les vraies clés uniquement sur Render

### HTTPS

- ✅ SSL automatique fourni par Render
- ✅ Certificats renouvelés automatiquement
- ✅ Redirection HTTP → HTTPS automatique

### Headers de Sécurité

Déjà configurés dans `render.yaml` :
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Cache-Control` pour optimiser les performances

---

## 📞 Support

### Documentation Render
- https://render.com/docs/static-sites

### Support Render
- https://render.com/support

### Community
- Discord : https://discord.gg/render

---

## 🎉 Félicitations !

Votre application Finarian est maintenant déployée et accessible publiquement !

**URL de production** : `https://finarian.onrender.com`

Partagez-la avec vos utilisateurs et profitez de votre portfolio en ligne ! 🚀

---

*Guide de déploiement Finarian - Render.com*

