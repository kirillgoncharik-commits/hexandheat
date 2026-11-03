import {mapStakeRoundToOutcome} from './stake-events.js';
/** Explicit deterministic review cases; no probabilities, network wallet or RNG. */
export class ReviewRgs {
  constructor({catalog,fixture='F06',balanceMicro=100_000_000}={}) {
    this.catalog=catalog;this.fixture=fixture;this.balanceMicro=balanceMicro;this.pending=null;this.history=new Map();this.serial=0;
    this.metrics={playCalls:0,settleCalls:0,replayCalls:0};
  }
  async initialize() {if(!this.catalog){const r=await fetch('./assets/m05/fixtures.json');if(!r.ok)throw Error('Fixture catalog unavailable');this.catalog=await r.json();}}
  getSession(){return {currency:'USD',balanceMicro:this.balanceMicro,betLevels:[10_000,50_000,100_000,500_000,1_000_000,2_000_000,5_000_000]};}
  getFixturePreview(){return this.catalog.cases.find(c=>c.id===this.fixture).book.events[0].board;}
  outcome(fixture,betMicro,id='review') {
    const c=this.catalog.cases.find(c=>c.id===fixture);if(!c)throw Error('Unknown review case');
    return mapStakeRoundToOutcome({roundID:id,bookID:c.id,state:c.book.events,payoutMultiplierUnits:c.book.payoutMultiplier},{betMicro,currency:'USD',fixtureId:c.id,label:c.purpose});
  }
  async play({betMicro}) {
    if(this.pending)throw Error('Round pending');if(!this.getSession().betLevels.includes(betMicro)||betMicro>this.balanceMicro)throw Error('Invalid sample bet');
    const o=this.outcome(this.fixture,betMicro,`m05-${this.serial+1}`);this.serial++;this.balanceMicro-=betMicro;this.pending=o;this.history.set(o.id,o);this.metrics.playCalls++;return o;
  }
  async settle(id){if(this.pending?.id!==id)throw Error('No pending round');this.balanceMicro+=this.pending.payoutMicro;this.pending=null;this.metrics.settleCalls++;return {balanceMicro:this.balanceMicro};}
  async getReplay(id){const o=this.history.get(id);if(!o)throw Error('Replay unavailable');this.metrics.replayCalls++;return o;}
}
