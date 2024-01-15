#!/bin/sh

set -e

################################################################################
# repo
################################################################################
# helm repo add openstad-headless https://raw.githubusercontent.com/openstad/openstad-headless/master
helm repo update > /dev/null

################################################################################
# chart
################################################################################
ROOT_DIR=$(git rev-parse --show-toplevel)
values="$ROOT_DIR/operations/deployments/openstad-headless/environments/acc/values.yml"
secrets="$ROOT_DIR/operations/deployments/openstad-headless/environments/acc/secrets/secrets.yml"
images="$ROOT_DIR/operations/deployments/openstad-headless/environments/acc/images.yml"
chart_dir="$ROOT_DIR/charts"

STACK="openstad-headless"
# CHART="openstad-headless/openstad-headless"
CHART="openstad-headless"
CHART_VERSION="0.0.1"
NAMESPACE="headless-acc-2024"
CONTEXT="do-ams3-openstad-ams-acc"
PREVIOUS_CONTEXT=$(kubectl config current-context)

echo "Changing context to $CONTEXT..."
kubectl config set current-context $CONTEXT

echo "Decrypting files..."
sh $ROOT_DIR/operations/scripts/decrypt.sh

echo "Starting deployment..."
# Temp for local chart testing
current_folder=$(pwd)
cd $chart_dir
# end temp
helm upgrade "$STACK" "$CHART" \
  --create-namespace \
  --install \
  --namespace "$NAMESPACE" \
  -f "$values" \
  -f "$secrets" \
  -f "$images"
# Temp for local chart testing
#   --version "$CHART_VERSION"
cd $current_folder
# end temp

kubectl config set current-context $PREVIOUS_CONTEXT