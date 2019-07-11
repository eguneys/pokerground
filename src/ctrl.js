import { configure } from './config';
import * as lens from './lens';
import { trans } from './trans';
import { makeSerialPromise } from './util';
import { readMiddle, readHands, readPlay } from './fen';
import { ClockController } from './clock/clockCtrl';

function callUserFunction(f, ...args) {
  if (f) setTimeout(() => f(...args), 1);
}

export default function Controller(state, redraw) {
  const d = this.data = state;

  this.anims = {
    unbinds: []
  };

  this.clock = new ClockController(this, {
    onFlag: () => {
      console.log('flag');
    }
  });

  const addAct = (act) => {
    lens.recentActions(this).push(act);
  };

  const unbindableTimeout = (f, delay, reject) => {
    var unbinds = this.anims.unbinds;
    var unbind;
    var id = setTimeout(() => {
      unbinds.slice(unbinds.indexOf(unbind), 1);
      f();
    }, delay);
    unbind = () => {
      clearTimeout(id);
      reject("Animation cancelled!");
    };
    unbinds.push(unbind);
  };

  const beginDelay = (delay = 1000) => {
    return new Promise((resolve, reject) => {
      unbindableTimeout(resolve, delay, reject);
    });
  };

  const beginDeal = () => {
    this.anims.dealProgress = {};

    var serialPromise = makeSerialPromise();
    
    return this.data.involved.reduce((acc, i) => {
      return serialPromise((resolve, reject) => {
        redraw();
        unbindableTimeout(() => {
          this.anims.dealProgress[i] = 1;
          redraw();
          unbindableTimeout(() => {
            this.anims.dealProgress[i] = 2;
            redraw();
            resolve();
          }, 300, reject);
        }, 300, reject);
      });
    }, Promise.resolve());
  };

  const beginCollectPots = (pot) => {
    this.anims.collectPots = true;

    return new Promise((resolve, reject) => {
      unbindableTimeout(() => {
        this.anims.collectPots = false;

        this.data.pot = pot;
        lens.acts(this).unshift([]);

        redraw();
        resolve();
      }, 500, reject);
    });
  };

  const beginRevealCards = () => {
    this.anims.hideFlop = !lens.seenRound(this, 'flop');
    this.anims.hideTurn = !lens.seenRound(this, 'turn');
    this.anims.hideRiver = !lens.seenRound(this, 'river');
    
    return new Promise((resolve, reject) => {
      unbindableTimeout(() => {
        this.anims.hideFlop = false;
        redraw();
        unbindableTimeout(() => {
          this.anims.hideTurn = false;
          redraw();
          unbindableTimeout(() => {
            this.anims.hideRiver = false;
            redraw();
            unbindableTimeout(() => {
              resolve();
            }, 1000, reject);
          }, 2000, reject);
        }, this.anims.hideTurn?2000:0, reject);
      }, this.anims.hideFlop?1000:0, reject);
    });
  };

  const beginSharePots = () => {
    var pots = this.data.showdown.pots;

    var serialPromise = makeSerialPromise();

    return pots.slice(0).reverse().reduce((acc, pot) => {
      return serialPromise((resolve, reject) => {
        unbindableTimeout(() => {
          this.anims.shareProgress = pot;
          this.data.pot -= pot.amount;
          redraw();
          unbindableTimeout(() => {
            this.anims.shareProgress = undefined;
            redraw();
            resolve();
          }, 1000, reject);
        }, 500, reject);
      });
    }, Promise.resolve());    
  };

  this.join = (idx, o, stack) => {
    this.data.pov.seats[idx] = o;
  };

  this.leave = (idx) => {
    this.data.pov.seats[idx] = null;
  };

  this.deal = (fen, handIndexes) => {
    this.data.pot = 0;
    this.data.middle = {};
    this.data.showdown = undefined;

    this.data.play = readPlay(fen);

    this.data.pov.handIndexes = handIndexes;

    // some kind of bug on snabbdom doesnt remove dealt cards
    // https://github.com/snabbdom/snabbdom/issues/440
    // this.data.involved = [];
    // redraw();

    this.data.involved = lens.handIndexes(this);

    this.clearAnims();

    return beginDeal();
  };

  this.nextRound = ({ middle, pot }) => {
    this.clearClock();

    return beginCollectPots(pot)
      .then(() => beginDelay(1500))
      .then(() => {
        this.data.middle = readMiddle(middle) || {};
        redraw();
      }).then(beginDelay);
  };

  this.showdown = ({ hands, pots, middle, pot }) => {
    this.data.showdown = { pots, hands: readHands(hands) };

    this.clearClock();

    return beginCollectPots(pot)
      .then(() => beginDelay(1500))
      .then(() => {
        this.data.middle = readMiddle(middle);
      }).then(beginRevealCards)
      .then(beginSharePots);
  };

  this.endRound = ({ pots, pot }) => {
    this.data.showdown = { pots, hands: {} };

    this.clearClock();

    return beginCollectPots(pot)
      .then(beginSharePots);
  };

  this.check = () => {
    
    addAct({ 'act': 'check' });
  };

  this.fold = () => {
    var turn = lens.toAct(this);
    this.data.involved = this.data.involved.filter(_ => _!=turn);

    addAct({ 'act': 'fold' });
  };

  this.call = (call, stack) => {
    lens.setStack(this, stack);
    addAct({ 'act': 'call', amount: call });
  };

  this.raise = (raise, stack) => {
    lens.setStack(this, stack);
    addAct({ 'act': 'raise', amount: raise });
  };

  this.allin = (allin) => {
    lens.setStack(this, 0);
    addAct({ 'act': 'allin', amount: allin });
  };

  this.move = (move, stack) => {
    let lp;
    switch(move.act) {
    case 'check':
      lp = this.check();
      break;
    case 'fold':
      lp = this.fold();
      break;
    case 'call':
      lp = this.call(move.amount, stack);
      break;
    case 'allin':
      lp = this.allin(move.amount);
      break;
    case 'raise':
      lp = this.raise(move.amount, stack);
      break;
    default:
      lp = Promise.reject("bad move");
    }
    this.clearClock();
    return lp;
  };

  this.setClock = (o) => {
    this.clock.setClock(o);
  };

  this.clearClock = () => {
    this.clock.setClock({});
  };

  this.clearAnims = () => {
    this.anims.unbinds.forEach(_ => _());

    this.anims = {
      unbinds: []
    };
  };

  this.trans = trans(state.i18n);
  
}
