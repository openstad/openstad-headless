#!/usr/bin/env bash

set -e

ROOT_DIR=$(git rev-parse --show-toplevel)

# check if sops is installed
if ! command -v sops &> /dev/null
then
    echo "Sops could not be found, this is needed to decrypt secrets. Please install sops and try again."
    exit
fi

# check if SOPS_AGE_KEY_FILE is set
if [ -z "$SOPS_AGE_KEY_FILE" ]
then
  echo "SOPS_AGE_KEY_FILE env var is not set, please set it to the path of your private key file."
  exit
fi
export SOPS_AGE_RECIPIENTS=$(cat $SOPS_AGE_KEY_FILE | ggrep -oP "public key: \K(.*)")

if [ $# -eq 0 ]
then
    # if no arguments given, recusively find all encrypted files ending with .enc.yml and store in files array
    files=($(find "$ROOT_DIR" -type f -name "*.enc.yml"))
else
    # build an array of files to decrypt from arguments given
    for arg in "$@"
    do
        files+=("$arg")
    done
fi

# when no files are found warn
if [ ${#files[@]} -eq 0 ]
then
  echo "No files found to decrypt."
  exit
fi

for file in "${files[@]}"; do
    src_file=$(echo "$file")
    target_file=$(echo "$file" | sed -E "s/.enc.yml/.yml/")
    sops --decrypt "$src_file" > "$target_file"
done