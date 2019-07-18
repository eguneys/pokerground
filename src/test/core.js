import { app } from '../main';
import { is, not, ok, log } from 'testiz/browser';

const delay = (d = 0) => new Promise(resolve => setTimeout(resolve, d));

function klass(cls, elm) {
  return elm.getElementsByClassName(cls)[0];
}

function hasChild(msg, dom, n) {
  is(msg, dom.children.length, n);
}

export default function run() {

  const config = {
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
  };

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
    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]);
    await delay();
    loop.advance(200);
    await delay();
    api.deal('70b 50B!0(. .)~10!0\n', [3, 4]);
    await delay();
    loop.advance(10);
    hasChild('zero cards', klass('hand four', dom), 0);
    log(klass('hand four', dom));
  }, config);

}

function withApp(fn, config) {
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

  fn(api, parent, loop);
  
}
