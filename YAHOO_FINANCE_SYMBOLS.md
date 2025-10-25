# 📊 Guide des symboles Yahoo Finance

Ce guide liste les symboles les plus courants pour Yahoo Finance, utilisables dans Finarian pour la mise à jour automatique des prix.

---

## 🇺🇸 Actions américaines (US Stocks)

| Société | Symbole | Secteur |
|---------|---------|---------|
| Apple | `AAPL` | Tech |
| Microsoft | `MSFT` | Tech |
| Google (Alphabet) | `GOOGL` | Tech |
| Amazon | `AMZN` | E-commerce |
| Tesla | `TSLA` | Automobile |
| Meta (Facebook) | `META` | Social Media |
| NVIDIA | `NVDA` | Semiconducteurs |
| Netflix | `NFLX` | Streaming |
| Adobe | `ADBE` | Software |
| Intel | `INTC` | Semiconducteurs |
| Coca-Cola | `KO` | Boissons |
| McDonald's | `MCD` | Restauration |
| Nike | `NKE` | Sport |
| Visa | `V` | Paiements |
| Johnson & Johnson | `JNJ` | Santé |

---

## 🇫🇷 Actions françaises (French Stocks)

Ajoutez `.PA` après le code pour les actions cotées à Paris.

| Société | Symbole | Secteur |
|---------|---------|---------|
| LVMH | `MC.PA` | Luxe |
| TotalEnergies | `TTE.PA` | Énergie |
| L'Oréal | `OR.PA` | Cosmétiques |
| Air Liquide | `AI.PA` | Industrie |
| Hermès | `RMS.PA` | Luxe |
| Sanofi | `SAN.PA` | Pharmacie |
| BNP Paribas | `BNP.PA` | Banque |
| Société Générale | `GLE.PA` | Banque |
| Schneider Electric | `SU.PA` | Industrie |
| Dassault Systèmes | `DSY.PA` | Software |
| Carrefour | `CA.PA` | Distribution |
| Orange | `ORA.PA` | Télécoms |
| Renault | `RNO.PA` | Automobile |
| Danone | `BN.PA` | Agroalimentaire |
| Kering | `KER.PA` | Luxe |

---

## 🪙 Cryptomonnaies (Crypto)

Ajoutez `-USD` pour le prix en dollars.

| Crypto | Symbole | Nom complet |
|--------|---------|-------------|
| Bitcoin | `BTC-USD` | Bitcoin |
| Ethereum | `ETH-USD` | Ethereum |
| Solana | `SOL-USD` | Solana |
| Cardano | `ADA-USD` | Cardano |
| Ripple | `XRP-USD` | XRP |
| Polkadot | `DOT-USD` | Polkadot |
| Dogecoin | `DOGE-USD` | Dogecoin |
| Polygon | `MATIC-USD` | Polygon |
| Avalanche | `AVAX-USD` | Avalanche |
| Chainlink | `LINK-USD` | Chainlink |

**Note** : Vous pouvez aussi utiliser `-EUR` pour certaines cryptos (ex: `BTC-EUR`)

---

## 📈 Indices boursiers (Market Indices)

Les indices commencent par `^`

| Indice | Symbole | Région |
|--------|---------|--------|
| CAC 40 | `^FCHI` | France |
| S&P 500 | `^GSPC` | USA |
| Dow Jones | `^DJI` | USA |
| Nasdaq | `^IXIC` | USA |
| DAX | `^GDAXI` | Allemagne |
| FTSE 100 | `^FTSE` | UK |
| Nikkei 225 | `^N225` | Japon |
| Euro Stoxx 50 | `^STOXX50E` | Europe |
| Russell 2000 | `^RUT` | USA (small caps) |
| VIX | `^VIX` | Volatilité |

---

## 💱 Devises / Forex

Format : `XXXYYY=X` où XXX est la devise de base et YYY la devise de cotation

| Paire | Symbole | Description |
|-------|---------|-------------|
| EUR/USD | `EURUSD=X` | Euro → Dollar |
| GBP/USD | `GBPUSD=X` | Livre → Dollar |
| USD/JPY | `USDJPY=X` | Dollar → Yen |
| USD/CHF | `USDCHF=X` | Dollar → Franc suisse |
| EUR/GBP | `EURGBP=X` | Euro → Livre |
| AUD/USD | `AUDUSD=X` | Dollar australien |
| USD/CAD | `USDCAD=X` | Dollar → Dollar canadien |
| EUR/JPY | `EURJPY=X` | Euro → Yen |

---

## 🥇 Matières premières (Commodities)

| Matière | Symbole | Unité |
|---------|---------|-------|
| Or (Gold) | `GC=F` | USD/once |
| Argent (Silver) | `SI=F` | USD/once |
| Pétrole WTI | `CL=F` | USD/baril |
| Pétrole Brent | `BZ=F` | USD/baril |
| Gaz naturel | `NG=F` | USD/MMBtu |
| Cuivre | `HG=F` | USD/livre |
| Platine | `PL=F` | USD/once |
| Blé | `ZW=F` | USD/boisseau |

---

## 🔍 Comment trouver un symbole

### Méthode 1 : Recherche Yahoo Finance
1. Allez sur https://finance.yahoo.com
2. Cherchez l'action/crypto/indice
3. Le symbole est affiché dans l'URL et en haut de page

Exemple : Pour Apple → URL = `https://finance.yahoo.com/quote/AAPL`  
➜ Symbole = `AAPL`

### Méthode 2 : Google
Recherchez `[nom de l'entreprise] yahoo finance symbol`

### Méthode 3 : Codes ISIN
- Actions françaises : Généralement le code Euronext + `.PA`
- Actions US : Code ticker directement

---

## ⚠️ Symboles à éviter

❌ **Symboles qui ne fonctionnent PAS :**
- Symboles de fonds mutuels français (ISIN commençant par FR)
- Actions très peu liquides
- Symboles trop anciens (entreprises rachetées)
- ETF non cotés sur des bourses principales

✅ **Solution** : Utilisez des symboles de grandes entreprises cotées sur des bourses principales.

---

## 💡 Astuces

### Actions internationales
- **Allemagne** : Ajoutez `.DE` (ex: `BMW.DE`)
- **UK** : Ajoutez `.L` (ex: `BP.L`)
- **Japon** : Ajoutez `.T` (ex: `7203.T` pour Toyota)
- **Canada** : Ajoutez `.TO` (ex: `SHOP.TO`)

### ETF populaires
- S&P 500 ETF : `SPY`
- Nasdaq ETF : `QQQ`
- Or ETF : `GLD`
- Obligations : `TLT`

### Vérifier un symbole
Testez-le d'abord sur https://finance.yahoo.com/quote/[SYMBOL]  
Si la page existe et affiche un prix → ✅ le symbole fonctionne !

---

## 📚 Ressources

- **Site officiel** : https://finance.yahoo.com
- **API Documentation** : https://github.com/ranaroussi/yfinance (unofficial)
- **Liste complète** : https://finance.yahoo.com/lookup

---

**💡 Conseil** : Commencez avec des symboles simples (ex: `AAPL`, `BTC-USD`) avant d'essayer des symboles plus complexes !

