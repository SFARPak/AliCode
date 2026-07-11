#!/bin/bash
set -e

echo "============================================"
echo "  AliCode VSIX Build Script"
echo "============================================"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Install dependencies if needed (skipped if node_modules exists)
if [ ! -d "node_modules" ]; then
    echo "[1/4] Installing dependencies..."
    pnpm install
else
    echo "[1/4] Dependencies already installed, skipping..."
fi

# Step 2: Build the @ali-code/types package
echo "[2/4] Building @ali-code/types package..."
cd packages/types && pnpm build && cd ../..

# Step 3: Bundle the extension
echo "[3/4] Bundling extension..."
cd src && pnpm bundle && cd ..

# Step 4: Package as VSIX
echo "[4/4] Packaging VSIX..."
cd src && pnpm vsix && cd ..

echo ""
echo "============================================"
echo "  Build Complete!"
echo "============================================"
echo ""
echo "Output: bin/alicode-3.53.0.vsix"
ls -lah bin/alicode-3.53.0.vsix 2>/dev/null || echo "NOTE: VSIX file not found at expected path."
echo ""