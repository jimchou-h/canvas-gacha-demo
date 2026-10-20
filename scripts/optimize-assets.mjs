import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync } from 'node:fs';
import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const from = join(root, 'assets-src', 'characters');
const to = join(root, 'public', 'assets', 'characters');

for (const file of readdirSync(from)) {
  if (!file.endsWith('.png')) continue;
  const id = file.replace(/\.png$/, '');
  await sharp(join(from, file))
    .resize(640, 960, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(join(to, `${id}.jpg`));
  console.log(`optimized ${id}.jpg`);
}
