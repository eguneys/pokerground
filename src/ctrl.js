import { configure } from './config';

import * as lens from './lens';

import { trans } from './trans';

import { makeSerialPromise } from './util';

function callUserFunction(f, ...args) {
  if (f) setTimeout(() => f(...args), 1);
}

export default function Controller(state, redraw) {
  this.data = state;

  const addAct = (act) => {
    this.data.recentActs.push(act);
  };

  const beginDeal = () => {
    this.dealProgress = {};

    var serialPromise = makeSerialPromise();

    return this.data.involved.reduce((acc, i) => {
      return acc.then(serialPromise(resolve => {
        setTimeout(() => {
          this.dealProgress[i] = 1;
          redraw();
          setTimeout(() => {
            this.dealProgress[i] = 2;
            redraw();
            resolve();
          }, 500);
        }, 500);
      }
      ));
    }, Promise.resolve());
  };

  const beginCollectPots = () => {
    this.collectPots = true;

    return new Promise(resolve => {
      setTimeout(() => {
        this.collectPots = false;

        this.data.round = lens.nextRound(this);
        this.data.recentActs = [];

        redraw();
        resolve();
      }, 500);
    });
  };

  this.deal = (o) => {
    configure(this.data, { deal: o });

    this.data.round = 'preflop';
    this.data.involved = lens.seatIndexes(this);

    return beginDeal();
  };

  this.nextRound = (pot) => {
    return beginCollectPots();
  };
  
  this.check = () => {
    addAct({ 'act': 'check' });
  };

  this.fold = () => {
    var turn = lens.toAct(this);
    this.data.involved = this.data.involved.filter(_ => _!=turn);

    addAct({ 'act': 'fold' });
  };

  this.call = (call) => {
    addAct({ 'act': 'call', amount: call });
  };

  this.raise = (raise) => {
    addAct({ 'act': 'raise', amount: raise });
  };

  this.allin = (allin) => {
    this.data.pov.seats[lens.toAct(this)].stack = 0;

    addAct({ 'act': 'allin', amount: allin });
  };

  this.trans = trans(state.i18n);
  
}
