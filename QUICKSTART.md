# 🚀 Guide de démarrage rapide - Finarian

Commencez à utiliser Finarian en 5 minutes !

---

## ⚡ Installation en 3 étapes

### 1. Cloner et installer

```bash
git clone <votre-repo>
cd Finarian
npm install
```

### 2. Configuration

Créez un fichier `.env` :

```bash
VITE_SUPABASE_URL=https://oqjeiwtbvsjablvmlpuw.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xamVpd3RidnNqYWJsdm1scHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDM1NzYsImV4cCI6MjA3NjYxOTU3Nn0.GkP6i4d6lGkETeG5tQ2bA_iS4WXsl9VCHgykp7YeazI
```

### 3. Lancer

```bash
npm run dev
```

Ouvrez http://localhost:5173 🎉

---

## 🎯 Premier usage (2 minutes)

### 1. Créer un compte
- Cliquez sur "Sign Up"
- Entrez votre email et mot de passe
- Confirmez

### 2. Ajouter votre premier asset
- Remplissez le formulaire "Add New Asset"
- **Nom** : Apple Inc.
- **Catégorie** : Tech Stocks
- **Symbole Yahoo** : `AAPL`
- **Quantité** : 10
- **Prix d'achat** : 150.00
- Cliquez sur "Add Asset"

### 3. Mettre à jour les prix
- Cliquez sur "🔄 Mettre à jour les prix" dans le header
- Observez votre portefeuille se mettre à jour en temps réel !

---

## 📊 Symboles populaires

Ajoutez ces assets pour tester :

| Asset | Symbole | Type |
|-------|---------|------|
| Apple | `AAPL` | Action US |
| Bitcoin | `BTC-USD` | Crypto |
| CAC 40 | `^FCHI` | Indice |
| LVMH | `MC.PA` | Action FR |

---

## 🔄 Workflow quotidien

```
1. Se connecter
   ↓
2. Cliquer sur "Mettre à jour les prix"
   ↓
3. Observer vos gains/pertes
   ↓
4. Ajouter de nouveaux assets si besoin
   ↓
5. Éditer les quantités si vous achetez/vendez
```

---

## 💡 Astuces

### 🎯 Trouver un symbole Yahoo Finance
1. Allez sur https://finance.yahoo.com
2. Cherchez l'asset
3. Le symbole est dans l'URL

**Exemple** : https://finance.yahoo.com/quote/AAPL → Symbole = `AAPL`

### 📱 Utiliser sur mobile
L'interface est responsive, utilisez-la directement sur votre téléphone !

### ⏰ Automatiser les mises à jour
Voir `CRON_SETUP.md` pour configurer des mises à jour quotidiennes automatiques.

---

## ❓ Problèmes courants

### Le prix ne se met pas à jour ?
✅ Vérifiez que le symbole est correct sur Yahoo Finance  
✅ Assurez-vous d'être connecté  
✅ Regardez les logs dans la console (F12)

### "Unauthorized" ou "Token expired" ?
✅ Déconnectez-vous et reconnectez-vous

### Le serveur ne démarre pas ?
✅ Vérifiez que le port 5173 est libre  
✅ Relancez avec `npm run dev`

---

## 📚 Aller plus loin

- 📖 [Documentation complète](./README.md)
- 🧪 [Guide de test](./TESTING_GUIDE.md)
- 🔄 [Mise à jour automatique](./AUTOMATIC_PRICE_UPDATE.md)
- 📊 [Symboles Yahoo Finance](./YAHOO_FINANCE_SYMBOLS.md)
- ⏰ [Configuration cron](./CRON_SETUP.md)

---

## 🎉 C'est parti !

Vous êtes prêt à gérer votre portefeuille financier avec Finarian.

**Bon investissement ! 💰📈**

