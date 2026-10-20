export type Rarity = 3 | 4 | 5;

export type RandomSource = () => number;

export const FIVE_STAR_RATE = 0.015;
export const FOUR_STAR_RATE = 0.12;

export function rollRarity(rand: RandomSource): Rarity {
  const value = rand();
  if (value < FIVE_STAR_RATE) return 5;
  if (value < FIVE_STAR_RATE + FOUR_STAR_RATE) return 4;
  return 3;
}
