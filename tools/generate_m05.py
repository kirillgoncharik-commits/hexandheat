#!/usr/bin/env python3
"""Reproduce the M05 rules, explicit inputs, books and independent evidence."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'math'))
from hexandheat_math.config import STAKE_CANDIDATE_CONFIG as C
from hexandheat_math.engine import board_from_flat, generate_outcome, resolve_round
from hexandheat_math.stake_adapter import to_stake_book
from hexandheat_math.verify import verify_outcome

def sha(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def board(values):
    return board_from_flat(values, C)

def safe_fill(initial, groups, potions=()):
    """Choose explicit refill inputs that settle without extra paying groups."""
    removed = {p for symbol in groups for p,s in enumerate(initial) if s == symbol} | set(potions)
    counts = {s: sum(v == s for p,v in enumerate(initial) if p not in removed) for s in C.regular_symbols}
    refill = []
    for _ in sorted(removed):
        symbol = min(C.regular_symbols, key=lambda s: counts[s])
        refill.append(symbol); counts[symbol] += 1
    return refill

def explicit(fid, purpose, initial, refill, bet=1_000_000):
    outcome = resolve_round(C, board(initial), refill, outcome_id=int(fid[1:]))
    return record(fid, purpose, outcome, {'initialBoard': initial, 'refillSymbols': refill}, bet)

def record(fid, purpose, outcome, inputs, bet=1_000_000):
    verify_outcome(outcome, C)
    book = to_stake_book(outcome)
    # Independently checked group allocation at cap; no change to engine payout.
    for event in book['events']:
        if event['type'] == 'winInfo':
            assert sum(g['win'] for g in event['wins']) == event['totalWin']
    return {'id': fid, 'purpose': purpose, 'configLabel': C.label, 'configHash': C.config_id,
            'betMicro': bet, 'inputs': inputs, 'book': book,
            'expected': {'events': [e.to_dict() for e in outcome.events], 'payoutUnits': outcome.payout_multiplier},
            'sha256': sha(book), 'verification': 'PASS', 'reproduce': '?fixture='+fid}

def build():
    regular = list(C.regular_symbols)
    quiet = (regular * 4)[:30]
    one = ['L1']*8 + (regular[1:]*3)[:22]
    two = ['L1']*8 + ['H1']*8 + (['L2','L3','L4','L5','H2','H3','H4']*2)
    split = ['L1']*4 + ['H1']*4 + (['L2','L3','L4','L5','H2','H3','H4']*4)[:22]
    last = ['L1']*8 + ['P2'] + (regular[1:]*3)[:21]
    catalog = [explicit('F01','Чистый проигрыш',quiet,[]),
       explicit('F02','Малая выплата 0.2× ниже ставки',one,safe_fill(one,['L1'])),
       explicit('F03','Обычная группа H1', ['H1']*8+(regular[:5]*5)[:22],
                safe_fill(['H1']*8+(regular[:5]*5)[:22], ['H1'])),
       explicit('F04','Две одновременно платящие группы',two,safe_fill(two,['L1','H1'])),
       explicit('F05','4 L1 + 4 H1 не дают группы из восьми',split,[])]
    # Search deterministic seeds, retaining reproducible source seed in catalog.
    found = {}
    for seed in range(100000):
        o = generate_outcome(C,seed)
        wins = [e for e in o.events if e.type == 'win']
        mods = [e for e in o.events if e.type == 'multiplier']
        if mods and len(mods[0].payload['potions']) == 1 and any(e.index > mods[0].index for e in wins):
            found.setdefault('F06',(seed,o))
        if mods and len(mods[0].payload['potions']) >= 2 and any(e.index > mods[0].index for e in wins):
            found.setdefault('F07',(seed,o))
        if len(wins) >= 5: found.setdefault('F10',(seed,o))
        if len(found)==3: break
    for fid in ['F06','F07']:
        seed,o=found[fid];catalog.append(record(fid,'Potion и следующий выигрыш',o,{'seed':seed}))
    quiet_p = quiet.copy(); quiet_p[0]='P3'
    catalog += [explicit('F08','Potion на неплатящем поле',quiet_p,[]),
                explicit('F09','Последняя Potion не умножает прошлую выплату',last,safe_fill(last,['L1'],[8]))]
    seed,o=found['F10'];catalog.append(record('F10','Длинная цепочка',o,{'seed':seed}))
    catalog.append(explicit('F11','Cap: computed group != paid group', ['H4']*8+['P3']*22,['H4']*60))
    catalog.append(explicit('F12','Sub-cent 0.2× от 0.01 = 0.002',one,safe_fill(one,['L1']),10_000))
    rules = {'version':'m05-rules-1','productionReady':False,'configHash':C.config_id,**C.to_dict(),
             'policy':{'potion':'after current award, next cascades only','nonPayingPotion':'inactive',
                       'capAllocation':'ordered regular_symbols; min(computed, remaining paid)',
                       'capTermination':'stop without collapse; last authoritative board retained',
                       'cascadeLimit':'raise CascadeLimitExceeded at 64; no fabricated payout',
                       'currencyUnitsPerCredit':1_000_000,'rounding':'exact integer micro units, reject unrepresentable bet'}}
    invalid={'id':'F13','verification':'EXPECTED_REJECTION','mutations':['unknown board ID','unknown event','position row 5/reel -1','event index gap','multiplier discontinuity','removed set mismatch']}
    sequence={'id':'F14','sequence':['F06','F01'],'purpose':'win → loss before protected body completion','reproduce':'?sequence=F14&speed=normal','evidence':'reports/m05/ownership.json'}
    return rules, {'version':'m05-fixtures-1','productionReady':False,'configHash':C.config_id,'cases':catalog,'invalid':invalid,'sequence':sequence}

def main():
    rules,catalog=build()
    outputs={'apps/web/assets/m05/rules.json':rules,'apps/web/assets/m05/fixtures.json':catalog}
    verification={'version':'m05-verification-1','configHash':C.config_id,'valid':{c['id']:{'status':c['verification'],'sha256':c['sha256'],'payoutUnits':c['expected']['payoutUnits']} for c in catalog['cases']},'invalid':'covered by strict JS mutation tests','generator':'unchanged resolve_round + independent verify_outcome'}
    outputs['reports/m05/verification.json']=verification
    check='--check' in sys.argv
    for name,value in outputs.items():
        path=ROOT/name; content=json.dumps(value,ensure_ascii=False,indent=2)+'\n'
        if check: assert path.read_text()==content, 'regeneration differs: '+name
        else: path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    module = "import {deepFreeze} from './fixtures.js';\nexport const BASE_RULES = deepFreeze("+json.dumps(rules,ensure_ascii=False,indent=2)+');\n'
    path=ROOT/'apps/web/src/m05-rules.js'
    if check: assert path.read_text()==module, 'rules module differs'
    else: path.write_text(module)
    text='# Фактическая base paytable M05\n\nGenerated by `python3 tools/generate_m05.py`. Не production approval.\n\n'+C.label+'\n\nConfig SHA-256: `'+C.config_id+'`\n\n100 units = 1× ставки.\n\n| ID | 8+ | 10+ | 12+ | 15+ | 20+ |\n|---|---|---|---|---|---|\n'
    for symbol in C.regular_symbols:
        text+='| '+symbol+' | '+' | '.join(str(C.award_for(symbol,n).amount/100)+'×' for n in [8,10,12,15,20])+' |\n'
    text+='\nP1 +1; P2 +2; P3 +3. Только после выплаты текущего каскада.\n'
    path=ROOT/'docs/m05/BASE_PAYTABLE_RU.md'
    if check: assert path.read_text()==text,'paytable document differs'
    else:path.write_text(text)
    print(json.dumps(verification,ensure_ascii=False))

if __name__=='__main__': main()
