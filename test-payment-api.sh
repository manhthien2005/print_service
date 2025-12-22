#!/bin/bash

# Test Payment API endpoints
# Make sure API server is running on http://localhost:8080

API_BASE="http://localhost:8080/api/payment"

echo "=========================================="
echo "Testing Payment API Endpoints"
echo "=========================================="
echo ""

# 1. Test GET /api/payment/packages (no auth required)
echo "1. Testing GET /api/payment/packages"
echo "-----------------------------------"
curl -X GET "${API_BASE}/packages" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  | jq '.' 2>/dev/null || cat
echo ""
echo ""

# 2. Test GET /api/payment/current (requires auth)
echo "2. Testing GET /api/payment/current (requires Bearer token)"
echo "-----------------------------------"
echo "Please provide Bearer token:"
read -s TOKEN
if [ -z "$TOKEN" ]; then
  echo "Skipping authenticated endpoints..."
else
  curl -X GET "${API_BASE}/current" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -w "\nStatus: %{http_code}\n" \
    | jq '.' 2>/dev/null || cat
fi
echo ""
echo ""

# 3. Test GET /api/payment/deposits (requires auth)
if [ ! -z "$TOKEN" ]; then
  echo "3. Testing GET /api/payment/deposits"
  echo "-----------------------------------"
  curl -X GET "${API_BASE}/deposits?page=0&limit=10" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -w "\nStatus: %{http_code}\n" \
    | jq '.' 2>/dev/null || cat
  echo ""
  echo ""
fi

echo "=========================================="
echo "Test completed"
echo "=========================================="








