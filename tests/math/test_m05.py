import json
from pathlib import Path
import subprocess
import sys
import unittest

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'math'))
from hexandheat_math.config import STAKE_CANDIDATE_CONFIG as C
from hexandheat_math.engine import board_from_flat,generate_outcome,resolve_round,InvalidBoard
from hexandheat_math.model import Outcome,BookEvent
from hexandheat_math.verify import verify_outcome,VerificationError
from hexandheat_math.stake_adapter import map_outcome_events

class M05Tests(unittest.TestCase):
    def test_cap_allocates_two_groups_in_generator_order_without_changing_payout(self):
        o=resolve_round(C,board_from_flat(['H4']*8+['P3']*22,C),(['H4']*20+['H1']*10)*2)
        verify_outcome(o,C)
        wins=[e for e in map_outcome_events(o) if e['type']=='winInfo']
        self.assertEqual(o.payout_multiplier,500000)
        self.assertEqual([g['symbol'] for g in wins[-1]['wins']],['H1','H4'])
        self.assertEqual([g['win'] for g in wins[-1]['wins']],[6700,218500])
        self.assertEqual(sum(e['totalWin'] for e in wins),o.payout_multiplier)
    def test_reproducible_independently_verified_catalog(self):
        result=subprocess.run([sys.executable,'tools/generate_m05.py','--check'],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        catalog=json.loads((ROOT/'apps/web/assets/m05/fixtures.json').read_text())
        self.assertEqual([c['id'] for c in catalog['cases']],[f'F{i:02}' for i in range(1,13)])
        for c in catalog['cases']:
            inputs=c['inputs']
            o=generate_outcome(C,inputs['seed']) if 'seed' in inputs else resolve_round(C,board_from_flat(inputs['initialBoard'],C),inputs['refillSymbols'])
            verify_outcome(o,C)
            self.assertEqual(o.payout_multiplier,c['expected']['payoutUnits'])

    def test_f13_independent_rejection(self):
        with self.assertRaises(InvalidBoard):board_from_flat(['UNKNOWN']*30,C)
        o=generate_outcome(C,7)
        for change in ['type','position','payout']:
            events=list(o.events)
            event=events[1];payload=event.payload
            if change=='type':events[1]=BookEvent.create(1,'unknown',**payload)
            if change=='position':payload['positions']=[30];events[1]=BookEvent.create(1,event.type,**payload)
            payout=o.payout_multiplier+(10 if change=='payout' else 0)
            if change=='payout':
                final=events[-1];data=final.payload;data['amount']=payout
                events[-1]=BookEvent.create(final.index,final.type,**data)
            bad=Outcome(0,payout,tuple(events),o.config_id,o.source_seed)
            with self.assertRaises(VerificationError):verify_outcome(bad,C)

if __name__=='__main__':unittest.main()
