# ⏰ Configuration du Cron Job - Mise à jour automatique quotidienne

## 🎯 Objectif

Configurer une mise à jour automatique des prix chaque jour à 7h du matin, sans intervention manuelle.

---

## 📋 Prérequis

- ✅ Edge Function `update-prices` déployée
- ⚠️ Plan Supabase **Pro** ou supérieur (le scheduling n'est pas disponible sur le plan gratuit)

---

## 🔧 Configuration via le Dashboard Supabase

### Méthode 1 : Via l'interface web (Recommandé)

1. **Allez sur votre dashboard Supabase**  
   https://supabase.com/dashboard/project/oqjeiwtbvsjablvmlpuw

2. **Naviguez vers Edge Functions**  
   Sidebar → Functions → `update-prices`

3. **Cliquez sur l'onglet "Cron Jobs" ou "Schedules"**

4. **Créez une nouvelle planification** :
   - **Nom** : `daily-price-update`
   - **Expression cron** : `0 7 * * *`
   - **Fonction** : `update-prices`
   - **Description** : Mise à jour quotidienne des prix à 7h

5. **Activez la planification**

---

## 📅 Expressions Cron

### Syntaxe
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Jour de la semaine (0-6, Dimanche = 0)
│ │ │ └───── Mois (1-12)
│ │ └─────── Jour du mois (1-31)
│ └───────── Heure (0-23)
└─────────── Minute (0-59)
```

### Exemples utiles

| Expression | Description |
|------------|-------------|
| `0 7 * * *` | Chaque jour à 7h00 |
| `0 9 * * 1-5` | Du lundi au vendredi à 9h00 |
| `0 */6 * * *` | Toutes les 6 heures |
| `30 8 * * 1` | Chaque lundi à 8h30 |
| `0 0 1 * *` | Le 1er de chaque mois à minuit |

---

## 🔄 Méthode 2 : Via un service externe (Alternative gratuite)

Si vous n'avez pas le plan Pro, vous pouvez utiliser un service externe gratuit comme **cron-job.org** ou **EasyCron**.

### Configuration avec cron-job.org

1. **Créez un compte** sur https://cron-job.org

2. **Créez un nouveau job** :
   - **URL** : `https://oqjeiwtbvsjablvmlpuw.supabase.co/functions/v1/update-prices`
   - **Méthode** : POST
   - **Headers** :
     ```
     Authorization: Bearer <VOTRE_JWT_TOKEN>
     Content-Type: application/json
     ```
   - **Schedule** : `0 7 * * *`

3. **Activez le job**

⚠️ **Note** : Vous devrez mettre à jour le JWT token régulièrement (il expire).

---

## 🔄 Méthode 3 : Webhook personnalisé (Pour utilisateurs avancés)

### Créer une fonction cloud tierce

Vous pouvez créer une fonction cloud (Vercel, Netlify, AWS Lambda) qui :
1. S'exécute selon un cron
2. Se connecte à Supabase avec service role
3. Appelle votre fonction `update-prices`

**Exemple avec Vercel Cron** :

```javascript
// api/cron.js
export const config = {
  schedule: "0 7 * * *" // Chaque jour à 7h
}

export default async function handler(req, res) {
  const response = await fetch(
    'https://oqjeiwtbvsjablvmlpuw.supabase.co/functions/v1/update-prices',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  const data = await response.json()
  res.status(200).json(data)
}
```

---

## 🧪 Tester votre planification

### Vérifier que le cron fonctionne

1. **Attendez l'heure programmée** ou changez temporairement l'heure

2. **Vérifiez les logs** :
   - Dashboard → Functions → update-prices → Logs
   - Cherchez des exécutions automatiques

3. **Vérifiez la base de données** :
   - Les `last_updated` doivent être récents
   - Les `current_price` doivent avoir changé

---

## 📊 Monitoring

### Logs à surveiller

Dans le dashboard Supabase → Functions → Logs, vous devriez voir :

```
[CRON] Price update scheduled execution started
Price update requested by user: system
Found X assets with symbols to update
✓ Updated AAPL: 182.52
✓ Updated MSFT: 378.91
Price update completed: X updated, Y failed
```

### Alertes recommandées

Configurez des alertes si :
- Le cron échoue 3 fois de suite
- Aucune mise à jour depuis 48h
- Trop d'échecs (>50% des assets)

---

## 💰 Coûts

### Plan Supabase Pro
- **Prix** : ~25$/mois
- **Inclus** : Cron jobs illimités
- **Edge Functions** : 2M requêtes/mois incluses

### Alternative gratuite
- **Service externe** : Gratuit jusqu'à 100 jobs/jour
- **Limites** : Gestion manuelle du token

---

## 🔐 Sécurité

### Bonnes pratiques

1. **N'exposez jamais** votre Service Role Key publiquement
2. **Utilisez des variables d'environnement** pour les secrets
3. **Limitez les permissions** du JWT token utilisé
4. **Surveillez les logs** pour détecter des abus
5. **Configurez un rate limiting** si vous utilisez un service externe

---

## ❓ FAQ

### Le cron nécessite-t-il un utilisateur connecté ?
❌ Non, le cron peut utiliser un token système ou service role

### Combien coûte chaque exécution ?
💵 Très peu, ~1-2 cents pour 10-20 assets

### Que se passe-t-il si Yahoo Finance est down ?
⚠️ Les prix ne sont pas mis à jour, mais aucune erreur fatale. Réessayera au prochain cron.

### Puis-je avoir plusieurs crons ?
✅ Oui, vous pouvez en créer autant que vous voulez

---

## 📚 Ressources

- [Supabase Cron Jobs](https://supabase.com/docs/guides/functions/schedule-functions)
- [Cron Expression Generator](https://crontab.guru/)
- [cron-job.org](https://cron-job.org)

---

## ✅ Checklist de déploiement

- [ ] Fonction `update-prices` déployée
- [ ] Plan Supabase Pro activé (ou service externe configuré)
- [ ] Cron job créé avec expression `0 7 * * *`
- [ ] Cron job testé et fonctionnel
- [ ] Logs surveillés pendant 1 semaine
- [ ] Alertes configurées

---

**⏰ Votre application mettra à jour les prix automatiquement tous les matins !**

