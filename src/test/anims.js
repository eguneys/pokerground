import { is, not, ok, log } from 'testiz/browser';

import { withApp, withDefaults, noop, delay, hasChild, noChild, oneChild, hasText, select, klass } from './util';

export default function run() {
    
  const config = withDefaults({ fen: '70b 50!0(. .)~10!0\n' });

  withApp(async (api, dom, loop) => {
    log('anims');
  }, config);

  withApp(async (api, dom, loop) => {
    log('deal cards one by one');
    is('dom is built', dom.children.length, 1);

    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]);
    await delay();
    loop.advance(100);
    oneChild('card', klass('hand four', dom));
    loop.advance(100);
    hasChild('two cards', klass('hand four', dom), 2);
    await delay();
    loop.advance(100);
    log('second player');
    oneChild('card', klass('hand five', dom));
    loop.advance(100);
    hasChild('two cards', klass('hand five', dom), 2);
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
    noChild('cards', klass('hand four', dom));
    // log(klass('hand four', dom));
  }, config);
}
