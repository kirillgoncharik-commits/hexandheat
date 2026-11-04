import { SceneTransport } from "./scene-transport.js";
import { AmbientScene } from "./ambient-scene.js";
import { CueDirector } from "./cue-director.js";
import { BoardPlayer } from "./board-player.js";
import { ScenePresentation } from "./scene-presentation.js";
import { ModalManager } from "./modal-manager.js";
import { moodForTier } from "./motion-tokens.js";
import { RigWitchPlayer } from "./rig-witch-player.js";
import { RigWitchPlayer as PreviousRigPlayer } from "./rig-witch-player-v2.js";
import { RasterWitchPlayer } from "./raster-witch.js";
import { CandidateWitchPlayer } from './candidate-witch-player.js';
import { PngSequencePlayer, decodeImage } from './png-sequence-player.js';
import { ReviewRgs } from './review-rgs.js';
import { BASE_RULES } from './m05-rules.js';
import { SYMBOL_REGISTRY } from './symbol-registry.js';
import { OUTCOME_TEMPLATES } from "./fixtures.js";
import { createInitialState, describeEvent, formatMoney, playOutcome } from "./domain.js";
import { AdaptiveMusicController, MUSIC_STATES } from "./adaptive-music.js";
import { StakeRgs, launchConfigFromUrl } from "./stake-rgs.js";
import { WitchDanceController } from "./witch-dance.js";

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
elements.cascadeWin=document.querySelector('#cascade-value');
elements.cascadeLabel=document.querySelector('#cascade-label');
elements.potionNote=document.querySelector('#potion-note');
elements.winLabel=document.querySelector('#win-label');
const query=new URL(location.href).searchParams;
document.body.dataset.layout=query.get('layout')==='B'?'B':'A';
if(query.get('layout')==='before')document.querySelector('#m05-style').disabled=true;
if(['before','m05'].includes(query.get('layout')))document.querySelector('#m06-style').disabled=true;
if(query.get('text')==='large')document.documentElement.classList.add('text-stress');

const locale = navigator.language || "en-US";
const transport = new SceneTransport();
const director = new CueDirector(transport);
const boardPlayer = new BoardPlayer(elements.board, transport);
let presentation = null;
let reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
if(query.get('motion')==='reduced')reducedMotion=true;
const ambient = new AmbientScene(document.querySelector('#ambient-scene'), transport, { reducedMotion });
const modalManager = new ModalManager(transport, { pauseScene:true, reducedMotion: () => reducedMotion, onChange: open => { musicController.duck(open); elements.spin.disabled = busy || open; elements.replay.disabled = busy || open || !lastOutcome; } });
transport.start();
let rgs = null;
let session = null;
let lastOutcome = null;
let busy = false;
let witchController = null;
let rasterPlayer = null;
let recordPending=false;
let recordUnsubscribe=null;
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
  const legacy = new URL(location.href).searchParams.get('witch') === 'legacy';
  rasterPlayer = legacy
    ? new RasterWitchPlayer(document.querySelector('.raster-container'), { reducedMotion, transport, atlasUrl:'./assets/witch/witch-atlas-m04.webp' })
    : new (new URL(location.href).searchParams.get('witch') === 'rig-v2' ? PreviousRigPlayer : RigWitchPlayer)(document.querySelector('.raster-container'), { reducedMotion, transport });
  rasterPlayer=new CandidateWitchPlayer(document.querySelector('.raster-container'),{transport,reducedMotion,fallback:rasterPlayer});
  rasterPlayer.setEnabled(query.get('witch')==='candidate');
  const mediaOptions={transport,reducedMotion,fallback:rasterPlayer};
  if(query.get('fault')==='media')mediaOptions.load=(path,signal)=>path.endsWith('neutral.png')?decodeImage(path,signal):Promise.reject(Error('Injected PNG decode failure'));
  if(query.get('fault')==='manifest')mediaOptions.manifestUrl='./assets/m06/missing-manifest.json';
  rasterPlayer=new PngSequencePlayer(document.querySelector('.raster-container'),mediaOptions);
  rasterPlayer.setEnabled(query.get('witch')==='m06',{immediate:true});
  witchController = new WitchDanceController({
    transport,
    seamWindowMs:50,
    onMissedSeam: data => director.record('witch.missedSeam', data),
    onLoop({ from, to }) {
      rasterPlayer.switchTo(to); elements.witchStage.dataset.state = to.toLowerCase(); elements.witchStateLabel.textContent = to;
      if(recordPending&&to==='SMALL_WIN'){recordPending=false;captureCandidate();}
      director.record('witch.seam', { from, to });
      if (to === 'IDLE' && !witchController.roundOpen && !witchController.pending) musicController.setState(MUSIC_STATES.BASE);
    }
  });
  witchController.start();
  presentation = new ScenePresentation({ transport, director, board: boardPlayer, witch: witchController, music: musicController, elements, currency: () => session.currency, locale });
  presentation.setReducedMotion(reducedMotion);
  await boardPlayer.prepare();
}

async function captureCandidate() {
  try {
    elements.status.textContent='Exporting candidate · 120 samples / 4 seconds · no wager';
    const {exportCandidate}=await import('./candidate-recording.js');
    const blob=await exportCandidate(rasterPlayer.fallback),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='m05-small-win-candidate.webm';a.click();
    const video=document.querySelector('#recording-preview');video.src=a.href;video.hidden=false;
    elements.status.textContent='4-second candidate export ready · 120 timestamped samples · art review pending';
  }catch(error){elements.status.textContent=error.message;}
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
  document.body.dataset.gameState=value?'busy':'ready';
  elements.spin.disabled = value || Boolean(modalManager.active);
  elements.betSelect.disabled = value;
  document.querySelector('#fixture-select').disabled=value;
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
  elements.fixtureLabel.textContent = outcome.contractVersion?`${outcome.fixtureId} · 6 × 5`:'LEGACY ART · 6 × 5';
  document.querySelector('#round-details').replaceChildren();
  elements.debugLastEvent.textContent = "Waiting for event 1";
  presentation.begin();
  elements.status.textContent = source === "replay"
    ? `Replay ${outcome.id}: no wallet or play request will be made.`
    : "The potion is brewing…";
  const speed = elements.fast.checked ? "fast" : "normal";
  let injectedJank=false;

  const finalState = await playOutcome(outcome, {
    speed,
    delay: async () => {}, // CueDirector owns actual completion and readable holds.
    async onEvent(event, state) {
      if(query.get('fault')==='jank'&&!injectedJank&&event.type==='win'){injectedJank=true;const started=performance.now();while(performance.now()-started<200){}document.body.dataset.injectedJankMs='200';}
      const description = describeEvent(event, outcome.currency, locale);
      await presentation.event(event, state, outcome, speed);
      elements.debugGameState.textContent = gamePhase(event, source);
      elements.debugLastEvent.textContent = `${event.index + 1}/${outcome.events.length} · ${description.title}`;

    }
  });
  if (outcome.payoutMicro >= outcome.betMicro * 10) {
    document.querySelector('#result-heading').textContent=outcome.events.at(-1).capped?'Sample cap reached · 5000×':'Big win';
    document.querySelector('#result-amount').textContent = formatMoney(outcome.payoutMicro, outcome.currency, locale);
    await modalManager.open(document.querySelector('#result-dialog'), elements.spin);
  }
  return finalState;
}

async function spin(options = {}) {
  if (busy || modalManager.active || transport.paused) return;
  setBusy(true, "spin");
  if(!options.silent)await musicController.unlock();
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
  elements.fast.checked=query.get('speed')==='fast';
  const useMock = query.get('rgs') !== 'local';
  rgs = useMock ? new ReviewRgs({fixture:query.get('fixture')??'F06',...(query.has('long')?{balanceMicro:9_000_000_000_000_000}:{})}) : new StakeRgs({ config: launchConfigFromUrl() });
  if (typeof rgs.initialize === "function") await rgs.initialize();
  session = rgs.getSession();
  elements.rgsSource.textContent = useMock ? 'Verified M05 samples · no real funds' : 'Stake-compatible local RGS';
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
  document.body.dataset.gameState='ready';
  document.querySelector('#rules-version').textContent=`${BASE_RULES.label} · ${BASE_RULES.version} · ${BASE_RULES.configHash.slice(0,12)}`;
  const paytable=document.querySelector('#paytable-body');
  for(const info of Object.values(SYMBOL_REGISTRY)) {
    const tr=document.createElement('tr'),name=document.createElement('th');
    const img=document.createElement('img');img.src=info.asset;img.alt='';name.append(img,document.createTextNode(`${info.id} ${info.name}`));tr.append(name);
    if(info.increment){const td=document.createElement('td');td.colSpan=5;td.textContent=`Each bottle: +${info.increment} after a paying cascade. No count threshold.`;tr.append(td);}
    else for(const threshold of [8,10,12,15,20]) {const td=document.createElement('td');const award=BASE_RULES.paytable.find(p=>p.symbol===info.id&&p.threshold===threshold);td.textContent=award?`${award.amount/100}×`:'—';tr.append(td);}
    paytable.append(tr);
  }
  const fixtureSelect=document.querySelector('#fixture-select');
  if(useMock) {
    for(const c of rgs.catalog.cases){const option=document.createElement('option');option.value=c.id;option.textContent=`${c.id} · ${c.purpose}`;fixtureSelect.append(option);}
    fixtureSelect.value=rgs.fixture;
    const choose=()=>{rgs.fixture=fixtureSelect.value;const c=rgs.catalog.cases.find(c=>c.id===rgs.fixture);elements.betSelect.value=String(c.betMicro);updateWallet();if(!lastOutcome){renderState(createInitialState(rgs.getFixturePreview()));elements.fixtureLabel.textContent=`${c.id} · 6 × 5`;}else elements.fixtureLabel.textContent=`${lastOutcome.fixtureId} · NEXT ${c.id}`;};
    fixtureSelect.addEventListener('change',choose);choose();
  } else fixtureSelect.disabled=true;
  const candidateToggle=document.querySelector('#candidate-toggle');candidateToggle.checked=query.get('witch')==='candidate';
  candidateToggle.addEventListener('change',()=>{rasterPlayer.setEnabled(false);document.querySelector('#media-review-toggle').checked=false;rasterPlayer.fallback.setEnabled(candidateToggle.checked);});
  const mediaToggle=document.querySelector('#media-review-toggle');mediaToggle.checked=query.get('witch')==='m06';
  mediaToggle.addEventListener('change',()=>rasterPlayer.setEnabled(mediaToggle.checked));
  document.querySelector('#record-candidate').addEventListener('click',async()=>{
    if(busy)return;await rasterPlayer.fallback.preload;if(!rasterPlayer.fallback.ready||rasterPlayer.fallback.failed){elements.status.textContent='Candidate source unavailable; fallback preserved.';return;}
    await modalManager.close();candidateToggle.checked=true;rasterPlayer.setEnabled(false);mediaToggle.checked=false;rasterPlayer.fallback.setEnabled(true);recordPending=true;witchController.beginRound();witchController.request('SMALL_WIN');witchController.endRound();elements.status.textContent='Candidate recording starts on the next four-second seam · no wager';
    recordUnsubscribe?.();recordUnsubscribe=transport.subscribe(({phaseMs})=>{if(!recordPending){recordUnsubscribe?.();recordUnsubscribe=null;return;}if(phaseMs<50&&witchController.active==='SMALL_WIN'){recordPending=false;captureCandidate();}},5);
  });
  if(query.has('compare')) {
    await rasterPlayer.fallback.preload;await rasterPlayer.fallback.fallback.preload;
    if(query.get('witch')==='m06'){await rasterPlayer.prepare();await rasterPlayer.preload('IDLE');await rasterPlayer.preload('SMALL_WIN');}
    transport.pause('comparison');transport.time=Number(query.get('phase')??1200);for(const key of rasterPlayer.readyCycles.keys())rasterPlayer.readyCycles.set(key,0);rasterPlayer.switchTo(query.get('state')??'SMALL_WIN');rasterPlayer.fallback.tick();rasterPlayer.tick();
    elements.status.textContent='Comparison pose · no wager · art acceptance pending';elements.spin.disabled=true;
  }
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
    rasterPlayer.setReducedMotion(value); presentation.setReducedMotion(value); ambient.setReducedMotion(value);
  }
  motionPolicy(reducedMotion);
  reduceToggle.addEventListener('change', () => motionPolicy(reduceToggle.checked));
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  preference?.addEventListener('change', event => { reduceToggle.checked = event.matches; motionPolicy(event.matches); });
  window.addEventListener('pagehide', event => {
    transport.pause('pagehide'); musicController.suspend();
    if (!event.persisted) { modalManager.destroy(); presentation.destroy(); witchController.destroy(); rasterPlayer.destroy(); ambient.destroy(); musicController.destroy(); transport.destroy(); }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) { transport.resume('pagehide'); musicController.restore(); } });
  if (document.hidden) { transport.pause('visibility'); musicController.suspend(); }
  window.hexHeatReview = {
    transport, director, witch: witchController, character: rasterPlayer, ambient, modal: modalManager, music: musicController,
    exportTrace: () => JSON.stringify({ version: 'm04.1-1', trace: director.trace }, null, 2),
    async playFixture(index) {
      if (busy || modalManager.active || transport.paused) return false;
      const template = OUTCOME_TEMPLATES[index]; if (!template) return false;
      const outcome = { ...template, id: 'motion-fixture-' + template.fixtureId, betMicro: template.unitBetMicro, payoutMicro: template.events.at(-1).amount, currency: session.currency };
      setBusy(true, 'replay'); await musicController.unlock(); let failed = false;
      try { await presentOutcome(outcome, 'replay'); elements.status.textContent = 'Legacy art showcase · not math verification · no wallet requests.'; }
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
  if(query.has('qa')){
    const {layoutMetrics}=await import('./m06-layout-metrics.js');const panel=document.createElement('aside');panel.className='qa-overlay';const output=document.createElement('output');panel.append(output);document.body.append(panel);
    let last=-1;transport.subscribe(({now})=>{if(Math.floor(now/500)===last)return;last=Math.floor(now/500);const m=layoutMetrics(document,rasterPlayer.manifest);output.textContent=JSON.stringify({hero:m.hero.height,cell:m.cell.width,face:m.clips,scroll:m.scroll,media:rasterPlayer.diagnostics().mode},null,1);},50);
  }
  // Explicit bounded F14 diagnostic: no real funds, no recurring autoplay.
  if(query.get('sequence')==='F14'&&rgs instanceof ReviewRgs){
    rgs.fixture='F06';
    const run=async()=>{
      await spin({silent:true});
      while(witchController.active!=='SMALL_WIN')await transport.wait(30);
      const retained=elements.win.textContent;
      document.querySelector('#fixture-select').value='F01';
      document.querySelector('#fixture-select').dispatchEvent(new Event('change'));
      const retainedAfterSelection=elements.win.textContent;
      await spin({silent:true});
      const result={speed:elements.fast.checked?'fast':'normal',retainedBeforeNewRound:retained,retainedAfterSelection,
        win:elements.win.textContent,multiplier:elements.multiplier.textContent,cascade:elements.cascadeLabel.textContent,
        bodyState:witchController.active,spinDisabled:elements.spin.disabled,sourceOutcome:lastOutcome.fixtureId};
      document.body.dataset.f14Result=JSON.stringify(result);transport.pause('review-capture');
      elements.status.textContent='F14 inspection paused · old body / new loss · press P to resume';
    };
    document.addEventListener('keydown',e=>{if(e.code==='KeyP')transport.resume('review-capture');});
    run().catch(error=>{elements.status.textContent='F14 stopped: '+error.message;});
  }
}

initialize().catch((error) => {
  elements.spin.disabled = true;
  elements.replay.disabled = true;
  elements.betSelect.disabled = true;
  elements.debugGameState.textContent = "RGS ERROR";
  elements.debugLastEvent.textContent = error instanceof Error ? error.message : "Initialization failed";
  elements.status.textContent = "The Stake-compatible RGS failed closed. Add ?rgs=mock only for explicit fallback testing.";
});
