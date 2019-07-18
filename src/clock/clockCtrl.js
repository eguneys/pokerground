import * as lens from '../lens';

import { updateElements } from './clockView';

const nowFun = window.performance && performance.now() > 0 ?
      performance.now.bind(performance) : Date.now;

export function ClockController(ctrl, opts) {
  
  const cdata = ctrl.data.clock;

  this.opts = opts;

  this.elements = {};

  const tick = (delta) => {
    const index = this.times.activeIndex;
    if (index === undefined) return;

    this.times.millis = Math.max(0, this.times.millis - delta);
    const millis = this.times.millis;

    if (millis === 0) {
      this.opts.onFlag();
    } else if (this.elements[index]) {
      updateElements(this, this.elements[index], millis);
    }
  };


  this.setClock = ({ running, times, initial }) => {
    this.running = running;

    const toAct = lens.toAct(ctrl);

    this.barTime = 1000 * initial;
    this.timeRatioDivisor = 1 / this.barTime;

    this.emergMs = 1000 * Math.min(60, Math.max(10, cdata.initial * .125));

    this.times = {
      initial: initial,
      times: times * 1000,
      millis: times * 1000,
      activeIndex: running ? toAct : undefined
    };
  };

  this.setClock(cdata);

  this.timeRatio = (millis) =>
  Math.min(1, millis * this.timeRatioDivisor);
  
  const maybeTick = (delta) => {
    if (this.running) {
      tick(delta);
    }
  };

  this.update = (delta) => {
    maybeTick(delta);
  };
}
