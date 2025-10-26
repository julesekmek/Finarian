# Configuration Cursor/VS Code pour Finarian

Ce dossier contient les paramètres de l'éditeur partagés pour le projet Finarian.

## 📁 Fichiers

### `settings.json`
Paramètres du workspace pour une meilleure organisation :
- **Tri par type** : Les fichiers sont groupés par extension (tous les .md ensemble, etc.)
- **File Nesting** : Regroupe les fichiers liés (ex: package.json + package-lock.json)
- **Formatage auto** : Prettier s'active à la sauvegarde
- **Dossiers non-compactés** : Meilleure visibilité de la structure

### `extensions.json`
Extensions recommandées pour travailler sur Finarian :
- Prettier (formatage)
- ESLint (qualité du code)
- Tailwind CSS IntelliSense
- Supabase pour VS Code
- React snippets
- GitLens

## 🎯 Effet sur l'Explorateur

Avec ces paramètres, vos fichiers seront organisés ainsi :

```
📁 Finarian/
├── 📂 .github/
├── 📂 scripts/
├── 📂 src/
├── 📂 supabase/
│
├── 📄 Fichiers .md (groupés)
│   ├── README.md
│   ├── CHANGELOG.md
│   └── ...autres .md
│
├── 📄 Fichiers .js (groupés)
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── 📄 Fichiers .json (groupés)
│   ├── package.json
│   └── package-lock.json (imbriqué sous package.json)
│
└── 📄 index.html
```

## 🔄 Rafraîchir l'Explorateur

Après avoir pull ces fichiers, rechargez Cursor/VS Code :
- **Cmd/Ctrl + Shift + P** → "Reload Window"

Les fichiers seront immédiatement organisés par type ! ✨

