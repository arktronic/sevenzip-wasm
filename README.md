# sevenzip-wasm

Just another npm package with 7-Zip compiled for WebAssembly, inspired by similar packages out there.

## Installation

Install with npm or equivalent:

```bash
npm i sevenzip-wasm
```

Or use directly in a browser:

```html
<script src="https://cdn.jsdelivr.net/npm/sevenzip-wasm/sevenzip-wasm.min.js"></script>
```

## Usage

The 7-Zip executable compiled to WebAssembly is the "Alone2" bundle, which supports most archive formats. Use it as you would the native executable. The most important differences are around filesystems. Emscripten's MEMFS, NODEFS (Node.js only), and WORKERFS have been compiled in. See [File System API](https://emscripten.org/docs/api_reference/Filesystem-API.html) for details.

Once imported, SevenZipWasm can be initialized like so:

```js
const sevenZip = await SevenZipWasm();
```

To redirect stdout/stderr, the initialization can be modified as follows:

```js
const sevenZip = await SevenZipWasm({
	print: (line) => console.log(line),
	printErr: (line) => console.log(line),
});
```

For more control, including stdin, use `FS.init()`, as [documented here](https://emscripten.org/docs/api_reference/Filesystem-API.html#setting-up-standard-i-o-devices).

To actually execute 7-Zip, use the `callMain()` function:

```js
const sevenZip = await SevenZipWasm();
sevenZip.callMain(['i']);
```

By default, MEMFS is mounted at `/`. Use the FS functions in the aforementioned documentation to read and write in the virtual filesystem. For example, to see all entries in the root filesystem, do the following:

```js
const sevenZip = await SevenZipWasm();
console.log(sevenZip.FS.readdir('/'));
```

For further examples of working with MEMFS and NODEFS, take a look at the included tests.
