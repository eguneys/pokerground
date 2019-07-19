import { is, not, ok, log } from 'testiz/browser';

import { withApp, withDefaults, noop, advance, hasChild, noChild, oneChild, hasText, select, klass } from './util';

async function deal(fen, indexes, api, loop) {
  api.deal(fen, indexes);
  await advance(200, loop);

  await advance(200, loop);
}

async function nextRound(o, api, loop) {
  api.nextRound(o);
  await advance(500, loop);

  await advance(1000, loop);
}

async function endRound(o, api, loop) {
  const pots = o.pots;
  
  api.endRound(o);
  // begin collect pots
  await advance(500, loop);
  // begin share pots
  for (var i = 0; i < pots.length; i++) {
    await advance(1500, loop);
  }
}

async function showdown(o, api, loop) {
  const pots = o.pots;

  api.showdown(o);
  // begin hide cards
  // begin collect pots
  await advance(500, loop);
  // begin delay
  await advance(1000, loop);
  // begin reveal cards
  await advance(6000, loop);

  // begin share pots
  for (var i = 0; i < pots.length; i++) {
    await advance(1500, loop);
  }
}

export default function run() {

  const config = withDefaults({ fen: '70b 50!0(. .)~10!0\n' });

  const endRoundConfig = {
    pots: [
      { amount: 5000, involved: [3, 4]},
      { amount: 500, involved: [3]},
    ]
  };

  const showdownConfig = {
    middle: {
      flop: 'As Tc Qd',
      turn: 'Kh',
      river: '2c'
    },
    hands: [
      { hole: 'Ah Ac', rank: 'threepair', hand: 'Ah Ac As Qd Tc' },
      { hole: 'Kc Jh', rank: 'straight', hand: 'As Kh Qd Jh Tc' }
    ],
    pots: [
      { amount: 500, involved: [3]},
      { amount: 5000, involved: [3, 4]}
    ]
  };

  withApp(async (api, dom, loop) => {
    log('core');
  }, config);

  withApp(async (api, dom, loop) => {
    log('pots before dealt');
    noChild('pots', klass('pots', dom));
    log('pots after deal');
    await deal('70b 50B!0(. .)~10!0\n', [3, 4], api, loop);
    noChild('pots', klass('pots', dom));
    log('pots after preflop');
    await nextRound({ middle: '', pot: 15 }, api, loop);
    oneChild('pot', klass('pots', dom));
    hasText('blinds', select('.pots .pot span', dom), '15$');
    await nextRound({ middle: '', pot: 30 }, api, loop);
    hasText('next round', select('.pots .pot span', dom), '30$');
    
    log('pots after end round');
    await endRound(endRoundConfig, api, loop);
    noChild('pot', klass('pots', dom));
  }, config);

  withApp(async (api, dom, loop) => {
    log('pots after showdown');
    await deal('70b 50B!0(. .)~10!0\n', [3, 4], api, loop);
    await nextRound({ middle: '', pot: 15 }, api, loop);
    await showdown(showdownConfig, api, loop);
    noChild('pot', klass('pots', dom));
  }, config);

  const config2 = withDefaults({ fen: '70b 50B!0(10 10)~10!0\nR10 R20' });
  
}
