import * as lens from './lens';

export function RaiseController(ctrl, opts) {
  this.value = 0;

  this.set = (value) => {
    this.value = value;
  };

  this.addBlind = () => {
    this.set(Math.min(lens.maxRaise(ctrl), this.value + lens.blinds(ctrl)));
  };

  this.removeBlind = () => {
    this.set(Math.max(lens.minRaise(ctrl), this.value - lens.blinds(ctrl)));
  };

  this.min = () => {
    this.set(lens.minRaise(ctrl));
  };

  this.half = () => {
    this.set(lens.pot(ctrl) * 0.5);
  };

  this.threeQuarters = () => {
    this.set(lens.pot(ctrl) * 0.75);
  };

  this.pot = () => {
    this.set(lens.pot(ctrl));
  };
}
