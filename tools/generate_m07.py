#!/usr/bin/env python3
"""Staged visual review inputs; unchanged resolver + independent verification."""
from collections import Counter
import json
import sys
from pathlib import Path
from generate_m05 import C, ROOT, board, record
from hexandheat_math.engine import resolve_round
S = list(C.regular_symbols)

def fill(n, counts, excluded=()):
    result=[]
    for _ in range(n):
        symbol=min((s for s in S if s not in excluded),key=lambda s:counts[s])
        counts[symbol]+=1;result.append(symbol)
    return result

def staged(phases, potions=(), leading=()):
    values=[s for s,n in phases[0] for _ in range(n)]+list(potions)
    counts=Counter(values)
    values+=fill(30-len(values),counts,[s for s,n in phases[0]])
    order=list(leading)+[i for i in [(j*7)%30 for j in range(30)] if i not in leading]
    current=[None]*30
    for p,s in zip(order,values):current[p]=s
    initial=current.copy();refill=[]
    if not any(C.award_for(s,counts[s]) for s in S):return initial,refill
    for targets in list(phases[1:])+[None]:
        counts=Counter(current);paying={s for s in S if C.award_for(s,counts[s])}
        assert paying
        removed={p for p,s in enumerate(current) if s in paying or C.potion_increment(s)}
        survivors=[[s for row,s in enumerate(current[c*5:c*5+5]) if c*5+row not in removed] for c in range(6)]
        counts=Counter(s for col in survivors for s in col);chunk=[]
        for s,n in targets or []:
            assert n>=counts[s]
            chunk += [s]*(n-counts[s]);counts[s]=n
        assert len(chunk)<=len(removed)
        chunk+=fill(len(removed)-len(chunk),counts,[s for s,n in targets or []])
        assert all(counts[s]<8 for s in S if s not in {s for s,n in targets or []})
        refill+=chunk;current=[];offset=0
        for col in survivors:
            n=5-len(col);current+=chunk[offset:offset+n]+col;offset+=n
    return initial,refill

def build():
    cases=[];matrix=[]
    def add(fid,purpose,phases,potions=(),leading=(),bet=1_000_000,target=cases):
        initial,refill=staged(phases,potions,leading)
        outcome=resolve_round(C,board(initial),refill,outcome_id=7000+len(cases)+len(matrix))
        c=record(fid,purpose,outcome,{'initialBoard':initial,'refillSymbols':refill,'phases':phases,'layout':'explicit scattered column-major'},bet)
        target.append(c);return c
    add('B01','Семь одинаковых · без выплаты',[[('L1',7)]])
    add('B02','Восемь по краям · соседство не требуется',[[('L1',8)]],leading=[0,4,25,29,7,12,17,22])
    add('B03','Большая low-группа · 12 символов',[[('L2',12)]])
    add('B04','High-группа · порог 20',[[('H3',20)]])
    add('B05','Golden · две группы → Potion → каскад',[[('L1',8),('H1',8)],[('H2',8)]],['P1'])
    add('B06','Три одновременно платящие группы',[[('L1',8),('H1',8),('H2',8)]])
    add('B07','Survivors · падение на три ряда',[[('L1',8)]],leading=[2,3,4,7,8,9,23,29])
    add('B08','Три выигрыша · разные символы',[[('L1',8)],[('H1',8)],[('H2',8)]])
    add('B09','Пять каскадов · контролируемое нарастание',[[('L1',8)],[('L2',8)],[('L3',8)],[('L4',8)],[('L5',8)]])
    add('B10','P1 · старый ×1 → новый ×2',[[('L1',8)],[('H1',8)]],['P1'])
    add('B11','P2 + P3 · одна активация +5',[[('L1',8)],[('H1',8)]],['P2','P3'])
    add('B12','Последняя Potion · прошлый paid неизменен',[[('L1',8)]],['P2'])
    add('B13','Проигрыш · Potion неактивна',[[('L1',7)]],['P3'])
    add('B14','Меньше ставки · сдержанная выплата',[[('L1',8)]])
    add('B14-EQUAL','Возврат ровно ставки',[[('H4',8)]])
    add('B15','MEDIUM · обычные 5×',[[('H1',15)]])
    add('B16','BIG · обычные 12×',[[('H4',15)]])
    boundaries=[('B17',3.9,[[('H3',12)],[('H2',8)]]),('B17-4',4,[[('L4',20)]]),('B17-4A',4.1,[[('H3',12)],[('H3',8)]]),('B17-10B',9.9,[[('H3',15)],[('L3',15)]]),('B17-10',10,[[('H1',15)],[('H1',15)]]),('B17-10A',10.1,[[('H3',15)],[('L4',15)]])]
    for fid,ratio,phases in boundaries:
        c=add(fid,f'Граница реакции · {ratio}×',phases);assert c['expected']['payoutUnits']==round(ratio*100)
    add('B18','Все 30 high symbols · полный board',[[('H4',30)]])
    add('B19','SMALL → LOSS · первый раунд последовательности',[[('L1',8)],[('H1',8)]],['P1'])
    add('B20','Три суммы · ставка 0.01 · точные sub-cent',[[('L1',8),('H1',8),('H2',8)]],bet=10_000)
    add('B20-LARGE','Три суммы · максимальная sample-ставка',[[('H1',8),('H2',8),('H3',8)]],bet=5_000_000)
    for s in S:
        for t in [8,10,12,15,20]:
            add(f'T-{s}-{t}',f'{s} tier {t}',[[(s,t)]],target=matrix)
            for n in [t-1,t,t+1]:add(f'Q-{s}-{t}-{n}',f'{s}: {t} boundary {n}',[[(s,n)]],target=matrix)
    return {'version':'m07-fixtures-1','productionReady':False,'curatedNotDistribution':True,'configHash':C.config_id,'cases':cases,'matrix':matrix,'playlist':['B05','B01','B10','B06','B15','B13','B16','B09','B20','B18'],
        'sequences':[{'id':'B19-SMALL','cases':['B19','B01'],'criterion':'new manual Spin before active body cycle finishes'},{'id':'B19-BIG','cases':['B16','B01'],'criterion':'close final dialog; new manual Spin before active body cycle finishes'}],
        'thresholds':{'4x':[390,400,410],'10x':[990,1000,1010],'nearestProof':'All configured base awards are multiples of 10 units; integer Potion multipliers preserve this lattice.'}}

def main():
    catalog=build();check='--check' in sys.argv
    matrix=catalog.pop('matrix')
    outputs={'apps/web/assets/m07/fixtures.json':catalog,'apps/web/assets/m07/symbol-matrix.json':{'configHash':C.config_id,'cases':matrix},'reports/m07/verification.json':{'version':'m07-verification-1','configHash':C.config_id,'resolver':'unchanged resolve_round','verifier':'independent verify_outcome, every generated book','cases':{c['id']:{'sha256':c['sha256'],'payoutUnits':c['expected']['payoutUnits'],'status':c['verification']} for c in catalog['cases']+matrix}}}
    for path,value in outputs.items():
        p=ROOT/path;content=(json.dumps(value,ensure_ascii=False,separators=(',',':')) if path.endswith('symbol-matrix.json') else json.dumps(value,ensure_ascii=False,indent=2))+'\n'
        if check:assert p.read_text()==content,path
        else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content)
    print(json.dumps({'cases':len(catalog['cases']),'matrix':len(matrix),'configHash':C.config_id,'status':'PASS'}))
if __name__=='__main__':main()
