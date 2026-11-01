import { SceneTransport } from "./scene-transport.js";
import { CueDirector } from "./cue-director.js";
import { BoardPlayer } from "./board-player.js";
import { ScenePresentation } from "./scene-presentation.js";
import { ModalManager } from "./modal-manager.js";
import { moodForTier } from "./motion-tokens.js";
import { RasterWitchPlayer } from "./raster-witch.js";
import { OUTCOME_TEMPLATES } from "./fixtures.js";
import { createInitialState, describeEvent, formatMoney, playOutcome } from "./domain.js";
import { AdaptiveMusicController, MUSIC_STATES } from "./adaptive-music.js";
import { MockRgs } from "./mock-rgs.js";
import { StakeRgs, launchConfigFromUrl } from "./stake-rgs.js";
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
const transport = new SceneTransport();
const director = new CueDirector(transport);
const boardPlayer = new BoardPlayer(elements.board, transport);
let presentation = null;
let reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const modalManager = new ModalManager(transport, { reducedMotion: () => reducedMotion, onChange: open => { musicController.duck(open); elements.spin.disabled = busy || open; elements.replay.disabled = busy || open || !lastOutcome; } });
transport.start();
let rgs = null;
let session = null;
let lastOutcome = null;
let busy = false;
let witchController = null;
let rasterPlayer = null;
const musicController = new AdaptiveMusicController({
  transport,
  onError(error) {
    console.warn("Adaptive music disabled:", error);
  }
});

function updateWallet() {
  session = rgs.getSession();
  elements.balance.textContent = formatMoney(session.balanceMicro, session.currency, locale);
  elements.bet.textContent = formatMoney(Number(elements.betSelect.value), session.currency, locale);
}

function renderBoard(state) { boardPlayer.render(state); }

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
  rasterPlayer = new RasterWitchPlayer(document.querySelector(".raster-container"), {
    reducedMotion, transport, atlasUrl: './assets/witch/witch-atlas-m04.webp'
  });
  witchController = new WitchDanceController({
    transport,
    onMissedSeam: data => director.record('witch.missedSeam', data),
    onLoop({ from, to }) {
      rasterPlayer.switchTo(to); elements.witchStage.dataset.state = to.toLowerCase(); elements.witchStateLabel.textContent = to;
      director.record('witch.seam', { from, to });
      if (to === 'IDLE' && !witchController.roundOpen && !witchController.pending) musicController.setState(MUSIC_STATES.BASE);
    }
  });
  witchController.start();
  presentation = new ScenePresentation({ transport, director, board: boardPlayer, witch: witchController, music: musicController, elements, currency: () => session.currency, locale });
  presentation.setReducedMotion(reducedMotion);
  await boardPlayer.prepare();
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
  elements.spin.disabled = value || Boolean(modalManager.active);
  elements.betSelect.disabled = value;
  elements.replay.disabled = value || Boolean(modalManager.active) || !lastOutcome;
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
  presentation.begin();
  elements.status.textContent = source === "replay"
    ? `Replay ${outcome.id}: no wallet or play request will be made.`
    : "The potion is brewing…";
  const speed = elements.fast.checked ? "fast" : "normal";

  const finalState = await playOutcome(outcome, {
    speed,
    delay: async () => {}, // CueDirector owns actual completion and readable holds.
    async onEvent(event, state) {
      const description = describeEvent(event, outcome.currency, locale);
      await presentation.event(event, state, outcome, speed);
      elements.debugGameState.textContent = gamePhase(event, source);
      elements.debugLastEvent.textContent = `${event.index + 1}/${outcome.events.length} · ${description.title}`;

    }
  });
  if (outcome.payoutMicro >= outcome.betMicro * 10) {
    document.querySelector('#result-amount').textContent = formatMoney(outcome.payoutMicro, outcome.currency, locale);
    await modalManager.open(document.querySelector('#result-dialog'), elements.spin);
  }
  return finalState;
}

async function spin() {
  if (busy || modalManager.active || transport.paused) return;
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
    if (failed) musicController.setState(MUSIC_STATES.BASE);
    setBusy(false);
  }
}

async function replay() {
  if (busy || !lastOutcome || modalManager.active || transport.paused) return;
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
    if (failed) musicController.setState(MUSIC_STATES.BASE);
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
    if (document.visibilityState === "visible") { transport.resume('visibility'); musicController.restore(); }
    else { transport.pause('visibility'); musicController.suspend(); }
  });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isFormControl = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLButtonElement;
    if (event.code === "Space" && !isFormControl && !document.querySelector("dialog[open]")) {
      event.preventDefault();
      spin();
    }
  });
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => modalManager.open(document.getElementById(button.dataset.open), button)));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]')?.addEventListener('click', () => modalManager.close(dialog));
    dialog.addEventListener('cancel', event => { event.preventDefault(); modalManager.close(dialog); });
    dialog.addEventListener('click', event => { if (event.target === dialog) modalManager.close(dialog); });
  });
  const reduceToggle = document.querySelector('#reduce-toggle'); reduceToggle.checked = reducedMotion;
  function motionPolicy(value) {
    reducedMotion = value; document.documentElement.classList.toggle('reduce-motion', value);
    rasterPlayer.setReducedMotion(value); presentation.setReducedMotion(value);
  }
  motionPolicy(reducedMotion);
  reduceToggle.addEventListener('change', () => motionPolicy(reduceToggle.checked));
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  preference?.addEventListener('change', event => { reduceToggle.checked = event.matches; motionPolicy(event.matches); });
  window.addEventListener('pagehide', event => {
    transport.pause('pagehide'); musicController.suspend();
    if (!event.persisted) { modalManager.destroy(); presentation.destroy(); witchController.destroy(); rasterPlayer.destroy(); musicController.destroy(); transport.destroy(); }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) { transport.resume('pagehide'); musicController.restore(); } });
  if (document.hidden) { transport.pause('visibility'); musicController.suspend(); }
  window.hexHeatReview = {
    transport, director, witch: witchController, modal: modalManager, music: musicController,
    exportTrace: () => JSON.stringify({ version: 'm04.1-1', trace: director.trace }, null, 2),
    async playFixture(index) {
      if (busy || modalManager.active || transport.paused) return false;
      const template = OUTCOME_TEMPLATES[index]; if (!template) return false;
      const outcome = { ...template, id: 'motion-fixture-' + template.fixtureId, betMicro: template.unitBetMicro, payoutMicro: template.events.at(-1).amount, currency: session.currency };
      setBusy(true, 'replay'); await musicController.unlock(); let failed = false;
      try { await presentOutcome(outcome, 'replay'); elements.status.textContent = 'Motion fixture complete. No wallet requests.'; }
      catch (error) { failed = true; elements.status.textContent = 'Motion fixture interrupted: ' + error.message; }
      finally { witchController.endRound({ failed }); setBusy(false, 'replay'); }
      return !failed;
    },
    requestWitch(state) {
      if (busy) return;
      witchController.beginRound(); witchController.request(state); witchController.endRound();
      musicController.setState(moodForTier(state));
      if (state === 'BONUS') modalManager.open(document.querySelector('#bonus-motion-dialog'));
    }
  };
}

initialize().catch((error) => {
  elements.spin.disabled = true;
  elements.replay.disabled = true;
  elements.betSelect.disabled = true;
  elements.debugGameState.textContent = "RGS ERROR";
  elements.debugLastEvent.textContent = error instanceof Error ? error.message : "Initialization failed";
  elements.status.textContent = "The Stake-compatible RGS failed closed. Add ?rgs=mock only for explicit fallback testing.";
});
