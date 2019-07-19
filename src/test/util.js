import { app } from '../main';
import { merge } from '../config';

import { is, not, ok } from 'testiz/browser';

export const noop = () => {};

export const delay = (d = 0) => new Promise(resolve => setTimeout(resolve, d));

export function select(selector, elm) {
  function selectSingle(selector, elm) {
    const klassPattern = /\.(.*)/;
    let matched;
    if ((matched = selector.match(klassPattern))) {
      return elm.getElementsByClassName(matched[1])[0];
    } else {
      return elm.getElementsByTagName(selector)[0];
    }
  }

  selector = selector.split(' ');

  return selector.reduce((acc, selector) => {
    if (!acc) return acc;
    return selectSingle(selector, acc);
  }, elm);
}

export function klass(cls, elm) {
  return elm.getElementsByClassName(cls)[0];
}

export function hasText(msg, dom, text) {
  is(msg, dom.textContent, text);
}

export function hasChild(msg, dom, n) {
  is(msg, dom.children.length, n);
}

function makeAwaitable(fn) {
  let lastPromise = Promise.resolve();
  
  return function(...args) {
    lastPromise = lastPromise.then(async () => {
      await fn(...args);
    });
    return lastPromise;
  };
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
