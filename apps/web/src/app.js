import { createInitialState, deriveWitchState, describeEvent, formatMoney, playOutcome } from "./domain.js";
import { MockRgs } from "./mock-rgs.js";

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
  status: document.querySelector("#status")
};

const rgs = new MockRgs();
const locale = navigator.language || "en-US";
let session = rgs.getSession();
let lastOutcome = null;
let busy = false;

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

function setWitchState(state) {
  const dataState = state.toLowerCase();
  elements.witchStage.dataset.state = dataState;
  elements.witchFigure.dataset.state = dataState;
  elements.witchFigure.setAttribute("aria-label", `Placeholder witch silhouette, state ${state}`);
  elements.witchStateLabel.textContent = state;
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
  setWitchState("IDLE");
  elements.status.textContent = source === "replay"
    ? `Replay ${outcome.id}: no wallet or play request will be made.`
    : `Round ${outcome.id}: payout is already fixed by the mock RGS.`;
  const speed = elements.fast.checked ? "fast" : "normal";

  return playOutcome(outcome, {
    speed,
    onEvent(event, state) {
      const description = describeEvent(event, outcome.currency, locale);
      renderState(state);
      elements.debugGameState.textContent = gamePhase(event, source);
      elements.debugLastEvent.textContent = `${event.index + 1}/${outcome.events.length} · ${description.title}`;
      setWitchState(deriveWitchState(event, outcome));
    }
  });
}

async function spin() {
  if (busy) return;
  setBusy(true, "spin");
  let outcome = null;
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
    // An accepted RGS outcome remains authoritative even if presentation fails.
    // Settle it once and fail closed instead of asking for a replacement outcome.
    if (outcome && rgs.pending?.id === outcome.id) {
      await rgs.settle(outcome.id);
      updateWallet();
    }
    elements.debugGameState.textContent = "STOPPED";
    elements.debugLastEvent.textContent = error instanceof Error ? error.message : "Presentation error";
    setWitchState("IDLE");
    elements.status.textContent = "The fixture failed closed; no replacement outcome was requested.";
  } finally {
    setBusy(false);
  }
}

async function replay() {
  if (busy || !lastOutcome) return;
  setBusy(true, "replay");
  try {
    const outcome = await rgs.getReplay(lastOutcome.id);
    await presentOutcome(outcome, "replay");
    elements.debugGameState.textContent = "REPLAY COMPLETE";
    elements.status.textContent = `Replay complete. Balance remained ${formatMoney(rgs.getSession().balanceMicro, outcome.currency, locale)}.`;
  } catch (error) {
    elements.debugGameState.textContent = "REPLAY STOPPED";
    elements.debugLastEvent.textContent = error instanceof Error ? error.message : "Unknown replay error";
    setWitchState("IDLE");
  } finally {
    setBusy(false, "replay");
  }
}

function initialize() {
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
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isFormControl = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLButtonElement;
    if (event.code === "Space" && !isFormControl) {
      event.preventDefault();
      spin();
    }
  });
}

initialize();
