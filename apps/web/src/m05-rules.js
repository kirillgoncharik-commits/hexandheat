import {deepFreeze} from './fixtures.js';
export const BASE_RULES = deepFreeze({
  "version": "m05-rules-1",
  "productionReady": false,
  "configHash": "ef29d030a553ca6a24678bdbb1123f29d932f6ba1256f11b4389847c7644b6d3",
  "columns": 6,
  "label": "STAKE_FORMAT_CANDIDATE_UNBALANCED_V0",
  "maxCascades": 64,
  "maxWin": 500000,
  "mode": "base",
  "paytable": [
    {
      "amount": 20,
      "symbol": "L1",
      "threshold": 8
    },
    {
      "amount": 30,
      "symbol": "L1",
      "threshold": 10
    },
    {
      "amount": 50,
      "symbol": "L1",
      "threshold": 12
    },
    {
      "amount": 100,
      "symbol": "L1",
      "threshold": 15
    },
    {
      "amount": 250,
      "symbol": "L1",
      "threshold": 20
    },
    {
      "amount": 20,
      "symbol": "L2",
      "threshold": 8
    },
    {
      "amount": 30,
      "symbol": "L2",
      "threshold": 10
    },
    {
      "amount": 60,
      "symbol": "L2",
      "threshold": 12
    },
    {
      "amount": 120,
      "symbol": "L2",
      "threshold": 15
    },
    {
      "amount": 300,
      "symbol": "L2",
      "threshold": 20
    },
    {
      "amount": 20,
      "symbol": "L3",
      "threshold": 8
    },
    {
      "amount": 40,
      "symbol": "L3",
      "threshold": 10
    },
    {
      "amount": 70,
      "symbol": "L3",
      "threshold": 12
    },
    {
      "amount": 140,
      "symbol": "L3",
      "threshold": 15
    },
    {
      "amount": 350,
      "symbol": "L3",
      "threshold": 20
    },
    {
      "amount": 20,
      "symbol": "L4",
      "threshold": 8
    },
    {
      "amount": 40,
      "symbol": "L4",
      "threshold": 10
    },
    {
      "amount": 80,
      "symbol": "L4",
      "threshold": 12
    },
    {
      "amount": 160,
      "symbol": "L4",
      "threshold": 15
    },
    {
      "amount": 400,
      "symbol": "L4",
      "threshold": 20
    },
    {
      "amount": 30,
      "symbol": "L5",
      "threshold": 8
    },
    {
      "amount": 50,
      "symbol": "L5",
      "threshold": 10
    },
    {
      "amount": 90,
      "symbol": "L5",
      "threshold": 12
    },
    {
      "amount": 180,
      "symbol": "L5",
      "threshold": 15
    },
    {
      "amount": 450,
      "symbol": "L5",
      "threshold": 20
    },
    {
      "amount": 50,
      "symbol": "H1",
      "threshold": 8
    },
    {
      "amount": 100,
      "symbol": "H1",
      "threshold": 10
    },
    {
      "amount": 200,
      "symbol": "H1",
      "threshold": 12
    },
    {
      "amount": 500,
      "symbol": "H1",
      "threshold": 15
    },
    {
      "amount": 1500,
      "symbol": "H1",
      "threshold": 20
    },
    {
      "amount": 60,
      "symbol": "H2",
      "threshold": 8
    },
    {
      "amount": 120,
      "symbol": "H2",
      "threshold": 10
    },
    {
      "amount": 250,
      "symbol": "H2",
      "threshold": 12
    },
    {
      "amount": 650,
      "symbol": "H2",
      "threshold": 15
    },
    {
      "amount": 2000,
      "symbol": "H2",
      "threshold": 20
    },
    {
      "amount": 80,
      "symbol": "H3",
      "threshold": 8
    },
    {
      "amount": 150,
      "symbol": "H3",
      "threshold": 10
    },
    {
      "amount": 330,
      "symbol": "H3",
      "threshold": 12
    },
    {
      "amount": 850,
      "symbol": "H3",
      "threshold": 15
    },
    {
      "amount": 2750,
      "symbol": "H3",
      "threshold": 20
    },
    {
      "amount": 100,
      "symbol": "H4",
      "threshold": 8
    },
    {
      "amount": 200,
      "symbol": "H4",
      "threshold": 10
    },
    {
      "amount": 450,
      "symbol": "H4",
      "threshold": 12
    },
    {
      "amount": 1200,
      "symbol": "H4",
      "threshold": 15
    },
    {
      "amount": 4000,
      "symbol": "H4",
      "threshold": 20
    }
  ],
  "payoutUnitsPerBet": 100,
  "potionIncrements": [
    {
      "increment": 1,
      "symbol": "P1"
    },
    {
      "increment": 2,
      "symbol": "P2"
    },
    {
      "increment": 3,
      "symbol": "P3"
    }
  ],
  "rows": 5,
  "symbolWeights": [
    {
      "symbol": "L1",
      "weight": 140
    },
    {
      "symbol": "L2",
      "weight": 140
    },
    {
      "symbol": "L3",
      "weight": 140
    },
    {
      "symbol": "L4",
      "weight": 140
    },
    {
      "symbol": "L5",
      "weight": 140
    },
    {
      "symbol": "H1",
      "weight": 80
    },
    {
      "symbol": "H2",
      "weight": 70
    },
    {
      "symbol": "H3",
      "weight": 60
    },
    {
      "symbol": "H4",
      "weight": 50
    },
    {
      "symbol": "P1",
      "weight": 28
    },
    {
      "symbol": "P2",
      "weight": 10
    },
    {
      "symbol": "P3",
      "weight": 2
    }
  ],
  "policy": {
    "potion": "after current award, next cascades only",
    "nonPayingPotion": "inactive",
    "capAllocation": "ordered regular_symbols; min(computed, remaining paid)",
    "capTermination": "stop without collapse; last authoritative board retained",
    "cascadeLimit": "raise CascadeLimitExceeded at 64; no fabricated payout",
    "currencyUnitsPerCredit": 1000000,
    "rounding": "exact integer micro units, reject unrepresentable bet"
  }
});
