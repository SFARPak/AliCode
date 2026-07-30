#!/bin/bash
set -e

echo "============================================"
echo "  AliCode VSIX Build Script"
echo "============================================"
echo ""

# Navigate to project root
cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

# Step 1: Install dependencies if needed (skipped if node_modules exists)
if [ ! -d "node_modules" ]; then
    echo "[1/4] Installing dependencies..."
    pnpm install
else
    echo "[1/4] Dependencies already installed, skipping..."
fi

# Step 2: Build the @ali-code/types package
echo "[2/4] Building @ali-code/types package..."
cd "$ROOT_DIR/packages/types"
NODE_OPTIONS="--max-old-space-size=8192" pnpm build
cd "$ROOT_DIR"

# Step 3: Bundle the extension
echo "[3/4] Bundling extension..."
cd "$ROOT_DIR/src"
pnpm bundle
cd "$ROOT_DIR"

# Step 4: Package as VSIX
echo "[4/4] Packaging VSIX..."
cd "$ROOT_DIR/src"
pnpm vsix
cd "$ROOT_DIR"

echo ""
echo "============================================"
echo "  Build Complete!"
echo "============================================"
echo ""
echo "Output: bin/alicode-3.53.0.vsix"
ls -lah bin/alicode-3.53.0.vsix 2>/dev/null || echo "NOTE: VSIX file not found at expected path."
echo ""