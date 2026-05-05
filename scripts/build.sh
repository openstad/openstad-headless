#!/usr/bin/env bash
set -euo pipefail

# Build all Docker services efficiently by caching the shared builder stage.
#
# The Dockerfile has a multi-stage layout:
#   builder → base → development/release
#
# The 'builder' stage (npm ci with all packages) is identical for every service.
# By building it once first, all subsequent service builds reuse that cached
# layer (~3-5 minutes of npm ci saved per service).
#
# Usage:
#   ./scripts/build.sh                    # Build all services
#   ./scripts/build.sh api-server         # Build only the api-server
#   ./scripts/build.sh --no-cache         # Force rebuild everything

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.override.yml}"
BUILDER_IMAGE="openstad-builder:cache"
NO_CACHE=""

ALL_SERVICES=(
  openstad-api-server
  openstad-auth-server
  openstad-image-server
  openstad-admin-server
  openstad-cms-server
)

# Parse arguments
SERVICES=()
for arg in "$@"; do
  case "$arg" in
    --no-cache)
      NO_CACHE="--no-cache"
      ;;
    *)
      SERVICES+=("openstad-${arg}")
      ;;
  esac
done

if [ ${#SERVICES[@]} -eq 0 ]; then
  SERVICES=("${ALL_SERVICES[@]}")
fi

echo "==> Building shared builder stage..."
docker build \
  ${NO_CACHE} \
  --target builder \
  -t "${BUILDER_IMAGE}" \
  -f Dockerfile \
  .

echo "==> Building services sequentially (reusing cached builder)..."
for svc in "${SERVICES[@]}"; do
  echo "  -> ${svc}"
  docker compose -f "${COMPOSE_FILE}" build ${NO_CACHE} "${svc}"
done

echo "==> Done."
