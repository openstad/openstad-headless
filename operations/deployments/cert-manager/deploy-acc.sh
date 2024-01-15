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
values="$ROOT_DIR/operations/deployments/cert-manager/values.yml"

CONTEXT="k3s-uranus"
PREVIOUS_CONTEXT=$(kubectl config current-context)

echo "Changing context to $CONTEXT..."
kubectl config set current-context $CONTEXT

helm upgrade "$STACK" "$CHART" \
  --create-namespace \
  --install \
  --namespace "$NAMESPACE" \
  --values "$values" \
  --version "$CHART_VERSION" \
  --atomic

kubectl apply -f $ROOT_DIR/operations/deployments/cert-manager/issuer-acc.yml -n $NAMESPACE

kubectl config set current-context $PREVIOUS_CONTEXT