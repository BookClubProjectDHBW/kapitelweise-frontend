import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const candidates = [
  join(root, 'dist', 'kapitelweise-spa', 'browser'),
  join(root, 'dist', 'kapitelweise-spa'),
];

const source = candidates.find(path => existsSync(join(path, 'index.html')));
if (!source) {
  throw new Error('Kein Angular-Build gefunden. Zuerst npm run build ausführen.');
}

const target = resolve(root, '..', 'public', 'spa');
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

console.log(`Angular-SPA bereitgestellt: ${target}`);
