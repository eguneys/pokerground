import TWEEN from '@tweenjs/tween.js';

import { configure } from './config';

export default function start(ctrl, redraw) {

  return {
    set(config) {
      anim((state) => configure(state, config), ctrl.data);
    },
    deal(o) {
      anim(() => ctrl.deal(o), ctrl.data);
    },
    check() {
      anim(() => ctrl.check(), ctrl.data);
    },
    fold() {
      anim(() => ctrl.fold(), ctrl.data);
    },
    call(toCall) {
      anim(() => ctrl.call(toCall), ctrl.data);
    },
    allin(toAllin) {
      anim(() => ctrl.allin(toAllin), ctrl.data);
    },
    raise(raise) {
      anim(() => ctrl.raise(raise), ctrl.data);
    },
  };

}

const perf = window.performance !== undefined ? window.performance : Date;

const raf = window.requestAnimationFrame;

export function anim(mutate, state) {
  const resultP = mutate(state);

  return Promise
    .all([resultP,
           new Promise((resolve) => {


             // step(state, perf.now());

             function step() {

               TWEEN.update();
               state.redraw();

               const tweens = TWEEN.getAll();

               if (tweens.length === 0) {
                 resolve();
                 return;
               }
               raf((now = perf.now()) => step(state, now));
             }
             raf((now = perf.now()) => step(state, now));
  })
         ]);
}
