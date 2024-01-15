#!/bin/sh

set -e

################################################################################
# repo
################################################################################
helm repo add jetstack https://charts.jetstack.io
helm repo update > /dev/null

################################################################################
# chart
################################################################################
STACK="cert-manager"
CHART="jetstack/cert-manager"
CHART_VERSION="1.5.3"
NAMESPACE="cert-manager"

ROOT_DIR=$(git rev-parse --show-toplevel)
values="$ROOT_DIR/deployments/cert-manager/values.yml"

helm upgrade "$STACK" "$CHART" \
  --create-namespace \
  --install \
  --namespace "$NAMESPACE" \
  --values "$values" \
  --version "$CHART_VERSION" \
  --atomic

kubectl apply -f $ROOT_DIR/deployments/cert-manager/issuer.yml -n $NAMESPACE