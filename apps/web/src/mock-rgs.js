import { deepFreeze, OUTCOME_TEMPLATES } from "./fixtures.js";
import { validateOutcome } from "./domain.js";

const DEFAULT_BETS = Object.freeze([500_000, 1_000_000, 2_000_000, 5_000_000]);

function scaleAmount(amount, numerator, denominator) {
  const scaled = (amount * numerator) / denominator;
  if (!Number.isSafeInteger(scaled)) {
    throw new Error("Fixture cannot be represented at this bet level");
  }
  return scaled;
}

function instantiate(template, betMicro, roundNumber) {
  const events = template.events.map((event) => {
    if (event.type === "win" || event.type === "finalWin") {
      return { ...event, amount: scaleAmount(event.amount, betMicro, template.unitBetMicro) };
    }
    return event;
  });
  const payoutMicro = events.at(-1).amount;

  return deepFreeze({
    id: `demo-${String(roundNumber).padStart(4, "0")}-${template.fixtureId}`,
    fixtureId: template.fixtureId,
    label: template.label,
    currency: "USD",
    betMicro,
    payoutMicro,
    events
  });
}

/** A small in-memory substitute for the Stake session/play/replay boundary. */
export class MockRgs {
  constructor(options = {}) {
    this.templates = options.templates ?? OUTCOME_TEMPLATES;
    this.betLevels = options.betLevels ?? DEFAULT_BETS;
    this.balanceMicro = options.balanceMicro ?? 100_000_000;
    this.cursor = 0;
    this.roundNumber = 0;
    this.pending = null;
    this.history = new Map();
    this.metrics = { playCalls: 0, replayCalls: 0, settleCalls: 0 };
  }

  getSession() {
    return Object.freeze({
      currency: "USD",
      balanceMicro: this.balanceMicro,
      betLevels: this.betLevels
    });
  }

  getFixturePreview() {
    return this.templates[0].events[0].board;
  }

  async play({ betMicro }) {
    if (this.pending) {
      throw new Error("A round is already awaiting settlement");
    }
    if (!this.betLevels.includes(betMicro)) {
      throw new Error("Bet level is not offered by the mock RGS");
    }
    if (betMicro > this.balanceMicro) {
      throw new Error("Insufficient demo balance");
    }

    const template = this.templates[this.cursor % this.templates.length];
    const nextRoundNumber = this.roundNumber + 1;
    // Validate the complete response before changing wallet or sequence state.
    const outcome = validateOutcome(instantiate(template, betMicro, nextRoundNumber));

    this.metrics.playCalls += 1;
    this.roundNumber = nextRoundNumber;
    this.balanceMicro -= betMicro;
    this.cursor += 1;
    this.pending = outcome;
    this.history.set(outcome.id, outcome);
    return outcome;
  }

  async settle(roundId) {
    if (!this.pending || this.pending.id !== roundId) {
      throw new Error("Round is not pending settlement");
    }
    this.metrics.settleCalls += 1;
    this.balanceMicro += this.pending.payoutMicro;
    const settled = this.pending;
    this.pending = null;
    return Object.freeze({ outcome: settled, balanceMicro: this.balanceMicro });
  }

  async getReplay(roundId) {
    this.metrics.replayCalls += 1;
    const outcome = this.history.get(roundId);
    if (!outcome) {
      throw new Error("Replay outcome was not found");
    }
    return outcome;
  }
}

export { DEFAULT_BETS };
