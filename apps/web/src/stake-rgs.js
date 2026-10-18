import { mapStakeRoundToOutcome } from "./stake-events.js";

const DEFAULT_BETS = Object.freeze([500_000, 1_000_000, 2_000_000, 5_000_000]);

function trimSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function launchConfigFromUrl(url = new URL(window.location.href)) {
  const rgsUrl = url.searchParams.get("rgs_url") ?? url.origin;
  return Object.freeze({
    rgsUrl: trimSlash(rgsUrl),
    sessionID: url.searchParams.get("sessionID") ?? "hex-heat-local-demo",
    language: url.searchParams.get("lang") ?? navigator.language ?? "en",
    currency: url.searchParams.get("currency") ?? "USD",
    game: url.searchParams.get("game") ?? "hexandheat",
    version: url.searchParams.get("version") ?? "0.2.0",
    mode: url.searchParams.get("mode") ?? "BASE"
  });
}

export class StakeRgs {
  constructor(options = {}) {
    this.config = options.config ?? launchConfigFromUrl(options.url);
    this.fetch = options.fetch ?? globalThis.fetch?.bind(globalThis);
    if (!this.fetch) throw new Error("Fetch is required for Stake RGS integration");
    this.session = null;
    this.pending = null;
    this.lastRound = null;
    this.metrics = { authenticateCalls: 0, playCalls: 0, replayCalls: 0, settleCalls: 0 };
  }

  async request(path, { method = "GET", body } = {}) {
    const response = await this.fetch(`${this.config.rgsUrl}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) throw new Error(`RGS ${path} failed with HTTP ${response.status}`);
    const data = await response.json();
    if (data.error || data.status?.statusCode && data.status.statusCode !== "SUCCESS") {
      throw new Error(data.error?.message ?? data.status?.statusMessage ?? "RGS request failed");
    }
    return data;
  }

  async initialize() {
    this.metrics.authenticateCalls += 1;
    const data = await this.request("/wallet/authenticate", {
      method: "POST",
      body: { sessionID: this.config.sessionID, language: this.config.language }
    });
    const amount = data.balance?.amount;
    if (!Number.isSafeInteger(amount)) throw new Error("RGS authenticate response has no integer balance");
    const apiBetLevels = data.config?.betLevels;
    const betLevels = Array.isArray(apiBetLevels) && apiBetLevels.length
      ? apiBetLevels.map((value) => Number.isInteger(value) && value >= 10_000 ? value : Math.round(value * 1_000_000))
      : DEFAULT_BETS;
    this.session = Object.freeze({
      balanceMicro: amount,
      currency: data.balance.currency ?? this.config.currency,
      betLevels: Object.freeze(betLevels)
    });
    return this.getSession();
  }

  getSession() {
    if (!this.session) throw new Error("Stake RGS is not authenticated");
    return this.session;
  }

  getFixturePreview() {
    return null;
  }

  async play({ betMicro }) {
    if (this.pending) throw new Error("A round is already awaiting settlement");
    this.metrics.playCalls += 1;
    const data = await this.request("/wallet/play", {
      method: "POST",
      body: {
        mode: this.config.mode,
        currency: this.session.currency,
        sessionID: this.config.sessionID,
        amount: betMicro
      }
    });
    if (!data.round) throw new Error("RGS play response has no round");
    this.session = Object.freeze({ ...this.session, balanceMicro: data.balance?.amount ?? this.session.balanceMicro - betMicro });
    const outcome = mapStakeRoundToOutcome(data.round, { betMicro, currency: this.session.currency });
    this.pending = outcome;
    this.lastRound = data.round;
    return outcome;
  }

  async settle(roundId) {
    if (!this.pending || this.pending.id !== roundId) throw new Error("Round is not pending settlement");
    this.metrics.settleCalls += 1;
    const data = await this.request("/wallet/end-round", {
      method: "POST",
      body: { sessionID: this.config.sessionID }
    });
    this.session = Object.freeze({ ...this.session, balanceMicro: data.balance?.amount ?? this.session.balanceMicro + this.pending.payoutMicro });
    const outcome = this.pending;
    this.pending = null;
    return Object.freeze({ outcome, balanceMicro: this.session.balanceMicro });
  }

  async getReplay(roundId) {
    this.metrics.replayCalls += 1;
    const path = `/bet/replay/${encodeURIComponent(this.config.game)}/${encodeURIComponent(this.config.version)}/${encodeURIComponent(this.config.mode)}/${encodeURIComponent(roundId)}`;
    const data = await this.request(path);
    const round = data.round ?? data;
    const betMicro = round.amount ?? this.lastRound?.amount;
    return mapStakeRoundToOutcome(round, { betMicro, currency: this.session.currency });
  }
}

export { DEFAULT_BETS };
