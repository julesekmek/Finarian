#!/bin/bash

# Script de test pour vérifier l'automatisation de mise à jour des prix
# Usage: ./scripts/test-cron.sh

set -e  # Arrêt en cas d'erreur

echo "🧪 Testing automated price update..."
echo "=================================="
echo ""

# Charger les variables d'environnement depuis .env
if [ -f .env ]; then
    echo "📂 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  No .env file found. Using environment variables..."
fi

# Vérifier les variables requises
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ Error: VITE_SUPABASE_URL is not set"
    exit 1
fi

if [ -z "$VITE_SUPABASE_KEY" ]; then
    echo "❌ Error: VITE_SUPABASE_KEY is not set"
    exit 1
fi

if [ -z "$TEST_USER_EMAIL" ]; then
    echo "❌ Error: TEST_USER_EMAIL is not set"
    echo "💡 Add TEST_USER_EMAIL to your .env file"
    exit 1
fi

if [ -z "$TEST_USER_PASSWORD" ]; then
    echo "❌ Error: TEST_USER_PASSWORD is not set"
    echo "💡 Add TEST_USER_PASSWORD to your .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Authentification
echo "🔐 Step 1: Authenticating user..."
AUTH_RESPONSE=$(curl -s -X POST \
    "${VITE_SUPABASE_URL}/auth/v1/token?grant_type=password" \
    -H "Content-Type: application/json" \
    -H "apikey: ${VITE_SUPABASE_KEY}" \
    -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\"}")

# Extraction du token
ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Authentication failed!"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

echo "✅ Authentication successful"
echo "🎟️  Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Appel de la fonction Edge
echo "🔄 Step 2: Calling update-prices function..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
    "${VITE_SUPABASE_URL}/functions/v1/update-prices" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json")

# Extraction du code HTTP et du corps
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "📊 HTTP Status: $HTTP_STATUS"
echo ""

# Affichage de la réponse formatée
echo "📋 Response:"
echo "---"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo "---"
echo ""

# Vérification du succès
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Test successful! Prices updated."
    
    # Extraction des statistiques
    UPDATED=$(echo $BODY | grep -o '"updated":[0-9]*' | cut -d: -f2)
    FAILED=$(echo $BODY | grep -o '"failed":[0-9]*' | cut -d: -f2)
    
    if [ -n "$UPDATED" ]; then
        echo "📈 Updated: $UPDATED asset(s)"
    fi
    
    if [ -n "$FAILED" ] && [ "$FAILED" -gt 0 ]; then
        echo "⚠️  Failed: $FAILED asset(s)"
    fi
    
    echo ""
    echo "🎉 The automated update is working correctly!"
    echo "💡 You can now enable the GitHub Actions workflow."
    exit 0
else
    echo "❌ Test failed with status $HTTP_STATUS"
    echo "🔍 Check the response above for details"
    exit 1
fi

