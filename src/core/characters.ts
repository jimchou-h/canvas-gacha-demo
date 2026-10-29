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
    { id: 'mira', name: '潮汐织命·米菈', rarity: 5, art: '/assets/characters/mira.jpg' },
  ],
  4: [
    { id: 'corin', name: '银月游侠·柯林', rarity: 4, art: '/assets/characters/corin.jpg' },
    { id: 'lida', name: '霜晶织者·莉妲', rarity: 4, art: '/assets/characters/lida.jpg' },
    { id: 'garo', name: '雷羽战将·加罗', rarity: 4, art: '/assets/characters/garo.jpg' },
    { id: 'seph', name: '赤砂剑士·塞芙', rarity: 4, art: '/assets/characters/seph.jpg' },
    { id: 'orun', name: '熔核匠师·欧伦', rarity: 4, art: '/assets/characters/orun.jpg' },
  ],
  3: [
    { id: 'noen', name: '星尘学徒·诺恩', rarity: 3, art: '/assets/characters/noen.jpg' },
    { id: 'tiya', name: '流萤哨兵·缇雅', rarity: 3, art: '/assets/characters/tiya.jpg' },
    { id: 'bakk', name: '铁芯工兵·巴克', rarity: 3, art: '/assets/characters/bakk.jpg' },
    { id: 'rein', name: '晨风信使·蕾恩', rarity: 3, art: '/assets/characters/rein.jpg' },
    { id: 'lynn', name: '青苔信差·琳', rarity: 3, art: '/assets/characters/lynn.jpg' },
    { id: 'drae', name: '夜巡弩手·德雷', rarity: 3, art: '/assets/characters/drae.jpg' },
    { id: 'faye', name: '炉火学徒·菲', rarity: 3, art: '/assets/characters/faye.jpg' },
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

export function drawTen(rand: RandomSource): readonly CharacterDef[] {
  const cards: CharacterDef[] = [];
  for (let i = 0; i < 10; i++) cards.push(drawSingle(rand));
  if (!cards.some((card) => card.rarity >= 4)) {
    cards[cards.length - 1] = pickCharacter(4, rand);
  }
  return cards;
}
