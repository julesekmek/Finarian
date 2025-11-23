#!/bin/bash

# Script de test pour la fonction update-prices
# Simule exactement ce que fait GitHub Actions

# Charger les variables d'environnement
source .env

# Demander les credentials
echo "🔐 Entrez vos identifiants de connexion:"
read -p "Email: " USER_EMAIL
read -sp "Password: " USER_PASSWORD
echo ""

SUPABASE_URL="${VITE_SUPABASE_URL}"
SUPABASE_ANON_KEY="${VITE_SUPABASE_KEY}"

echo ""
echo "🔐 Authenticating user..."

# Authentification pour obtenir un access token
AUTH_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d "{\"email\":\"${USER_EMAIL}\",\"password\":\"${USER_PASSWORD}\"}")

# Extraction du token d'accès
ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Authentication failed!"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Authentication successful"
echo "🔄 Calling update-prices function..."

# Appel de la fonction Edge pour mettre à jour les prix
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "${SUPABASE_URL}/functions/v1/update-prices" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json")

# Extraction du code HTTP et du corps de la réponse
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "📊 Response status: $HTTP_STATUS"
echo "📋 Response body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

# Vérification du succès
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo ""
  echo "✅ Prices updated successfully!"
  
  # Extraction des statistiques (si disponibles)
  UPDATED=$(echo $BODY | grep -o '"updated":[0-9]*' | cut -d: -f2)
  FAILED=$(echo $BODY | grep -o '"failed":[0-9]*' | cut -d: -f2)
  
  if [ -n "$UPDATED" ]; then
    echo "✓ Updated: $UPDATED asset(s)"
  fi
  
  if [ -n "$FAILED" ] && [ "$FAILED" -gt 0 ]; then
    echo "⚠️ Failed: $FAILED asset(s)"
  fi
else
  echo ""
  echo "❌ Price update failed with status $HTTP_STATUS"
  exit 1
fi
