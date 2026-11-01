const $ = id => document.getElementById(id);
const frame = $('game');
const review = () => frame.contentWindow?.hexHeatReview;
const input = id => frame.contentDocument?.getElementById(id);
let playing = false;
function syncCheck(id, checked) { const target = input(id); if (!target) return; target.checked = checked; target.dispatchEvent(new Event('change', { bubbles: true })); }
$('viewport').addEventListener('change', event => {
  const sizes = { full: ['100%', '780px'], '390': ['392px', '846px'], '360': ['362px', '642px'], '480': ['482px', '322px'] };
  const size = sizes[event.target.value]; frame.style.width = size[0]; frame.style.height = size[1];
});
$('play').addEventListener('click', async () => {
  if (!review()) return;
  playing = true; $('play').disabled = true;
  try { await review().playFixture(Number($('fixture').value)); }
  finally { playing = false; $('play').disabled = false; }
});
$('pause').addEventListener('click', () => { review()?.transport.pause('lab'); review()?.music.suspend(); });
$('resume').addEventListener('click', () => { review()?.transport.resume('lab'); review()?.music.restore(); });
$('fast').addEventListener('change', event => syncCheck('fast-toggle', event.target.checked));
$('reduce').addEventListener('change', event => syncCheck('reduce-toggle', event.target.checked));
$('sound').addEventListener('change', async event => { await review()?.music.unlock(); syncCheck('mute-toggle', !event.target.checked); });
$('states').addEventListener('click', event => { const state = event.target.dataset.state; if (state) review()?.requestWitch(state); });
$('stall').addEventListener('click', () => { const end = performance.now() + 200; while (performance.now() < end) { /* explicit dev-only fault injection */ } });
$('export').addEventListener('click', () => {
  const data = review()?.exportTrace(); if (!data) return;
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'hexheat-m04-cue-trace.json'; anchor.click(); URL.revokeObjectURL(url);
});
function draw() {
  const r = review();
  if (r) {
    $('play').disabled = playing;
    $('clock').textContent = `${r.transport.paused ? 'PAUSED' : 'SCENE'} ${(r.transport.now / 1000).toFixed(2)}s`;
    $('phase').textContent = `BODY ${(r.transport.now % 4000).toFixed(0)} / 4000ms`;
    $('witch').textContent = `WITCH ${r.witch.active}${r.witch.pending ? ' → ' + r.witch.pending : ''}`;
    $('mood').textContent = `MUSIC ${r.music.state}`;
    const last = r.director.trace.at(-1); $('cue').textContent = last ? `${last.type} · ${last.at}ms` : 'Ready';
    if (document.querySelector('details').open) $('trace').textContent = r.director.trace.slice(-35).map(t => JSON.stringify(t)).join('\n');
  }
  requestAnimationFrame(draw);
}
draw();
