import type { CharacterDef } from '../core/characters';

const cache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = cache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = cache.get(src) ?? new Image();
    cache.set(src, img);
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`卡面加载失败：${src}`));
    if (!img.src) img.src = src;
  });
}

export function peekImage(src: string): HTMLImageElement | undefined {
  const img = cache.get(src);
  return img && img.complete && img.naturalWidth > 0 ? img : undefined;
}

export async function preloadCharacters(characters: readonly CharacterDef[]): Promise<void> {
  await Promise.all(characters.map((c) => loadImage(c.art)));
}
