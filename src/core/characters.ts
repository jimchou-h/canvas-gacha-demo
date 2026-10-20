import { rollRarity, type Rarity, type RandomSource } from './rarity';

export interface CharacterDef {
  readonly id: string;
  readonly name: string;
  readonly rarity: Rarity;
  readonly art: string;
}

const POOL: Record<Rarity, readonly CharacterDef[]> = {
  5: [
    { id: 'elicia', name: '星轨终焉·艾莉希亚', rarity: 5, art: '/assets/characters/elicia.jpg' },
    { id: 'kaelos', name: '虚空王座·凯奥斯', rarity: 5, art: '/assets/characters/kaelos.jpg' },
  ],
  4: [
    { id: 'corin', name: '银月游侠·柯林', rarity: 4, art: '/assets/characters/corin.jpg' },
    { id: 'lida', name: '霜晶织者·莉妲', rarity: 4, art: '/assets/characters/lida.jpg' },
    { id: 'garo', name: '雷羽战将·加罗', rarity: 4, art: '/assets/characters/garo.jpg' },
  ],
  3: [
    { id: 'noen', name: '星尘学徒·诺恩', rarity: 3, art: '/assets/characters/noen.jpg' },
    { id: 'tiya', name: '流萤哨兵·缇雅', rarity: 3, art: '/assets/characters/tiya.jpg' },
    { id: 'bakk', name: '铁芯工兵·巴克', rarity: 3, art: '/assets/characters/bakk.jpg' },
    { id: 'rein', name: '晨风信使·蕾恩', rarity: 3, art: '/assets/characters/rein.jpg' },
  ],
};

export const CHARACTER_POOL = POOL;

export function listCharacters(rarity: Rarity): readonly CharacterDef[] {
  return POOL[rarity];
}

export function pickCharacter(rarity: Rarity, rand: RandomSource): CharacterDef {
  const pool = POOL[rarity];
  const character = pool[Math.floor(rand() * pool.length)];
  if (!character) throw new Error(`角色池 ${rarity} 为空`);
  return character;
}

export function drawSingle(rand: RandomSource): CharacterDef {
  return pickCharacter(rollRarity(rand), rand);
}
