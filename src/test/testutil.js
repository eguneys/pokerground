import { is, not, ok } from 'testiz/browser';

export const noop = () => {};

export const delay = (d = 0) => new Promise(resolve => setTimeout(resolve, d));

export function select(selector, elm) {
  function selectSingle(selector, elm) {
    const klassPattern = /\.([^\.]*)/g;
    let matched;
    if ((matched = selector.match(klassPattern))) {
      matched = matched.map(_ => _.slice(1, _.length));
      return elm.getElementsByClassName(matched.join(' '))[0];
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

export function oneChild(msg, dom, n) {
  hasChild('one ' + msg, dom, 1);
}

export function noChild(msg, dom, n) {
  hasChild('no ' + msg, dom, 0);
}

export function hasChild(msg, dom, n) {
  is(msg, dom.children.length, n);
}

export function makeAwaitable(fn) {
  let lastPromise = Promise.resolve();
  
  return function(...args) {
    lastPromise = lastPromise.then(async () => {
      await fn(...args);
    });
    return lastPromise;
  };
}
