#!/usr/bin/env bash

set -e

ROOT_DIR=$(git rev-parse --show-toplevel)

# check if sops is installed
if ! command -v sops &> /dev/null
then
    echo "Sops could not be found, this is needed to encrypt secrets. Please install sops and try again."
    exit
fi

# check if SOPS_AGE_KEY_FILE is set
if [ -z "$SOPS_AGE_KEY_FILE" ]
then
  echo "SOPS_AGE_KEY_FILE env var is not set, please set it to the path of your private key file."
  exit
fi
export SOPS_AGE_RECIPIENTS=$(cat $SOPS_AGE_KEY_FILE | ggrep -oP "public key: \K(.*)")

# warn when no argurments given
if [ $# -eq 0 ]
then
  echo "No arguments given, please provide the files you want to encrypt."
  exit
fi

# build array of files from arguments given
files=()
for arg in "$@"
do
  files+=("$arg")
done

for file in "${files[@]}"; do
    src_file=$(echo "$file")
    # add .enc.yml to the end of the file name
    target_file=$(echo "$file" | sed 's/\.yml/\.enc\.yml/g')
    sops --encrypt "$src_file" > "$target_file"
done