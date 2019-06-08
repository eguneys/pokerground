import { toAct } from './lens';

import { trans } from './trans';

function callUserFunction(f, ...args) {
  if (f) setTimeout(() => f(...args), 1);
}

export default function Controller(state, redraw) {
  this.data = state;

  const addAct = (act) => {
    this.data.recentActs.push(act);
  };

  this.deal = (o) => {
    this.data.deal = o;

    this.data.round = 'preflop';

    this.data.firstToAct = o.firstToAct;
  };
  
  this.check = () => {
    addAct({ 'act': 'check' });
  };

  this.call = (call) => {
    addAct({ 'act': 'call', amount: call });
  };

  this.raise = (raise) => {
    addAct({ 'act': 'raise', amount: raise });
  };

  this.allin = (allin) => {
    this.data.pov.seats[toAct(this)].stack = 0;

    addAct({ 'act': 'allin', amount: allin });
  };

  this.trans = trans(state.i18n);
  
}
