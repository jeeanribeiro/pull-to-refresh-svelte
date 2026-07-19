// Generates the QR code that links to the deployed demo.
// Run AFTER the Pages deployment is verified live so it encodes the real URL.
// Usage: node scripts/generate-qr.mjs [url]
import { writeFileSync } from 'node:fs';
import QRCode from 'qrcode';

const url = process.argv[2] ?? 'https://jeeanribeiro.github.io/pull-to-refresh-svelte/';
const svg = await QRCode.toString(url, {
	type: 'svg',
	errorCorrectionLevel: 'M',
	margin: 2,
	color: { dark: '#11141bff', light: '#ffffffff' }
});
writeFileSync('static/qr.svg', svg);
console.log(`wrote static/qr.svg -> ${url}`);
