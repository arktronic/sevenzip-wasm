#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

which emmake &>/dev/null || {
	echo "FATAL ERROR: emmake not found. Emscripten has not been initialized."
	exit 1
}

pushd 7zip &>/dev/null
if [ ! -f "README.md" ]; then
	echo "FATAL ERROR: 7zip submodule has not been initialized."
	exit 1
fi

if git apply --reverse --check ../7zip-26.01.patch &>/dev/null; then
	echo "Patch already applied. Proceeding."
else
	echo "Applying patch."
	git apply ../7zip-26.01.patch
fi
popd &>/dev/null

# Extract 7-Zip version from upstream header
SEVENZIP_VERSION="$(grep '#define MY_VERSION_NUMBERS' 7zip/C/7zVersion.h | sed 's/.*"\(.*\)".*/\1/')"
# Convert to semver major.minor (e.g., "26.01" -> "26.1")
SEVENZIP_SEMVER_MAJOR="$(echo "$SEVENZIP_VERSION" | cut -d. -f1)"
SEVENZIP_SEMVER_MINOR="$(echo "$SEVENZIP_VERSION" | sed 's/^[0-9]*\.//' | sed 's/^0*//' | sed 's/^$/0/')"

# Validate package.json version matches upstream major.minor
PACKAGE_VERSION="$(node -p "require('./sevenzip-wasm/package.json').version")"
PACKAGE_MAJOR="$(echo "$PACKAGE_VERSION" | cut -d. -f1)"
PACKAGE_MINOR="$(echo "$PACKAGE_VERSION" | cut -d. -f2)"
if [[ "$PACKAGE_MAJOR" != "$SEVENZIP_SEMVER_MAJOR" || "$PACKAGE_MINOR" != "$SEVENZIP_SEMVER_MINOR" ]]; then
	echo "FATAL ERROR: 7-Zip version is $SEVENZIP_VERSION but package.json says $PACKAGE_VERSION."
	echo "Update sevenzip-wasm/package.json so its major.minor matches (e.g., ${SEVENZIP_SEMVER_MAJOR}.${SEVENZIP_SEMVER_MINOR}.0)."
	exit 1
fi

echo "Building."
pushd 7zip/CPP/7zip/Bundles/Alone2 &>/dev/null
rm -rf b || true
if [ "$GITHUB_ACTIONS" = "true" ]; then
	export BUILD_NAME="wasm-${SEVENZIP_VERSION}-ci-${GITHUB_SHA::7}"
else
	export BUILD_NAME="wasm-${SEVENZIP_VERSION}-dev-$(date +%Y%m%d-%H%M%S)"
fi
emmake make -f ../../cmpl_gcc.mak
popd &>/dev/null

echo "Copying output to output directory."
cp -f 7zip/CPP/7zip/Bundles/Alone2/b/g/sevenzip-wasm* sevenzip-wasm/
cp -f README.md sevenzip-wasm/
cp -f LICENSE sevenzip-wasm/

echo "Running sevenzip-wasm:"
node -e "require('./sevenzip-wasm/sevenzip-wasm.js')().then(m => m.callMain([]))"

echo "Done!"
