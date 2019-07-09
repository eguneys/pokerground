import TWEEN from '@tweenjs/tween.js';

import { configure } from './config';

import { readMove as fenReadMove } from './fen';

export default function start(ctrl, redraw) {

  return {
    set(config) {
      return anim((state) => configure(state, config), ctrl.data);
    },
    deal(o) {
      return anim(() => ctrl.deal(o), ctrl.data);
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
    move(uci) {
      const move = fenReadMove(uci);
      switch(move.act) {
      case 'check':
        return anim(() => ctrl.check(), ctrl.data);
      case 'fold':
        return anim(() => ctrl.fold(), ctrl.data);
      case 'call':
        return anim(() => ctrl.call(move.amount), ctrl.data);
      case 'allin':
        return anim(() => ctrl.allin(move.amount), ctrl.data);
      case 'raise':
        return anim(() => ctrl.raise(move.amount), ctrl.data);
      default:
        return Promise.reject("bad move");
      }
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
