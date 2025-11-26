# 🔧 Troubleshooting V3

## ✅ Problèmes Résolus

### ❌ Problème 1 : Menu latéral invisible

**Symptôme** : Le sidebar ne s'affiche pas sur desktop

**Cause** : Animation Framer Motion qui cachait la sidebar sur tous les écrans

**Solution** : ✅ Remplacé `motion.aside` par `aside` classique avec classes Tailwind conditionnelles
- Desktop : `md:translate-x-0 md:static` → toujours visible
- Mobile : `-translate-x-full` par défaut, `translate-x-0` quand ouvert

---

### ❌ Problème 2 : Erreur Tailwind CSS

**Symptôme** : 
```
The `bg-accent-primary` class does not exist
```

**Cause** : Impossible d'utiliser des classes custom Tailwind imbriquées dans `@apply`

**Solution** : ✅ Utilisation de CSS natif dans `.btn-primary`
```css
.btn-primary {
  background-color: #F1C086;
}
.btn-primary:hover {
  background-color: rgba(241, 192, 134, 0.9);
}
```

---

### ❌ Problème 3 : Graphiques avec width/height négatifs

**Symptôme** :
```
The width(-1) and height(-1) of chart should be greater than 0
```

**Cause** : Le conteneur flex n'avait pas de largeur définie, les graphiques ne pouvaient pas se dimensionner

**Solution** : ✅ Ajout de classes pour forcer les dimensions
- App.jsx : `min-w-0` sur le conteneur principal
- App.jsx : `w-full` sur main et max-w-7xl
- PortfolioChart.jsx : `min-h-[320px]` sur le conteneur du graphique
- AssetPerformanceCard.jsx : `min-h-[80px]` et `min-h-[224px]` sur les graphiques

---

## 🚀 Si l'Application ne Démarre Pas

### Étape 1 : Clear Cache
```bash
rm -rf node_modules/.vite
rm -rf dist
```

### Étape 2 : Redémarrer
```bash
npm run dev
```

### Étape 3 : Hard Reload
Dans le navigateur :
- Chrome/Firefox : `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
- Ou : `Ctrl+F5`

---

## 🐛 Problèmes Potentiels

### Le menu hamburger ne s'ouvre pas (mobile)

**Vérifier** :
1. Largeur d'écran < 768px
2. Console JavaScript pour erreurs
3. Le bouton est bien visible en haut à gauche

**Solution** :
- Ouvrir DevTools (F12)
- Mode responsive (Ctrl+Shift+M)
- Cliquer sur le bouton menu (☰)

---

### La sidebar couvre le contenu (mobile)

**Normal** : C'est le comportement attendu quand le menu est ouvert

**Pour fermer** :
- Cliquer sur le backdrop (zone sombre)
- Cliquer sur le bouton X
- Sélectionner une page dans le menu

---

### Les couleurs sont encore vertes

**Cause** : Cache du navigateur

**Solution** :
```bash
# 1. Rebuild
npm run build

# 2. Hard reload dans le navigateur
Ctrl+Shift+R
```

---

### Les graphiques ne s'affichent pas

**Vérifier** :
1. Console → Erreurs ?
2. Réseau → Supabase accessible ?
3. Données présentes dans la base ?

**Solution** :
- Mettre à jour les prix (bouton "Actualiser")
- Vérifier la connexion Supabase
- Vérifier que des actifs existent

---

### Le layout est cassé

**Cause possible** : Taille d'écran non standard

**Solution** :
- Zoomer/dézoomer (Ctrl+/Ctrl-)
- Redimensionner la fenêtre
- Tester en plein écran

---

## 📱 Tests Recommandés

### Desktop (> 768px)
- [ ] Sidebar visible à gauche
- [ ] Logo orange visible
- [ ] Navigation fonctionne (Dashboard, Catégories, Performance)
- [ ] Graphiques s'affichent correctement
- [ ] Pas de bouton hamburger visible

### Tablet (768px - 1024px)
- [ ] Sidebar visible
- [ ] Layout adapté
- [ ] Graphiques redimensionnés

### Mobile (< 768px)
- [ ] Sidebar cachée par défaut
- [ ] Bouton hamburger visible en haut à gauche
- [ ] Menu s'ouvre au clic
- [ ] Backdrop fonctionne
- [ ] Navigation fonctionne
- [ ] Contenu a un padding-top pour le bouton

---

## 🔍 Debug Console

### Ouvrir la Console
- Chrome/Firefox : `F12` ou `Ctrl+Shift+I`
- Safari : `Cmd+Option+I`

### Erreurs à Surveiller
```javascript
// ✅ PAS d'erreurs Recharts
"The width(-1) and height(-1)..."

// ✅ PAS d'erreurs Supabase
"Failed to fetch"

// ✅ PAS d'erreurs React
"Cannot read property..."
```

---

## 🎯 Checklist Post-Déploiement

- [ ] App démarre sans erreur
- [ ] Sidebar visible (desktop)
- [ ] Menu hamburger fonctionne (mobile)
- [ ] Couleurs orange partout (pas de vert)
- [ ] Graphiques s'affichent
- [ ] Navigation fonctionne (3 pages)
- [ ] Catégories cliquables
- [ ] Détail catégorie fonctionne
- [ ] Ajouter un actif fonctionne
- [ ] Actualiser prix fonctionne
- [ ] Aucune erreur console

---

## 📞 En Cas de Problème Persistant

### 1. Vérifier les Fichiers Modifiés
```bash
git status
```

### 2. Vérifier les Dépendances
```bash
npm list framer-motion lucide-react
```

### 3. Reinstaller
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### 4. Vérifier Supabase
- Variables d'environnement correctes ?
- Base de données accessible ?
- Tables présentes ?

---

## ✅ Tout Fonctionne Maintenant !

Si tous les problèmes ci-dessus sont résolus :
- ✅ Sidebar visible et fonctionnelle
- ✅ Graphiques s'affichent correctement
- ✅ Couleur orange appliquée
- ✅ Navigation fluide
- ✅ Aucune erreur console

**Votre application V3 est opérationnelle ! 🎉**

---

*Troubleshooting Guide V3 - Octobre 2025*

