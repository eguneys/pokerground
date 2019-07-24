import { app } from '../main';
import { merge } from '../config';

import { delay, makeAwaitable } from './testutil';

export async function deal(fen, indexes, api, loop) {
  api.deal(fen, indexes);

  for (var i = 0; i < indexes.length; i++) {
    await advance(200, loop);
  }
}

export async function move(o, api, loop) {
  api.move(o);
  await advance(1, loop);
}

export async function nextRound(o, api, loop) {
  api.nextRound(o);
  await advance(500, loop);

  await advance(1000, loop);
}

export async function endRound(o, api, loop) {
  const pots = o.pots;
  
  api.endRound(o);
  // begin collect pots
  await advance(500, loop);
  // begin share pots
  for (var i = 0; i < pots.length; i++) {
    await advance(1500, loop);
  }
}

export async function showdown(o, api, loop) {
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

export async function advance(dt, loop) {
  await delay();
  loop.advance(dt);
}

export const withApp = makeAwaitable(async (fn, config) => {
  function TestLoop(fn) {
    this.advance = (time) => {
      const dt = 25;
      while (time > 0) {
        time -= dt;
        fn(dt);
      }
    };
  }

  let loop;

  const parent = document.createElement('div');
  const dom = document.createElement('div');
  parent.appendChild(dom);

  const api = app(dom, config, (fn) => { loop = new TestLoop(fn); });

  await fn(api, parent, loop);
});

export function withDefaults(config) {
  const defaults = () => ({
    currency: '$',
    fen: '70b 50!0(. .)~10!0\n',
    clock: {
      running: true,
      initial: 60,
      times: 60,
    },
    pov: {
      seats: [ null,
               null,
               null,
               { img: 'https://i.pravatar.cc/300' },
               { img: 'https://i.pravatar.cc/300' }],
      handIndexes: [3, 4]
    },
    events: {
    }
  });

  const res = defaults();
  merge(res, config || {});
  return res;
}
