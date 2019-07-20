import { is, not, ok, log } from 'testiz/browser';

import { noop, delay, hasChild, noChild, oneChild, hasText, select, klass } from './testutil';

import { withApp, withDefaults, advance, deal, nextRound, showdown, endRound } from './util';

export default function run() {
    
  const config = withDefaults({ fen: '70b 50!0(. .)~10!0' });

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
    ok('dom is built', select('.pg-wrap', dom));

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
    await delay(1000);
    noChild('cards', klass('hand four', dom));
    // log(klass('hand four', dom));
  }, config);

  withApp(async (api, dom, loop) => {
    log('begin collect pots on next round');
    noChild('actions predeal', select('.actions', dom));
    await deal('70b 50s 60B!0(. 5 10)~10!0\n', [0, 3, 4], api, loop);
    hasChild('actions after deal', select('.actions', dom), 2);
    ok('big blind', select('.actions .five.big-blind', dom));
    ok('small blind', select('.actions .four.small-blind', dom));
    api.nextRound({ middle: '', pot: 100 });
    await advance(1, loop);
    hasChild('actions after deal', select('.actions', dom), 2);
    ok('actions on collect', select('.actions .five.collect.big-blind', dom));

    await advance(500, loop);
    noChild('actions after collect', select('.actions', dom));
    // log(select('.actions', dom));
    is('actions after collect fen', api.getFen(), '\n');
    // document.body.appendChild(dom);
    // await advance(1000, loop);
    // api.check();
    // await advance(1000, loop);
    // log(select('.actions', dom));

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
