#!/usr/bin/env python3
"""Generate an editable SVG timing board from the committed runtime motion tokens."""
from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'apps/web/src/motion-tokens.js').read_text()
tokens = {}
for mode in ('normal', 'fast'):
    block = re.search(rf'{mode}: Object.freeze\(\{{([^}}]+)', source).group(1)
    tokens[mode] = {k: int(v) for k, v in re.findall(r'(\w+): (\d+)', block)}
parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1690" viewBox="0 0 1600 1690">']
def rect(x, y, w, h, fill='#231a2d', stroke='#654d6c', radius=12):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>')
def text(x, y, value, size=19, fill='#f4e2c9', family='Arial'):
    parts.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-family="{family}">{escape(str(value))}</text>')
rect(0, 0, 1600, 1690, '#110e18', '#110e18', 0)
text(64, 65, 'HEX & HEAT / M04.1', 18, '#dfb374')
text(64, 126, 'One scene. One rhythm.', 52, family='Georgia')
text(64, 170, 'Motion specification - editable Figma import board - 2026-11-01', 20, '#baaac5')
text(64, 206, 'Runtime tokens are authoritative. Four-second body loops remain independent of settlement.', 19, '#baaac5')
text(64, 270, '01 / Event choreography', 26, '#dfb374')
n = tokens['normal']; stages = [('Reveal',n['reveal']),('Win / read',n['win']),('Potion impact',n['multiplier']),('Remove',n['remove']),('Fall / settle',n['fall']+5*n['stagger'])]
total = sum(v for _,v in stages); x=64
for label,duration in stages:
    width = duration / total * 1472
    rect(round(x,2), 300, round(width-7,2), 96, '#263a32' if 'Potion' in label else '#33233e')
    text(x+12, 338, label, 18); text(x+12, 373, f'{duration}ms', 16, '#78e4ba'); x+=width
text(64, 433, 'Each stage awaits renderer completion + required read hold. Accent markers share one onset.', 20, '#baaac5')
text(64, 493, '02 / Protected body grid', 26, '#dfb374')
for col,label in enumerate(['0ms / seam','1000ms / pose 2','2000ms / pose 3','3000ms / pose 4']):
    text(365+col*290, 536, label, 18, '#78e4ba')
for row,state in enumerate(['IDLE','SMALL_WIN','MEDIUM_WIN','BIG_WIN','BONUS']):
    y=556+row*70; text(64,y+40,state,19)
    for col in range(4):
        rect(350+col*290,y,270,52,'#332c23' if col==0 else '#231a2d')
        text(367+col*290,y+33,'shared anchor' if col==0 else 'same pivot / identity',17,'#dfb374' if col==0 else '#baaac5')
text(64, 950, '4000ms -> next seam. New rounds discard unstarted old reactions; an active dance completes.', 20, '#baaac5')
text(64, 1010, '03 / Motion tokens', 26, '#dfb374')
for x,label in [(64,'Stage'),(700,'Normal'),(1000,'Fast')]:text(x,1052,label,18,'#78e4ba')
for i,(label,key) in enumerate([('Win presentation','win'),('Count-up maximum','count'),('Read hold minimum','read'),('Potion','multiplier'),('Column stagger','stagger')]):
    y=1090+i*36; text(64,y,label,18);text(700,y,f"{tokens['normal'][key]}ms",18);text(1000,y,f"{tokens['fast'][key]}ms",18)
text(64, 1310, '04 / Window ownership', 26, '#dfb374')
for i,label in enumerate(['CLOSED','OPENING 220ms','OPEN','CLOSING 160ms']):
    x=64+i*370;rect(x,1338,346,70);text(x+18,1381,label,20)
text(64, 1450, 'Backdrop + panel + audio duck share the transition. One focus owner. Reduced Motion removes travel.', 19, '#baaac5')
text(64, 1510, '05 / Screen coverage', 26, '#dfb374')
text(64, 1550, 'S01-05 launch | S06-12 round | S13-16 bonus | S17-21 controls | S22-25/30 recovery | S26-29 replay', 18)
text(64, 1590, 'For every screen: trigger, data source, enter, impact/readable, exit, barrier, focus and fallback.', 19, '#baaac5')
text(64, 1635, 'Import into M04 / Motion & Timing. Native Figma page and physical-device acceptance remain pending.', 18, '#dfb374')
parts.append('</svg>')
target = ROOT / 'design/M04_MOTION_BOARD.svg'
target.write_text('\n'.join(parts)+'\n')
(ROOT / 'apps/web/M04_MOTION_BOARD.svg').write_text(target.read_text())
print(target.relative_to(ROOT))
