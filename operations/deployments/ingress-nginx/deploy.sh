#!/bin/sh

set -e

################################################################################
# repo
################################################################################
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update > /dev/null

################################################################################
# chart
################################################################################
STACK="ingress-nginx"
CHART="ingress-nginx/ingress-nginx"
CHART_VERSION="4.0.1"
NAMESPACE="ingress-nginx"

ROOT_DIR=$(git rev-parse --show-toplevel)
values="$ROOT_DIR/deployments/ingress-nginx/environments/prod/values.yaml"

helm upgrade "$STACK" "$CHART" \
  --atomic \
  --create-namespace \
  --install \
  --namespace "$NAMESPACE" \
  --values "$values" \
  --version "$CHART_VERSION"