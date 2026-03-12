#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export TCR_REGISTRY=ccr.ccs.tencentyun.com
#   export TCR_NAMESPACE=your-namespace
#   bash scripts/docker-build-push.sh v1.1.0

TAG="${1:-v1.1.0}"
TCR_REGISTRY="${TCR_REGISTRY:-}"
TCR_NAMESPACE="${TCR_NAMESPACE:-}"

if [[ -z "${TCR_REGISTRY}" || -z "${TCR_NAMESPACE}" ]]; then
  echo "Please set TCR_REGISTRY and TCR_NAMESPACE first."
  echo "Example: export TCR_REGISTRY=ccr.ccs.tencentyun.com"
  echo "Example: export TCR_NAMESPACE=myspace"
  exit 1
fi

PREFIX="${TCR_REGISTRY}/${TCR_NAMESPACE}"

echo "[1/4] Build backend image..."
docker build -f Dockerfile.backend -t "${PREFIX}/api-backend:${TAG}" .

echo "[2/4] Build gateway image..."
docker build -f api-gateway/Dockerfile -t "${PREFIX}/api-gateway:${TAG}" .

echo "[3/4] Build interface image..."
docker build -f api-interface/Dockerfile -t "${PREFIX}/api-interface:${TAG}" .

if [[ ! -f "api-frontend/dist/index.html" ]]; then
  echo "Frontend dist not found, building api-frontend/dist ..."
  (
    cd api-frontend
    npm ci
    npm run build
  )
fi

echo "[4/4] Build frontend image..."
docker build -t "${PREFIX}/api-frontend:${TAG}" api-frontend

echo "Push images..."
docker push "${PREFIX}/api-backend:${TAG}"
docker push "${PREFIX}/api-gateway:${TAG}"
docker push "${PREFIX}/api-interface:${TAG}"
docker push "${PREFIX}/api-frontend:${TAG}"

echo "Done."
echo "Update .env with:"
echo "  IMAGE_API_BACKEND=${PREFIX}/api-backend:${TAG}"
echo "  IMAGE_API_GATEWAY=${PREFIX}/api-gateway:${TAG}"
echo "  IMAGE_API_INTERFACE=${PREFIX}/api-interface:${TAG}"
echo "  IMAGE_API_FRONTEND=${PREFIX}/api-frontend:${TAG}"
