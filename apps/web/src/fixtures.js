const A = "amber";
const V = "violet";
const T = "teal";
const R = "rose";
const B = "blue";
const P = "potion";

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}

const potionBoard = [
  [A, V, A, T, P],
  [A, R, A, V, T],
  [A, T, R, A, V],
  [V, A, T, A, R],
  [A, R, V, A, T],
  [T, A, R, A, V]
];

const firstCascade = [
  [B, V, T, V, R],
  [V, B, T, B, T],
  [B, T, R, B, V],
  [V, B, T, B, R],
  [B, R, V, B, T],
  [T, B, R, B, V]
];

const settledPotionBoard = [
  [R, V, T, A, R],
  [V, A, T, B, T],
  [B, T, R, A, V],
  [V, R, T, B, R],
  [A, R, V, B, T],
  [T, A, R, A, V]
];

const lossBoard = [
  [A, V, T, R, B],
  [V, T, R, B, A],
  [T, R, B, A, V],
  [R, B, A, V, T],
  [B, A, V, T, R],
  [A, T, B, R, V]
];

const doublePotionBoard = [
  [T, T, P, V, T],
  [T, R, T, B, V],
  [T, A, T, P, R],
  [V, T, R, T, B],
  [T, B, V, T, A],
  [R, T, A, T, V]
];

const doublePotionCascade = [
  [R, V, R, B, R],
  [V, R, T, R, A],
  [R, A, R, B, V],
  [B, R, V, R, T],
  [R, T, A, R, B],
  [A, R, B, R, V]
];

/**
 * Fixture amounts are integer micro-units at the one-credit reference bet.
 * MockRgs scales them before returning an immutable, fully-computed outcome.
 */
export const OUTCOME_TEMPLATES = deepFreeze([
  {
    fixtureId: "potion-chain",
    label: "Potion Chain",
    unitBetMicro: 1_000_000,
    events: [
      { index: 0, type: "boardReveal", board: potionBoard },
      {
        index: 1,
        type: "win",
        cascade: 0,
        amount: 2_000_000,
        positions: [0, 2, 5, 7, 10, 13, 16, 18, 20, 23, 26, 28]
      },
      { index: 2, type: "multiplier", from: 1, increment: 2, to: 3 },
      { index: 3, type: "cascade", cascade: 1, board: firstCascade },
      {
        index: 4,
        type: "win",
        cascade: 1,
        amount: 6_000_000,
        positions: [0, 5, 8, 10, 13, 15, 18, 20, 23, 26]
      },
      { index: 5, type: "cascade", cascade: 2, board: settledPotionBoard },
      { index: 6, type: "finalWin", amount: 8_000_000 }
    ]
  },
  {
    fixtureId: "quiet-loss",
    label: "Quiet Loss",
    unitBetMicro: 1_000_000,
    events: [
      { index: 0, type: "boardReveal", board: lossBoard },
      { index: 1, type: "finalWin", amount: 0 }
    ]
  },
  {
    fixtureId: "double-potion",
    label: "Double Potion",
    unitBetMicro: 1_000_000,
    events: [
      { index: 0, type: "boardReveal", board: doublePotionBoard },
      {
        index: 1,
        type: "win",
        cascade: 0,
        amount: 4_000_000,
        positions: [0, 1, 5, 7, 10, 12, 16, 18, 20, 23, 26, 28]
      },
      { index: 2, type: "multiplier", from: 1, increment: 1, to: 2 },
      { index: 3, type: "multiplier", from: 2, increment: 2, to: 4 },
      { index: 4, type: "cascade", cascade: 1, board: doublePotionCascade },
      {
        index: 5,
        type: "win",
        cascade: 1,
        amount: 16_000_000,
        positions: [0, 2, 6, 8, 10, 12, 16, 18, 20, 23, 26, 28]
      },
      { index: 6, type: "finalWin", amount: 20_000_000 }
    ]
  }
]);

export { deepFreeze };
