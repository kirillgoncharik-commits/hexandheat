import { RasterWitchPlayer } from "./raster-witch.js";
import { OUTCOME_TEMPLATES } from "./fixtures.js";
import { createInitialState, describeEvent, formatMoney, playOutcome } from "./domain.js";
import { AdaptiveMusicController, MUSIC_STATES } from "./adaptive-music.js";
import { MockRgs } from "./mock-rgs.js";
import { StakeRgs, launchConfigFromUrl } from "./stake-rgs.js";
import { createSyntheticVideoSources } from "./synthetic-video.js";
import { NativeVideoLoopController } from "./video-loop.js";
import { WitchDanceController } from "./witch-dance.js";

const SYMBOL_LABELS = Object.freeze({
  amber: "Moon goblet",
  violet: "Raven mask",
  teal: "Jade vial",
  rose: "Thorn rose",
  blue: "Crystal eye",
  potion: "Potion"
});

const elements = {
  balance: document.querySelector("#balance-value"),
  bet: document.querySelector("#bet-value"),
  win: document.querySelector("#win-value"),
  multiplier: document.querySelector("#multiplier-value"),
  board: document.querySelector("#board"),
  debugMultiplier: document.querySelector("#debug-multiplier"),
  debugGameState: document.querySelector("#debug-game-state"),
  debugLastEvent: document.querySelector("#debug-last-event"),
  witchStage: document.querySelector(".witch-stage"),
  witchFigure: document.querySelector("#witch-figure"),
  witchStateLabel: document.querySelector("#witch-state-label"),
  roundLabel: document.querySelector("#round-label"),
  fixtureLabel: document.querySelector("#fixture-label"),
  betSelect: document.querySelector("#bet-select"),
  spin: document.querySelector("#spin-button"),
  replay: document.querySelector("#replay-button"),
  fast: document.querySelector("#fast-toggle"),
  mute: document.querySelector("#mute-toggle"),
  status: document.querySelector("#status"),
  rgsSource: document.querySelector("#rgs-source"),
  mediaStatus: document.querySelector("#media-status"),
  videoLayers: [...document.querySelectorAll(".witch-video-layer")]
};

const locale = navigator.language || "en-US";
let rgs = null;
let session = null;
let lastOutcome = null;
let busy = false;
let witchController = null;
let videoController = null;
let rasterPlayer = null;
let videoObjectUrls = [];
const musicController = new AdaptiveMusicController({
  onError(error) {
    console.warn("Adaptive music disabled:", error);
  }
});

function updateWallet() {
  session = rgs.getSession();
  elements.balance.textContent = formatMoney(session.balanceMicro, session.currency, locale);
  elements.bet.textContent = formatMoney(Number(elements.betSelect.value), session.currency, locale);
}

function renderBoard(state) {
  if (!state.board) return;
  const highlights = new Set(state.highlightedPositions);
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const position = column * 5 + row;
      const symbol = state.board[column][row];
      const cell = document.createElement("div");
      cell.className = `symbol symbol-${symbol}${highlights.has(position) ? " is-winning" : ""}`;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `${SYMBOL_LABELS[symbol] ?? symbol}, column ${column + 1}, row ${row + 1}${highlights.has(position) ? ", winning" : ""}`);
      cell.dataset.position = String(position);
      const mapping = {amber:0, violet:1, rose:2, blue:3, teal:6, potion:9};
      const art = document.createElement("img");
      art.src = `./assets/symbols/item-${String(mapping[symbol] ?? 0).padStart(2,"0")}.png`;
      art.alt = "";
      cell.append(art);
      fragment.append(cell);
    }
  }

  elements.board.replaceChildren(fragment);
}

function renderState(state) {
  renderBoard(state);
  elements.win.textContent = formatMoney(state.winMicro, session.currency, locale);
  elements.multiplier.textContent = `×${state.multiplier}`;
  elements.debugMultiplier.textContent = `×${state.multiplier}`;
}

/**
 * Prototype double-buffered dance player. Both CSS silhouettes start/end in the
 * same neutral pose, so the next multi-second loop can crossfade at the seam.
 * Production media will replace each silhouette with a decoded video layer.
 */
async function prepareWitchStage() {
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  rasterPlayer = new RasterWitchPlayer(document.querySelector(".raster-container"), { reducedMotion });
  witchController = new WitchDanceController({
    onLoop({to}) { rasterPlayer.switchTo(to); elements.witchStage.dataset.state = to.toLowerCase(); elements.witchStateLabel.textContent = to; },
    onAccent() { elements.witchStage.classList.add("has-potion-accent"); setTimeout(() => elements.witchStage.classList.remove("has-potion-accent"), 500); }
  });
  witchController.start();
  document.addEventListener("motion-policy", event => rasterPlayer.setReducedMotion(event.detail || reducedMotion));
  window.addEventListener("pagehide", () => { witchController.destroy(); rasterPlayer.destroy(); }, {once:true});
}

function gamePhase(event, source) {
  const mode = source === "replay" ? "REPLAY" : "SPIN";
  const phases = {
    boardReveal: "REVEAL",
    win: "WIN",
    multiplier: "POTION",
    cascade: "CASCADE",
    finalWin: "COMPLETE"
  };
  return `${mode} · ${phases[event.type] ?? "EVENT"}`;
}

function setBusy(value, source = "spin") {
  busy = value;
  elements.spin.disabled = value;
  elements.betSelect.disabled = value;
  elements.replay.disabled = value || !lastOutcome;
  if (value) {
    elements.debugGameState.textContent = source === "replay" ? "REPLAY · REQUEST" : "SPIN · REQUEST";
  }
  elements.roundLabel.textContent = value
    ? source === "replay"
      ? "Replay"
      : "Brewing…"
    : "The coven is waiting";
}

async function presentOutcome(outcome, source) {
  elements.fixtureLabel.textContent = "6 × 5 · SCATTER PAYS";
  elements.debugLastEvent.textContent = "Waiting for event 1";
  witchController.beginRound();
  elements.status.textContent = source === "replay"
    ? `Replay ${outcome.id}: no wallet or play request will be made.`
    : "The potion is brewing…";
  const speed = elements.fast.checked ? "fast" : "normal";

  return playOutcome(outcome, {
    speed,
    onEvent(event, state) {
      const description = describeEvent(event, outcome.currency, locale);
      renderState(state);
      elements.debugGameState.textContent = gamePhase(event, source);
      elements.debugLastEvent.textContent = `${event.index + 1}/${outcome.events.length} · ${description.title}`;
      witchController.onEvent(event, outcome);
      musicController.onEvent(event, outcome, { source, speed });
    }
  });
}

async function spin() {
  if (busy) return;
  setBusy(true, "spin");
  await musicController.unlock();
  let outcome = null;
  let failed = false;
  try {
    const betMicro = Number(elements.betSelect.value);
    if (betMicro > session.balanceMicro) { elements.status.textContent = "Insufficient balance. Choose a smaller amount."; return; }
    outcome = await rgs.play({ betMicro });
    lastOutcome = outcome;
    updateWallet();
    await presentOutcome(outcome, "spin");
    await rgs.settle(outcome.id);
    updateWallet();
    elements.debugGameState.textContent = "SETTLED";
    elements.status.textContent = outcome.payoutMicro > 0 ? `Round win ${formatMoney(outcome.payoutMicro, outcome.currency, locale)}` : "A quiet cauldron. Ready for the next round.";
  } catch (error) {
    failed = true;
    // An accepted RGS outcome remains authoritative even if presentation fails.
    // Settle it once and fail closed instead of asking for a replacement outcome.
    if (outcome && rgs.pending?.id === outcome.id) {
      await rgs.settle(outcome.id);
      updateWallet();
    }
    elements.debugGameState.textContent = "STOPPED";
    elements.debugLastEvent.textContent = error instanceof Error ? error.message : "Presentation error";
    elements.status.textContent = "The fixture failed closed; no replacement outcome was requested.";
  } finally {
    witchController.endRound({ failed });
    musicController.setState(MUSIC_STATES.BASE);
    setBusy(false);
  }
}

async function replay() {
  if (busy || !lastOutcome) return;
  setBusy(true, "replay");
  await musicController.unlock();
  let failed = false;
  try {
    const outcome = await rgs.getReplay(lastOutcome.id);
    await presentOutcome(outcome, "replay");
    elements.debugGameState.textContent = "REPLAY COMPLETE";
    elements.status.textContent = `Replay complete. Balance remained ${formatMoney(rgs.getSession().balanceMicro, outcome.currency, locale)}.`;
  } catch (error) {
    failed = true;
    elements.debugGameState.textContent = "REPLAY STOPPED";
    elements.debugLastEvent.textContent = error instanceof Error ? error.message : "Unknown replay error";
  } finally {
    witchController.endRound({ failed });
    musicController.setState(MUSIC_STATES.BASE);
    setBusy(false, "replay");
  }
}

async function initialize() {
  const useMock = new URL(window.location.href).searchParams.get("rgs") === "mock" || document.body.dataset.reviewMode === "mock";
  rgs = useMock ? new MockRgs() : new StakeRgs({ config: launchConfigFromUrl() });
  if (typeof rgs.initialize === "function") await rgs.initialize();
  session = rgs.getSession();
  elements.rgsSource.textContent = useMock ? "Mock fallback" : "Stake-compatible local RGS";
  await prepareWitchStage();
  for (const betMicro of session.betLevels) {
    const option = document.createElement("option");
    option.value = String(betMicro);
    option.textContent = formatMoney(betMicro, session.currency, locale);
    if (betMicro === 1_000_000) option.selected = true;
    elements.betSelect.append(option);
  }

  updateWallet();
  renderState(createInitialState(rgs.getFixturePreview() ?? OUTCOME_TEMPLATES[0].events[0].board));
  musicController.mute(elements.mute.checked);
  elements.status.textContent = "Visual prototype · sample outcomes · no real funds";
  elements.spin.addEventListener("click", spin);
  elements.replay.addEventListener("click", replay);
  elements.betSelect.addEventListener("change", updateWallet);
  elements.mute.addEventListener("change", () => musicController.mute(elements.mute.checked));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") musicController.restore();
  });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isFormControl = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLButtonElement;
    if (event.code === "Space" && !isFormControl && !document.querySelector("dialog[open]")) {
      event.preventDefault();
      spin();
    }
  });
  window.addEventListener("pagehide", () => musicController.destroy(), { once: true });
}

initialize().catch((error) => {
  elements.spin.disabled = true;
  elements.replay.disabled = true;
  elements.betSelect.disabled = true;
  elements.debugGameState.textContent = "RGS ERROR";
  elements.debugLastEvent.textContent = error instanceof Error ? error.message : "Initialization failed";
  elements.status.textContent = "The Stake-compatible RGS failed closed. Add ?rgs=mock only for explicit fallback testing.";
});
