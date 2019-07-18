import TWEEN from '@tweenjs/tween.js';

import { configure } from './config';

import { readMove as fenReadMove } from './fen';

export default function start(ctrl) {

  return {
    set(config) {
      return anim((state) => configure(state, config), ctrl.data);
    },
    sit(pov) {
      return anim(() => ctrl.sit(pov), ctrl.data);
    },
    join(idx, o) {
      return anim(() => ctrl.join(idx, o), ctrl.data);
    },
    leave(idx) {
      return anim(() => ctrl.leave(idx), ctrl.data);
    },
    deal(o, handIndexes) {
      return anim(() => ctrl.deal(o, handIndexes), ctrl.data);
    },
    nextRound(o) {
      return anim(() => ctrl.nextRound(o), ctrl.data);
    },
    endRound(o) {
      return anim(() => ctrl.endRound(o), ctrl.data);
    },
    showdown(o) {
      return anim(() => ctrl.showdown(o), ctrl.data);
    },
    setClock(o) {
      return anim(() => ctrl.setClock(o), ctrl.data);
    },
    move(uci, stack) {
      const move = fenReadMove(uci);
      return anim(() => ctrl.move(move, stack), ctrl.data);
    },
    check() {
      return anim(() => ctrl.check(), ctrl.data);
    },
    fold() {
      return anim(() => ctrl.fold(), ctrl.data);
    },
    call(call) {
      return anim(() => ctrl.call(call), ctrl.data);
    },
    allin(allin) {
      return anim(() => ctrl.allin(allin), ctrl.data);
    },
    raise(raise) {
      return anim(() => ctrl.raise(raise), ctrl.data);
    },
  };

}

export function anim(mutate, state) {
  const resultP = mutate(state);
  return resultP;
}

const perf = window.performance !== undefined ? window.performance : Date;

const raf = window.requestAnimationFrame;

export function animOLD(mutate, state) {
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
