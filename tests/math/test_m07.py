import json
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools'))
from generate_m07 import build, C, board
from generate_m05 import sha
from hexandheat_math.engine import resolve_round
from hexandheat_math.stake_adapter import to_stake_book
from hexandheat_math.verify import verify_outcome

class M07Tests(unittest.TestCase):
    def test_every_input_reproduces_full_book_and_independent_checks(self):
        catalog=build()
        for c in catalog['cases']+catalog['matrix']:
            with self.subTest(case=c['id']):
                o=resolve_round(C,board(c['inputs']['initialBoard']),c['inputs']['refillSymbols'],outcome_id=c['book']['id'])
                verify_outcome(o,C);self.assertEqual(to_stake_book(o),c['book']);self.assertEqual(sha(c['book']),c['sha256'])
    def test_scatter_geometry_chain_and_potion_meanings(self):
        cases={c['id']:c for c in build()['cases']}
        events=lambda fid,t:[e for e in cases[fid]['expected']['events'] if e['type']==t]
        self.assertEqual(len(events('B06','win')[0]['groups']),3)
        self.assertEqual(len(events('B09','win')),5)
        self.assertEqual(len(events('B13','multiplier')),0)
        self.assertEqual(cases['B12']['expected']['payoutUnits'],20)
        self.assertEqual(events('B11','multiplier')[0]['to'],6)
        self.assertEqual(len(events('B18','win')[0]['positions']),30)
        self.assertEqual(cases['B14-EQUAL']['expected']['payoutUnits'],100)
        self.assertEqual(len(build()['matrix']),180)
if __name__=='__main__':unittest.main()
