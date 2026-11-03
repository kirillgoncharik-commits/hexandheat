/** Stable math identities; existing original rasters, no merged L/H symbol. */
const names = ['Moon goblet','Raven mask','Thorn rose','Crystal eye','Amber elixir','Moon elixir','Jade vial','Heart elixir','Star elixir'];
export const SYMBOL_REGISTRY = Object.freeze(Object.fromEntries(
  ['L1','L2','L3','L4','L5','H1','H2','H3','H4','P1','P2','P3'].map((id,i) => [id,Object.freeze({
    id, role:i<5?'regular low':i<9?'regular high':'Potion',
    name:i<9?names[i]:`Potion +${i-8}`, assetId:`M03-ITEM_${String(i<9?i:9).padStart(2,'0')}`,
    asset:`./assets/symbols/item-${String(i<9?i:9).padStart(2,'0')}.png`,
    paytableKey:i<9?id:null, increment:i<9?0:i-8,
    fallback:i<9?['☽','◆','✿','◉','☾','▤','⬡','⚿','♜'][i]:`+${i-8}`,
    shape:i<5?'low':i<9?'high':`potion-${i-8}`,
    provenance:'assets/ASSET_MANIFEST.json; assets/prompts/M03_PROMPTS.md'
  })])
));
export const LEGACY_SYMBOLS = Object.freeze({amber:'L1',violet:'L2',rose:'L3',blue:'L4',teal:'H2',potion:'P2'});
export function symbolInfo(id) { return SYMBOL_REGISTRY[id] ?? SYMBOL_REGISTRY[LEGACY_SYMBOLS[id]]; }
