import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const client = path.join(dist, 'client');
const pathsToCopy = [
  'index.html',
  'HTML',
  'STYLE',
  'SCRPIT',
  'ASSETS',
  'PROGRAMS',
  'RESOURCES'
];

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });

for (const item of pathsToCopy) {
  const source = path.join(root, item);
  if (existsSync(source)) {
    await cp(source, path.join(client, item), { recursive: true });
  }
}

await mkdir(path.join(dist, '.openai'), { recursive: true });
await cp(path.join(root, '.openai', 'hosting.json'), path.join(dist, '.openai', 'hosting.json'));

await mkdir(path.join(dist, 'server'), { recursive: true });
await cp(path.join(root, 'SCRPIT', 'sites-static-server.js'), path.join(dist, 'server', 'index.js'));
