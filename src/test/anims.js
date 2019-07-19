import { is, not, ok, log } from 'testiz/browser';

import { noop, hasChild, noChild, oneChild, hasText, select, klass } from './testutil';

import { withApp, withDefaults, advance, deal, nextRound, showdown, endRound } from './util';

export default function run() {
    
  const config = withDefaults({ fen: '70b 50!0(. .)~10!0\n' });

  const showdownConfig2 = {
    middle: {
      flop: 'As Tc Qd',
      turn: 'Kh',
      river: '2c'
    },
    hands: [
      { hole: 'Ah Ac', rank: 'threepair', hand: 'Ah Ac As Qd Tc' },
      null
    ],
    pots: [
      { amount: 500, involved: [3]},
      { amount: 5000, involved: [3, 4]}
    ]
  };

  withApp(async (api, dom, loop) => {
    log('anims');
  }, config);

  withApp(async (api, dom, loop) => {
    log('deal cards one by one');
    is('dom is built', dom.children.length, 1);

    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]);
    await advance(100, loop);
    oneChild('card', klass('hand four', dom));
    loop.advance(100);
    hasChild('two cards', klass('hand four', dom), 2);
    await advance(100, loop);
    log('second player');
    oneChild('card', klass('hand five', dom));
    await advance(100, loop);
    hasChild('two cards', klass('hand five', dom), 2);
  }, config);

  withApp(async (api, dom, loop) => {
    log('interrupt deal cards');
    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]).catch(noop);
    await advance(200, loop);
    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]);
    await advance(10, loop);
    noChild('cards', klass('hand four', dom));
    // log(klass('hand four', dom));
  }, config);

  withApp(async (api, dom, loop) => {
    log('showdown with mucked hands');
    await deal('70b 50s 60B!0(. 5 10)~10!0\n', [0, 3, 4], api, loop);
    await nextRound({ middle: '', pot: 15 }, api, loop);

    await showdown(showdownConfig2, api, loop);
    ok('ace hearts', select('.holes .hole.one .ace.hearts', dom));
    ok('ace clubs', select('.holes .hole.one .ace.clubs', dom));
  }, config);
}
