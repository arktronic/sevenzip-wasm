const SevenZipWasm = require('../sevenzip-wasm.js');
const path = require('node:path');
const fs = require('node:fs');

describe('Archive decompression', () => {
	const allFiles = fs.readdirSync(path.join(process.cwd(), 'test', 'assets-decompress'));
	var sevenZip;

	beforeEach(async () => {
		sevenZip = await SevenZipWasm({
			print: () => null,
			printErr: () => null,
		});
		sevenZip.FS.mkdir('/input');
		sevenZip.FS.mkdir('/output');
		sevenZip.FS.mount(sevenZip.FS.filesystems.NODEFS, { root: path.join(process.cwd(), 'test', 'assets-decompress') }, '/input');
	});

	test.each(allFiles)('should correctly decompress "%s"', async (filename) => {
		const result = sevenZip.callMain(['x', '-o/output', `/input/${filename}`]);
		expect(result).toBe(0);

		const tarMatch = filename.match(/.+\.tar/);
		if (tarMatch) {
			const extraResult = sevenZip.callMain(['x', '-o/output', `/output/${tarMatch[0]}`]);
			expect(extraResult).toBe(0);
		}

		const outputContents = sevenZip.FS.readdir('/output');
		expect(outputContents).toEqual(expect.arrayContaining(['a directory', 'a file.txt']));

		const textFileInfo = sevenZip.FS.stat('/output/a file.txt');
		expect(textFileInfo.size).toBe(28);

		const headerFileInfo = sevenZip.FS.stat('/output/a directory/sqlite3.h');
		expect(headerFileInfo.size).toBe(653276);
	  });
  });
  