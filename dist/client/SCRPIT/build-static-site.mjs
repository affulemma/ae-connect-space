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
  'BACKEND',
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

const hostingConfig = path.join(root, '.openai', 'hosting.json');
if (existsSync(hostingConfig)) {
  await mkdir(path.join(dist, '.openai'), { recursive: true });
  await cp(hostingConfig, path.join(dist, '.openai', 'hosting.json'));
}

await mkdir(path.join(dist, 'server'), { recursive: true });
await cp(path.join(root, 'SCRPIT', 'sites-static-server.js'), path.join(dist, 'server', 'index.js'));
