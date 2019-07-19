import { is, not, ok, log } from 'testiz/browser';

import { withApp, withDefaults, noop, delay, hasChild, hasText, select, klass } from './util';

async function deal(fen, indexes, api, loop) {
  api.deal(fen, indexes);
  await delay();
  loop.advance(200);
  await delay();
}

async function nextRound(o, api, loop) {
  api.nextRound(o);
  loop.advance(500);
  await delay();
  loop.advance(1000);
}

export default function run() {
  
  const config = withDefaults({ fen: '70b 50!0(. .)~10!0\n' });

  withApp(async (api, dom, loop) => {
    log('deal cards one by one');
    is('dom is built', dom.children.length, 1);

    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]);
    await delay();
    loop.advance(100);
    hasChild('one card', klass('hand four', dom), 1);
    loop.advance(100);
    hasChild('two cards', klass('hand four', dom), 2);
    await delay();
    loop.advance(100);
    log('second player');
    hasChild('one card', klass('hand five', dom), 1);
    loop.advance(100);
    hasChild('two card', klass('hand five', dom), 2);
  }, config);

  withApp(async (api, dom, loop) => {
    log('interrupt deal cards');
    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]).catch(noop);
    await delay();
    loop.advance(200);
    await delay();
    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]);
    await delay();
    loop.advance(10);
    hasChild('zero cards', klass('hand four', dom), 0);
    // log(klass('hand four', dom));
  }, config);

  withApp(async (api, dom, loop) => {
    log('pots before dealt');
    hasChild('zero pots', klass('pots', dom), 0);
    log('pots after deal');
    await deal('70b 50B!0(. .)~10!0\n', [3, 4], api, loop);
    hasChild('zero pots', klass('pots', dom), 0);
    log('pots after preflop');
    loop.advance(500);
    await nextRound({ middle: '', pot: 15 }, api, loop);
    hasChild('one pot', klass('pots', dom), 1);
    hasText('15$ pot', select('.pots .pot span', dom), '15$');
    await nextRound({ middle: '', pot: 30 }, api, loop);
    hasText('30$ pot', select('.pots .pot span', dom), '30$');
  }, config);

  const config2 = withDefaults({ fen: '70b 50B!0(10 10)~10!0\nR10 R20' });
}
