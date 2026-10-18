import { deepFreeze } from "./fixtures.js";
import { MICRO_UNITS, validateOutcome } from "./domain.js";

const SYMBOL_MAP = Object.freeze({
  L1: "amber",
  L2: "violet",
  L3: "teal",
  L4: "rose",
  L5: "blue",
  H1: "amber",
  H2: "violet",
  H3: "teal",
  H4: "rose",
  P1: "potion",
  P2: "potion",
  P3: "potion"
});

function assert(condition, message) {
  if (!condition) throw new Error(`Invalid Stake round: ${message}`);
}

function positionIndex(position) {
  assert(position && Number.isInteger(position.reel) && Number.isInteger(position.row), "invalid symbol position");
  const value = position.reel * 5 + position.row;
  assert(value >= 0 && value < 30, "position outside 6x5 board");
  return value;
}

function mapBoard(board) {
  assert(Array.isArray(board) && board.length === 6, "reveal board must have six reels");
  return board.map((reel) => {
    assert(Array.isArray(reel) && reel.length === 5, "reveal board reels must have five rows");
    return reel.map((symbol) => {
      const mapped = SYMBOL_MAP[symbol];
      assert(mapped, `unknown math symbol ${String(symbol)}`);
      return mapped;
    });
  });
}

function unitsToMicro(amount, betMicro) {
  assert(Number.isSafeInteger(amount) && amount >= 0, "event amount must be an integer payout multiplier");
  const result = (amount * betMicro) / 100;
  assert(Number.isSafeInteger(result), "payout cannot be represented in six-decimal currency units");
  return result;
}

/** Map the pinned official scatter BookEvent vocabulary to the proven UI domain. */
export function mapStakeRoundToOutcome(round, options) {
  const betMicro = options.betMicro;
  const currency = options.currency ?? "USD";
  assert(Number.isSafeInteger(betMicro) && betMicro > 0, "positive bet amount is required");
  assert(round && Array.isArray(round.state) && round.state.length > 0, "round.state is required");

  const events = [];
  let cascade = 0;
  let multiplier = 1;
  let finalUnits = null;

  const emit = (type, payload = {}) => events.push({ index: events.length, type, ...payload });

  for (const bookEvent of round.state) {
    switch (bookEvent.type) {
      case "reveal":
        emit("boardReveal", { board: mapBoard(bookEvent.board) });
        cascade = 0;
        multiplier = 1;
        break;
      case "winInfo": {
        const positions = [...new Set(
          bookEvent.wins.flatMap((win) => win.positions.map(positionIndex))
        )].sort((a, b) => a - b);
        emit("win", {
          cascade,
          amount: unitsToMicro(bookEvent.totalWin, betMicro),
          positions
        });
        break;
      }
      case "updateGlobalMult": {
        const next = bookEvent.globalMult;
        const previous = bookEvent.previousGlobalMult ?? multiplier;
        assert(previous === multiplier && Number.isSafeInteger(next) && next > previous, "multiplier continuity mismatch");
        emit("multiplier", { from: previous, increment: next - previous, to: next });
        multiplier = next;
        break;
      }
      case "tumbleBoard":
        cascade += 1;
        assert(bookEvent.cascade === cascade, "cascade index mismatch");
        emit("cascade", { cascade, board: mapBoard(bookEvent.newSymbols) });
        break;
      case "finalWin":
        finalUnits = bookEvent.amount;
        emit("finalWin", { amount: unitsToMicro(finalUnits, betMicro) });
        break;
      case "updateTumbleWin":
      case "setTotalWin":
      case "setWin":
        // Official presentation bookkeeping; the local reducer needs only the
        // immutable win facts above. These events never recalculate payout.
        break;
      default:
        throw new Error(`Unsupported Stake BookEvent: ${String(bookEvent.type)}`);
    }
  }

  assert(events[0]?.type === "boardReveal", "first mapped event must reveal the board");
  assert(events.at(-1)?.type === "finalWin", "last mapped event must be finalWin");
  const payoutMultiplierUnits = Number.isSafeInteger(round.payoutMultiplierUnits)
    ? round.payoutMultiplierUnits
    : Math.round(Number(round.payoutMultiplier) * 100);
  assert(finalUnits === payoutMultiplierUnits, "book finalWin must match RGS payoutMultiplier");

  return validateOutcome(deepFreeze({
    id: String(round.roundID),
    fixtureId: `stake-book-${String(round.bookID ?? round.roundID)}`,
    label: "Official SDK-format outcome",
    currency,
    betMicro,
    payoutMicro: unitsToMicro(finalUnits, betMicro),
    events
  }));
}

export { SYMBOL_MAP, unitsToMicro };
