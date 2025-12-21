#!/bin/bash

# Script para sincronizar arquivos para app_roleta mantendo caminhos corretos
# DESENVOLVIDO POR Geêndersom Araújo

echo "Sincronizando arquivos para app_roleta..."

# Copiar CSS e JS (são idênticos)
cp css/styles.css app_roleta/app/styles.css
cp js/wheels.js app_roleta/app/wheels.js

# Copiar index.html e ajustar caminhos
cp html/index.html app_roleta/app/index.html.tmp

# Ajustar caminhos no index.html para funcionar no Electron
sed -i '' 's|href="../assets/icone.png"|href="assets/icon.png"|g' app_roleta/app/index.html.tmp
sed -i '' 's|href="../css/styles.css"|href="styles.css"|g' app_roleta/app/index.html.tmp
sed -i '' 's|src="../js/wheels.js"|src="wheels.js"|g' app_roleta/app/index.html.tmp
sed -i '' "s|new Audio('../sounds/|new Audio('sounds/|g" app_roleta/app/index.html.tmp

# Substituir o arquivo original
mv app_roleta/app/index.html.tmp app_roleta/app/index.html

echo "✓ Arquivos sincronizados com sucesso!"
echo "✓ Caminhos ajustados para Electron"
echo ""
echo "Agora você pode gerar o app com: cd app_roleta && npm run build"

