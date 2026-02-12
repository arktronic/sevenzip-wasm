const SevenZipWasm = require('../sevenzip-wasm.js');

describe('7-Zip version', () => {
	test('should output expected version string', async () => {
		let output = '';
		const captureOutput = (text) => {
			output += text + '\n';
		};

		// Reinitialize with output capture
		const sevenZip = await SevenZipWasm({
			print: captureOutput,
			printErr: captureOutput,
		});

		// Call 7-Zip with no arguments to get version info
		sevenZip.callMain([]);

		// Verify version string contains expected elements
		expect(output).toMatch(/7-Zip \(z\) 26.00/);
		expect(output).toMatch(/ Threads\:1 /);
		expect(output).toMatch(/32-bit/);
	});
});
