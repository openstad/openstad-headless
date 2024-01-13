#!/bin/sh

set -e

################################################################################
# repo
################################################################################
# helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update > /dev/null

################################################################################
# chart
################################################################################
STACK="mysql"
CHART="bitnami/mysql"
CHART_VERSION="8.8.8"
NAMESPACE="mysql"

ROOT_DIR=$(git rev-parse --show-toplevel)
values="$ROOT_DIR/operations/deployments/mysql/environments/acc/values.yml"
secrets="$ROOT_DIR/operations/deployments/mysql/environments/acc/secrets.yml"

CONTEXT="k3s-uranus"
PREVIOUS_CONTEXT=$(kubectl config current-context)

echo "Changing context to $CONTEXT..."
kubectl config set current-context $CONTEXT

echo "Decrypting files..."
sh $ROOT_DIR/operations/scripts/decrypt.sh

echo "Starting deployment..."
helm upgrade "$STACK" "$CHART" \
  --atomic \
  --create-namespace \
  --install \
  --namespace "$NAMESPACE" \
  --values "$values" \
  --values "$secrets" \
  --version "$CHART_VERSION" --debug

kubectl config set current-context $PREVIOUS_CONTEXT