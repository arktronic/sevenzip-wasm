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

if git apply --reverse --check ../7zip-24.09.patch &>/dev/null; then
	echo "Patch already applied. Proceeding."
else
	echo "Applying patch."
	git apply ../7zip-24.09.patch
fi
popd &>/dev/null

echo "Building."
pushd 7zip/CPP/7zip/Bundles/Alone2 &>/dev/null
emmake make -f ../../cmpl_gcc.mak
popd &>/dev/null

echo "Copying output to output directory."
cp -f 7zip/CPP/7zip/Bundles/Alone2/b/g/sevenzip-wasm* sevenzip-wasm/
cp -f README.md sevenzip-wasm/
cp -f LICENSE sevenzip-wasm/

echo "Done!"
