import { createInitialState, describeEvent, formatMoney, playOutcome } from "./domain.js";
import { AdaptiveMusicController, MUSIC_STATES } from "./adaptive-music.js";
import { MockRgs } from "./mock-rgs.js";
import { StakeRgs, launchConfigFromUrl } from "./stake-rgs.js";
import { createSyntheticVideoSources } from "./synthetic-video.js";
import { NativeVideoLoopController } from "./video-loop.js";
import { WitchDanceController } from "./witch-dance.js";

const SYMBOL_LABELS = Object.freeze({
  amber: "Amber square",
  violet: "Violet square",
  teal: "Teal square",
  rose: "Rose square",
  blue: "Blue square",
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
      if (symbol === "potion") {
        cell.textContent = "+";
      }
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
  const first = elements.witchFigure;
  const standby = first.cloneNode(true);
  standby.removeAttribute("id");
  standby.removeAttribute("role");
  standby.removeAttribute("aria-label");
  first.setAttribute("aria-hidden", "true");
  standby.setAttribute("aria-hidden", "true");
  standby.classList.remove("is-active");
  first.classList.add("is-active");
  first.parentElement.append(standby);

  const figures = [first, standby];
  let active = first;

  const videoRequested = new URL(window.location.href).searchParams.get("media") === "video";
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (videoRequested && !reducedMotion) {
    try {
      const sources = await createSyntheticVideoSources();
      videoObjectUrls = Object.values(sources);
      videoController = new NativeVideoLoopController({
        layers: elements.videoLayers,
        sources,
        onError(error) {
          elements.witchStage.classList.add("media-failed");
          elements.mediaStatus.textContent = `Video POC fell back safely: ${error.message}`;
        }
      });
      if (await videoController.start("IDLE")) {
        elements.witchStage.classList.add("uses-video-poc");
        elements.mediaStatus.textContent = "Synthetic native-video POC · preloaded two-layer crossfade · CSS fallback armed";
      }
    } catch (error) {
      elements.witchStage.classList.add("media-failed");
      elements.mediaStatus.textContent = `Video POC unavailable; CSS fallback active: ${error.message}`;
    }
  } else if (videoRequested && reducedMotion) {
    elements.mediaStatus.textContent = "Reduced Motion: native-video POC disabled; static CSS fallback active";
  }

  witchController = new WitchDanceController({
    onLoop({ from, to, durationMs }) {
      const state = to.toLowerCase();
      elements.witchStage.dataset.state = state;
      elements.witchStateLabel.textContent = to;
      if (from === null) {
        active.dataset.state = state;
        active.style.setProperty("--witch-loop-duration", String(durationMs) + "ms");
        return;
      }

      videoController?.switchTo(to);

      const incoming = figures.find((figure) => figure !== active);
      incoming.classList.add("is-preparing");
      incoming.classList.remove("is-active");
      incoming.dataset.state = state;
      incoming.style.setProperty("--witch-loop-duration", String(durationMs) + "ms");
      // Reset a hidden CSS loop at neutral pose A. A future video player will
      // instead pre-decode the corresponding first frame before this handoff.
      void incoming.offsetWidth;
      incoming.classList.remove("is-preparing");
      incoming.classList.add("is-active");
      active.classList.remove("is-active");
      active = incoming;
    },
    onAccent({ type }) {
      if (type !== "POTION") return;
      // Potion is an independent magical accent, not a BONUS dance state.
      elements.witchStage.classList.remove("has-potion-accent");
      void elements.witchStage.offsetWidth;
      elements.witchStage.classList.add("has-potion-accent");
    },
    onRequest({ target }) {
      videoController?.preload(target);
    }
  });

  elements.witchStage.addEventListener("animationend", (event) => {
    if (event.animationName === "witch-potion-accent") {
      elements.witchStage.classList.remove("has-potion-accent");
    }
  });
  witchController.start();
  window.addEventListener("pagehide", () => {
    witchController.destroy();
    videoController?.destroy();
    videoObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    videoObjectUrls = [];
  }, { once: true });
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
      ? "Replaying immutable outcome"
      : "Presenting precomputed outcome"
    : "Ready for a deterministic spin";
}

async function presentOutcome(outcome, source) {
  elements.fixtureLabel.textContent = `Fixture ${outcome.fixtureId}`;
  elements.debugLastEvent.textContent = "Waiting for event 1";
  witchController.beginRound();
  elements.status.textContent = source === "replay"
    ? `Replay ${outcome.id}: no wallet or play request will be made.`
    : `Round ${outcome.id}: payout is fixed by the received Stake-format book.`;
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
    outcome = await rgs.play({ betMicro });
    lastOutcome = outcome;
    updateWallet();
    await presentOutcome(outcome, "spin");
    await rgs.settle(outcome.id);
    updateWallet();
    elements.debugGameState.textContent = "SETTLED";
    elements.status.textContent = `Settled ${outcome.id}. Replay uses the same frozen ${outcome.events.length}-event stream.`;
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
  const useMock = new URL(window.location.href).searchParams.get("rgs") === "mock";
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
  renderState(createInitialState(rgs.getFixturePreview()));
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
    if (event.code === "Space" && !isFormControl) {
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
