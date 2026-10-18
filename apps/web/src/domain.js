export const BOARD_COLUMNS = 6;
export const BOARD_ROWS = 5;
export const MICRO_UNITS = 1_000_000;

const EVENT_TYPES = new Set(["boardReveal", "win", "multiplier", "cascade", "finalWin"]);

export const WITCH_STATES = Object.freeze({
  IDLE: "IDLE",
  SMALL_WIN: "SMALL_WIN",
  MEDIUM_WIN: "MEDIUM_WIN",
  BIG_WIN: "BIG_WIN",
  BONUS: "BONUS"
});

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Invalid outcome: ${message}`);
  }
}

function validateBoard(board, eventIndex) {
  assert(Array.isArray(board) && board.length === BOARD_COLUMNS, `event ${eventIndex} board must have 6 columns`);
  for (const column of board) {
    assert(Array.isArray(column) && column.length === BOARD_ROWS, `event ${eventIndex} board columns must have 5 rows`);
    assert(column.every((symbol) => typeof symbol === "string" && symbol.length > 0), `event ${eventIndex} has an invalid symbol`);
  }
}

/** Validate the local form of the immutable RGS event contract. */
export function validateOutcome(outcome) {
  assert(outcome && typeof outcome === "object", "outcome must be an object");
  assert(typeof outcome.id === "string" && outcome.id.length > 0, "id is required");
  assert(typeof outcome.fixtureId === "string" && outcome.fixtureId.length > 0, "fixtureId is required");
  assert(Number.isSafeInteger(outcome.betMicro) && outcome.betMicro > 0, "betMicro must be a positive integer");
  assert(Number.isSafeInteger(outcome.payoutMicro) && outcome.payoutMicro >= 0, "payoutMicro must be a non-negative integer");
  assert(Array.isArray(outcome.events) && outcome.events.length >= 2, "at least two events are required");

  let multiplier = 1;
  let finalWinCount = 0;
  let finalAmount = null;

  outcome.events.forEach((event, arrayIndex) => {
    assert(event && typeof event === "object", `event ${arrayIndex} must be an object`);
    assert(event.index === arrayIndex, `event indices must be monotonic from zero`);
    assert(EVENT_TYPES.has(event.type), `unknown event type ${String(event.type)}`);

    if (event.type === "boardReveal" || event.type === "cascade") {
      validateBoard(event.board, event.index);
    }

    if (event.type === "win") {
      assert(Number.isSafeInteger(event.cascade) && event.cascade >= 0, `event ${event.index} has an invalid cascade`);
      assert(Number.isSafeInteger(event.amount) && event.amount >= 0, `event ${event.index} has an invalid amount`);
      assert(Array.isArray(event.positions), `event ${event.index} positions are required`);
      assert(new Set(event.positions).size === event.positions.length, `event ${event.index} positions must be unique`);
      assert(event.positions.every((position) => Number.isInteger(position) && position >= 0 && position < 30), `event ${event.index} has an invalid position`);
    }

    if (event.type === "multiplier") {
      assert(event.from === multiplier, `event ${event.index} multiplier does not continue from ${multiplier}`);
      assert(Number.isSafeInteger(event.increment) && event.increment > 0, `event ${event.index} increment must be positive`);
      assert(event.to === event.from + event.increment, `event ${event.index} multiplier arithmetic is inconsistent`);
      multiplier = event.to;
    }

    if (event.type === "cascade") {
      assert(Number.isSafeInteger(event.cascade) && event.cascade > 0, `event ${event.index} cascade must be positive`);
    }

    if (event.type === "finalWin") {
      assert(Number.isSafeInteger(event.amount) && event.amount >= 0, `event ${event.index} final amount is invalid`);
      finalWinCount += 1;
      finalAmount = event.amount;
    }
  });

  assert(outcome.events[0].type === "boardReveal", "first event must be boardReveal");
  assert(outcome.events.at(-1).type === "finalWin", "last event must be finalWin");
  assert(finalWinCount === 1, "exactly one finalWin is required");
  assert(finalAmount === outcome.payoutMicro, "finalWin must match the RGS payout");
  return outcome;
}

export function createInitialState(board = null) {
  return Object.freeze({
    board,
    winMicro: 0,
    multiplier: 1,
    highlightedPositions: Object.freeze([]),
    cascade: 0,
    settled: false
  });
}

/**
 * Convert an authoritative game event into a presentation-only character cue.
 * This function reads settled outcome values but never changes payout state.
 */
export function deriveWitchState(event, outcome) {
  if (!event) return null;
  if (event.type === "bonusStart") return WITCH_STATES.BONUS;
  // Only genuine win events can request a new dance tier. A cascade, a
  // board reveal or a potion must never reset the dancer to IDLE or BONUS.
  if (event.type !== "win" && event.type !== "finalWin") return null;

  const amount = Number(event.amount ?? 0);
  const bet = Number(outcome?.betMicro ?? 0);
  if (!Number.isSafeInteger(amount) || !Number.isSafeInteger(bet) || amount <= 0 || bet <= 0) {
    return null;
  }
  // Provisional prototype thresholds; production values require PO approval.
  if (amount >= bet * 10) return WITCH_STATES.BIG_WIN;
  if (amount >= bet * 4) return WITCH_STATES.MEDIUM_WIN;
  return WITCH_STATES.SMALL_WIN;
}

/** Apply one authoritative event and return a new presentation snapshot. */
export function applyEvent(state, event) {
  switch (event.type) {
    case "boardReveal":
      return Object.freeze({
        board: event.board,
        winMicro: 0,
        multiplier: 1,
        highlightedPositions: Object.freeze([]),
        cascade: 0,
        settled: false
      });
    case "win":
      return Object.freeze({
        ...state,
        winMicro: state.winMicro + event.amount,
        highlightedPositions: event.positions,
        cascade: event.cascade
      });
    case "multiplier":
      return Object.freeze({ ...state, multiplier: event.to });
    case "cascade":
      return Object.freeze({
        ...state,
        board: event.board,
        highlightedPositions: Object.freeze([]),
        cascade: event.cascade
      });
    case "finalWin":
      return Object.freeze({
        ...state,
        winMicro: event.amount,
        highlightedPositions: Object.freeze([]),
        settled: true
      });
    default:
      throw new Error(`Unsupported event type: ${String(event.type)}`);
  }
}

export function describeEvent(event, currency = "USD", locale = "en-US") {
  switch (event.type) {
    case "boardReveal":
      return { title: "Board revealed", copy: "The immutable outcome timeline has started." };
    case "win":
      return {
        title: `Cascade ${event.cascade + 1} win`,
        copy: `${event.positions.length} positions pay ${formatMoney(event.amount, currency, locale)}.`
      };
    case "multiplier":
      return {
        title: "Potion cue",
        copy: `Cauldron increases by ${event.increment}: ×${event.from} → ×${event.to}.`
      };
    case "cascade":
      return { title: `Cascade ${event.cascade}`, copy: "Winning symbols are replaced by the next precomputed board." };
    case "finalWin":
      return {
        title: event.amount > 0 ? "Round complete" : "No win",
        copy: event.amount > 0 ? `Final payout: ${formatMoney(event.amount, currency, locale)}.` : "The outcome settled with no payout."
      };
    default:
      throw new Error(`Unsupported event type: ${String(event.type)}`);
  }
}

export function formatMoney(amountMicro, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountMicro / MICRO_UNITS);
}

export const DEFAULT_DURATIONS = Object.freeze({
  normal: Object.freeze({ boardReveal: 420, win: 650, multiplier: 500, cascade: 420, finalWin: 300 }),
  fast: Object.freeze({ boardReveal: 120, win: 230, multiplier: 180, cascade: 150, finalWin: 100 })
});

/**
 * Run every event in order. `delay` is injectable so deterministic tests have no wall-clock waits.
 */
export async function playOutcome(outcome, options = {}) {
  validateOutcome(outcome);
  const speed = options.speed === "fast" ? "fast" : "normal";
  const durations = options.durations ?? DEFAULT_DURATIONS[speed];
  const delay = options.delay ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const onEvent = options.onEvent ?? (() => {});
  let state = createInitialState();

  for (const event of outcome.events) {
    if (options.signal?.aborted) {
      throw new DOMException("Playback aborted", "AbortError");
    }
    state = applyEvent(state, event);
    await onEvent(event, state);
    await delay(durations[event.type] ?? 0);
  }

  return state;
}
