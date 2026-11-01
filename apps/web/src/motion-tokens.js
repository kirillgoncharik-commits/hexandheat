export const MOTION_VERSION = 'm04.1-1';
export const MOTION = Object.freeze({
  normal: Object.freeze({ reveal: 420, win: 750, multiplier: 500, remove: 180, fall: 400, finalWin: 450, stagger: 28, count: 250, read: 450 }),
  fast: Object.freeze({ reveal: 180, win: 310, multiplier: 250, remove: 100, fall: 220, finalWin: 250, stagger: 12, count: 60, read: 250 })
});
export const easeOut = p => 1 - (1 - p) ** 3;
export const TIER_PRIORITY = Object.freeze({ IDLE: 0, SMALL_WIN: 1, MEDIUM_WIN: 2, BIG_WIN: 3, BONUS: 4 });
export const moodForTier = tier => ({ IDLE: 'BASE', SMALL_WIN: 'ENERGY', MEDIUM_WIN: 'ENERGY', BIG_WIN: 'HOT', BONUS: 'BONUS' })[tier] ?? 'BASE';
