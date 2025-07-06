const SevenZipWasm = require('../sevenzip-wasm.js');
const path = require('node:path');
const fs = require('node:fs');

describe('Archive compression', () => {
	var sevenZip;

	beforeEach(async () => {
		sevenZip = await SevenZipWasm({
			print: () => null,
			printErr: () => null,
		});
		sevenZip.FS.mkdir('/input');
		sevenZip.FS.mkdir('/output');
		sevenZip.FS.mkdir('/temp');
		
		sevenZip.FS.mount(sevenZip.FS.filesystems.NODEFS, { root: path.join(process.cwd(), 'test', 'assets-compress') }, '/input');
		
		sevenZip.FS.mkdir('/temp/test-data');
		sevenZip.FS.mkdir('/temp/test-data/subdir');
		
		const draculaContent = sevenZip.FS.readFile('/input/dracula.txt');
		const dorianContent = sevenZip.FS.readFile('/input/picture-of-dorian-gray.txt');
		
		sevenZip.FS.writeFile('/temp/test-data/dracula.txt', draculaContent);
		sevenZip.FS.writeFile('/temp/test-data/subdir/picture-of-dorian-gray.txt', dorianContent);
	});

	describe('Container formats', () => {
		test('should create and verify ZIP archive', async () => {
			// Create ZIP archive
			const result = sevenZip.callMain(['a', '-tzip', '/output/test.zip', '/temp/test-data/*']);
			expect(result).toBe(0);

			// Verify the archive was created
			const zipStats = sevenZip.FS.stat('/output/test.zip');
			expect(zipStats.size).toBeGreaterThan(0);

			// Test extraction to verify integrity
			sevenZip.FS.mkdir('/temp/extract');
			const extractResult = sevenZip.callMain(['x', '-o/temp/extract', '/output/test.zip']);
			expect(extractResult).toBe(0);

			// Verify extracted contents
			const extractedContents = sevenZip.FS.readdir('/temp/extract');
			expect(extractedContents).toEqual(expect.arrayContaining(['subdir', 'dracula.txt']));

			const extractedDraculaInfo = sevenZip.FS.stat('/temp/extract/dracula.txt');
			expect(extractedDraculaInfo.size).toBeGreaterThan(0);

			const extractedDorianInfo = sevenZip.FS.stat('/temp/extract/subdir/picture-of-dorian-gray.txt');
			expect(extractedDorianInfo.size).toBeGreaterThan(0);
		});

		test('should create and verify 7Z archive', async () => {
			// Create 7Z archive
			const result = sevenZip.callMain(['a', '-t7z', '/output/test.7z', '/temp/test-data/*']);
			expect(result).toBe(0);

			// Verify the archive was created
			const archiveStats = sevenZip.FS.stat('/output/test.7z');
			expect(archiveStats.size).toBeGreaterThan(0);

			// Test extraction to verify integrity
			sevenZip.FS.mkdir('/temp/extract-7z');
			const extractResult = sevenZip.callMain(['x', '-o/temp/extract-7z', '/output/test.7z']);
			expect(extractResult).toBe(0);

			// Verify extracted contents
			const extractedContents = sevenZip.FS.readdir('/temp/extract-7z');
			expect(extractedContents).toEqual(expect.arrayContaining(['subdir', 'dracula.txt']));
		});

		test('should create and verify TAR archive', async () => {
			// Create TAR archive
			const result = sevenZip.callMain(['a', '-ttar', '/output/test.tar', '/temp/test-data/*']);
			expect(result).toBe(0);

			// Verify the archive was created
			const tarStats = sevenZip.FS.stat('/output/test.tar');
			expect(tarStats.size).toBeGreaterThan(0);

			// Test extraction to verify integrity
			sevenZip.FS.mkdir('/temp/extract-tar');
			const extractResult = sevenZip.callMain(['x', '-o/temp/extract-tar', '/output/test.tar']);
			expect(extractResult).toBe(0);

			// Verify extracted contents
			const extractedContents = sevenZip.FS.readdir('/temp/extract-tar');
			expect(extractedContents).toEqual(expect.arrayContaining(['subdir', 'dracula.txt']));
		});
	});

	describe('Direct compression formats', () => {
		test('should create and verify GZIP compressed file', async () => {
			// Create GZIP compressed file from single file
			const result = sevenZip.callMain(['a', '-tgzip', '/output/dracula.txt.gz', '/temp/test-data/dracula.txt']);
			expect(result).toBe(0);

			// Verify the compressed file was created
			const gzipStats = sevenZip.FS.stat('/output/dracula.txt.gz');
			expect(gzipStats.size).toBeGreaterThan(0);

			// Get original file size for comparison
			const originalStats = sevenZip.FS.stat('/temp/test-data/dracula.txt');
			expect(gzipStats.size).toBeLessThan(originalStats.size); // Should be smaller than original

			// Test extraction to verify integrity
			const extractResult = sevenZip.callMain(['x', '-o/temp', '/output/dracula.txt.gz']);
			expect(extractResult).toBe(0);

			// Verify extracted file
			const extractedFileInfo = sevenZip.FS.stat('/temp/dracula.txt');
			expect(extractedFileInfo.size).toBe(originalStats.size);
		});

		test('should create and verify BZIP2 compressed file', async () => {
			// Create BZIP2 compressed file from single file
			const result = sevenZip.callMain(['a', '-tbzip2', '/output/dracula.txt.bz2', '/temp/test-data/dracula.txt']);
			expect(result).toBe(0);

			// Verify the compressed file was created
			const bzip2Stats = sevenZip.FS.stat('/output/dracula.txt.bz2');
			expect(bzip2Stats.size).toBeGreaterThan(0);

			// Get original file size for comparison
			const originalStats = sevenZip.FS.stat('/temp/test-data/dracula.txt');
			expect(bzip2Stats.size).toBeLessThan(originalStats.size); // Should be smaller than original

			// Test extraction to verify integrity
			const extractResult = sevenZip.callMain(['x', '-o/temp', '/output/dracula.txt.bz2']);
			expect(extractResult).toBe(0);

			// Verify extracted file
			const extractedFileInfo = sevenZip.FS.stat('/temp/dracula.txt');
			expect(extractedFileInfo.size).toBe(originalStats.size);
		});

		test('should create and verify XZ compressed file', async () => {
			// Create XZ compressed file from single file
			const result = sevenZip.callMain(['a', '-txz', '/output/dracula.txt.xz', '/temp/test-data/dracula.txt']);
			expect(result).toBe(0);

			// Verify the compressed file was created
			const xzStats = sevenZip.FS.stat('/output/dracula.txt.xz');
			expect(xzStats.size).toBeGreaterThan(0);

			// Get original file size for comparison
			const originalStats = sevenZip.FS.stat('/temp/test-data/dracula.txt');
			expect(xzStats.size).toBeLessThan(originalStats.size); // Should be smaller than original

			// Test extraction to verify integrity
			const extractResult = sevenZip.callMain(['x', '-o/temp', '/output/dracula.txt.xz']);
			expect(extractResult).toBe(0);

			// Verify extracted file
			const extractedFileInfo = sevenZip.FS.stat('/temp/dracula.txt');
			expect(extractedFileInfo.size).toBe(originalStats.size);
		});
	});

	describe('Compression with different levels', () => {
		test('should create archives with different compression levels', async () => {
			const levels = ['0', '1', '5']; // Store, fast, normal, ultra
			const fileSizes = [];

			for (const level of levels) {
				const filename = `/output/test-level-${level}.7z`;
				const result = sevenZip.callMain(['a', `-mx${level}`, '-t7z', filename, '/temp/test-data/dracula.txt']);
				expect(result).toBe(0);

				const stats = sevenZip.FS.stat(filename);
				fileSizes.push(stats.size);
			}

			// Generally, higher compression levels should result in smaller files
			// With larger text files, the difference should be more noticeable
			expect(fileSizes[0]).toBeGreaterThanOrEqual(fileSizes[2]); // Level 0 >= Level 5
		});
	});

	describe('Error handling', () => {
		test('should handle invalid compression format', async () => {
			// Try to create archive with invalid format
			let e = undefined;
			try {
				sevenZip.callMain(['a', '-tinvalid', '/output/test.invalid', '/temp/test-data/dracula.txt']);
			} catch (error) {
				e = error;
			}
			expect(e).toBeDefined(); // Should throw an error
		});

		test('should handle missing input files', async () => {
			// Try to create archive from non-existent file
			const result = sevenZip.callMain(['a', '-t7z', '/output/test.7z', '/nonexistent/file.txt']);
			expect(result).not.toBe(0);
		});
	});
});
