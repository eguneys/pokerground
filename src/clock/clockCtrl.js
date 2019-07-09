import * as lens from '../lens';

import { updateElements } from './clockView';

const nowFun = window.performance && performance.now() > 0 ?
      performance.now.bind(performance) : Date.now;

export function ClockController(ctrl, opts) {
  
  const cdata = ctrl.data.clock;

  this.opts = opts;

  this.elements = {};

  const scheduleTick = (time) => {
    if (this.tickCallback !== undefined) clearTimeout(this.tickCallback);
    this.tickCallback = setTimeout(tick, 100);
  };

  const tick = () => {
    this.tickCallback = undefined;
    const index = this.times.activeIndex;
    if (index === undefined) return;

    const now = nowFun();
    const millis = Math.max(0, this.times.times - this.elapsed(now));
    
    scheduleTick(millis);

    if (millis === 0) this.opts.onFlag();
    else updateElements(this, this.elements[index], millis);
  };


  this.setClock = ({ running, times, initial }) => {
    const isClockRunning = running;
    const toAct = lens.toAct(ctrl);

    this.barTime = 1000 * initial;
    this.timeRatioDivisor = 1 / this.barTime;

    this.times = {
      initial: initial,
      times: times * 1000,
      activeIndex: isClockRunning ? toAct : undefined,
      lastUpdate: nowFun()
    };

    if (isClockRunning) scheduleTick(this.times.times);
  };

  this.setClock(cdata);

  this.timeRatio = (millis) =>
  Math.min(1, millis * this.timeRatioDivisor);

  this.elapsed = (now = nowFun()) => Math.max(0, now - this.times.lastUpdate);
  
  this.millisOf = (index) => 
  (this.times.activeIndex === index ?
   Math.max(0, this.times.times - this.elapsed()) :
   this.times.initial);

}
