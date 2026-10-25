import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const changes = [
  {
    path: 'index.php',
    from: '/public/html/homePage.html',
    to: '/public/spa/',
  },
  {
    path: 'public/js/pages/login.js',
    from: 'window.location.href = "homePage.html";',
    to: 'window.location.href = "../spa/";',
  },
  {
    path: 'public/html/bookClub.html',
    from: 'href="homePage.html"',
    to: 'href="../spa/"',
  },
];

const pending = changes.map(change => {
  const path = resolve(projectRoot, change.path);
  const content = readFileSync(path, 'utf8');
  if (!content.includes(change.from)) {
    if (content.includes(change.to)) {
      return { path, content, unchanged: true };
    }
    throw new Error(`Die erwartete Stelle fehlt in ${change.path}. Keine Dateien wurden geändert.`);
  }
  return { path, content: content.replaceAll(change.from, change.to), unchanged: false };
});

for (const change of pending) {
  if (!change.unchanged) {
    writeFileSync(change.path, change.content);
  }
}

console.log('Login, Buchclub und Startseite verweisen jetzt auf /public/spa/.');
