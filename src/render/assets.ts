import type { CharacterDef } from '../core/characters';

const cache = new Map<string, HTMLImageElement>();

/**
 * 卡面路径以 `/` 开头，部署在 GitHub Pages 项目站点（/canvas-gacha-demo/）下时
 * 会被解析到站点根而 404，这里按构建时的 base 重定位。
 * 缓存 key 仍用调用方传入的原路径，peekImage 才能用同一 key 命中。
 */
function resolveSrc(path: string): string {
  const base = import.meta.env.BASE_URL;
  if (base === '/' || !path.startsWith('/')) return path;
  return `${base.replace(/\/$/, '')}${path}`;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = cache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = cache.get(src) ?? new Image();
    cache.set(src, img);
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`卡面加载失败：${src}`));
    if (!img.src) img.src = resolveSrc(src);
  });
}

export function peekImage(src: string): HTMLImageElement | undefined {
  const img = cache.get(src);
  return img && img.complete && img.naturalWidth > 0 ? img : undefined;
}

export async function preloadCharacters(characters: readonly CharacterDef[]): Promise<void> {
  await Promise.all(characters.map((c) => loadImage(c.art)));
}
