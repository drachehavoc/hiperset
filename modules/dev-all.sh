#!/bin/bash

BASE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PATHS=($("$BASE_DIR/modules-list.sh"))
NAMES=""
CMDS=()

echo "orchestrating dev mode for ${#PATHS[@]} modules..."

for path in "${PATHS[@]}"; do
    # Extrai o nome do pacote diretamente do package.json (mais preciso que o nome da pasta)
    NAME=$(node -p "require('$path/package.json').name")    
    # Monta a lista de nomes separada por vírgula para o concurrently
    if [ -z "$NAMES" ]; then NAMES="$NAME"; else NAMES="$NAMES,$NAME"; fi
    # Adiciona o comando formatado ao array de comandos
    CMDS+=("npm run dev --prefix $path -- --preserveWatchOutput")
done

# 2. Executa o concurrently
# --kill-others: se um processo parar, para todos (bom para desenvolvimento)
# --prefix-colors: coloca cores diferentes para cada log
npx concurrently --kill-others -n "$NAMES" --prefix-colors "auto" "${CMDS[@]}"