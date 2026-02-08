#!/bin/bash
BASE=$(cd "$(dirname "$0")" && pwd) # Get the directory of this script
CTNS="package.json"                 # Container file to look for
IGNR="node_modules .*"              # Patterns to ignore

## Build the prune conditions for find
PRUNE_CONDITIONS=()
for pattern in $IGNR; do
  [[ ${#PRUNE_CONDITIONS[@]} -gt 0 ]] && PRUNE_CONDITIONS+=("-o")
  PRUNE_CONDITIONS+=("-name" "$pattern")
done

## Execute the find command
find "$BASE"                            \
  -mindepth 1                           \
  \( "${PRUNE_CONDITIONS[@]}" \) -prune \
  -o -name "$CTNS"                      \
  -printf "%h "