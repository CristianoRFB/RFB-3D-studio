import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const files = (await readdir('dist/assets')).filter(name => name.endsWith('.js'));
if (!files.length) throw new Error('Nenhum bundle JavaScript foi gerado');
const sizes = await Promise.all(files.map(async name => ({
  name, gzip: gzipSync(await readFile('dist/assets/' + name), { level: 9 }).byteLength,
})));
const total = sizes.reduce((sum, entry) => sum + entry.gzip, 0);
const initial = sizes.find(entry => /^index-[^/]+\.js$/.test(entry.name));
if (!initial) throw new Error('Bundle inicial index-*.js não identificado');
const kb = n => (n / 1024).toFixed(1);
for (const row of sizes) process.stdout.write(row.name + ' gzip=' + kb(row.gzip) + ' KiB\n');
process.stdout.write('TOTAL gzip=' + kb(total) + ' KiB; INITIAL gzip=' + kb(initial.gzip) + ' KiB\n');
const totalBudget = 650 * 1024;
const initialBudget = 420 * 1024;
if (total > totalBudget || initial.gzip > initialBudget) {
  throw new Error('Orçamento estático excedido: máximo 650 KiB total e 420 KiB no bundle inicial');
}
// Checks asset budget, NOT loading time, memory, lighthouse score or real network performance.
