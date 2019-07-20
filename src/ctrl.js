import { configure } from './config';
import * as lens from './lens';
import { trans } from './trans';
import { makeSerialPromise } from './util';
import { readMiddle, readHands, readPlay } from './fen';
import { ClockController } from './clock/clockCtrl';

function callUserFunction(f, ...args) {
  if (f) setTimeout(() => f(...args), 1);
}

export default function Controller(state) {
  const d = this.data = state;

  this.anims = {
    updates: []
  };

  this.clock = new ClockController(this, {
    onFlag: () => {
      console.log('flag');
    }
  });

  const addAct = (act) => {
    lens.recentActions(this).push(act);
  };

  const withDelay = (fn, delay, updateFn) => {
    let lastUpdate = 0;

    return (delta) => {
      lastUpdate += delta;
      if (lastUpdate >= delay) {
        fn();
        lastUpdate = 0;
      } else {
        if (updateFn)
          updateFn(lastUpdate / delay);
      }
    };
  };

  const unbindableTimeout = (f, delay, reject) => {
    var updates = this.anims.updates;
    var update = {};
    update.update = withDelay(() => {
      updates.splice(updates.indexOf(update), 1);
      f();
    }, delay);
    update.unbind = () => {
      reject("Animation cancelled!");
    };
    updates.push(update);
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
        unbindableTimeout(() => {
          this.anims.dealProgress[i] = 1;
          unbindableTimeout(() => {
            this.anims.dealProgress[i] = 2;
            resolve();
          }, 100, reject);
        }, 100, reject);
      });
    }, Promise.resolve());
  };

  const beginCollectPots = (oldPot) => {
    this.anims.pot = oldPot;
    this.anims.collectPots = true;

    return new Promise((resolve, reject) => {
      unbindableTimeout(() => {
        this.anims.pot = undefined;
        this.anims.collectPots = false;
        // maybe move this somewhere else
        lens.acts(this).unshift([]);

        resolve();
      }, 500, reject);
    });
  };

  const beginHideCards = () => {
    this.anims.hideFlop = !lens.seenRound(this, 'flop');
    this.anims.hideTurn = !lens.seenRound(this, 'turn');
    this.anims.hideRiver = !lens.seenRound(this, 'river');
    
    return Promise.resolve();
  };

  const beginRevealCards = () => {
    return new Promise((resolve, reject) => {
      unbindableTimeout(() => {
        this.anims.hideFlop = false;
        unbindableTimeout(() => {
          this.anims.hideTurn = false;
          unbindableTimeout(() => {
            this.anims.hideRiver = false;
            unbindableTimeout(() => {
              resolve();
            }, 1000, reject);
          }, 2000, reject);
        }, this.anims.hideTurn?2000:0, reject);
      }, this.anims.hideFlop?1000:0, reject);
    });
  };

  const beginSharePots = () => {
    this.anims.pot = this.data.pot;
    var pots = this.data.showdown.pots;

    var serialPromise = makeSerialPromise();

    return pots.slice(0).reverse().reduce((acc, pot) => {
      return serialPromise((resolve, reject) => {
        unbindableTimeout(() => {
          this.anims.shareProgress = pot;
          this.anims.pot -= pot.amount;
          unbindableTimeout(() => {
            this.anims.shareProgress = undefined;
            resolve();
          }, 1000, reject);
        }, 500, reject);
      });
    }, Promise.resolve());
  };

  this.sit = (pov) => {
    this.data.pov.seats = pov.seats;
    this.data.pov.handIndexes = pov.handIndexes;
    this.refreshClock();
  };

  this.join = (idx, o, stack) => {
    this.data.pov.seats[idx] = o;
  };

  this.leave = (idx) => {
    this.data.pov.seats[idx] = null;
  };

  this.deal = (fen, handIndexes, me) => {
    this.data.middle = {};
    this.data.showdown = undefined;

    this.data.play = readPlay(fen);

    this.data.pot = 0;

    this.data.pov.me = me;
    this.data.pov.handIndexes = handIndexes;

    // some kind of bug on snabbdom doesnt remove dealt cards
    // https://github.com/snabbdom/snabbdom/issues/440
    // this.data.involved = [];
    // redraw();

    this.data.involved = lens.handIndexes(this);

    clearAnims();

    return beginDeal();
  };

  this.nextRound = ({ middle, pot }) => {
    this.data.middle = readMiddle(middle) || {};

    const oldPot = this.data.pot;
    this.data.pot = pot;

    this.clearClock();
    clearAnims();

    return beginCollectPots(oldPot)
      .then(beginDelay);
  };

  this.showdown = ({ hands, pots, middle }) => {
    this.data.showdown = { pots, hands: readHands(hands) };
    this.data.middle = readMiddle(middle);

    const oldPot = this.data.pot;
    this.data.pot = pots.reduce((acc, _) => _.amount + acc, 0);

    this.clearClock();
    clearAnims();

    return beginHideCards()
      .then(beginCollectPots(oldPot))
      .then(beginDelay)
      .then(beginRevealCards)
      .then(beginSharePots);
  };

  this.endRound = ({ pots }) => {
    this.data.showdown = { pots, hands: [] };

    const oldPot = this.data.pot;
    this.data.pot = pots.reduce((acc, _) => _.amount + acc, 0);

    this.clearClock();
    clearAnims();

    return beginCollectPots(oldPot)
      .then(beginSharePots);
  };

  this.check = () => {
    addAct({ 'act': 'check' });
    return Promise.resolve();
  };

  this.fold = () => {
    var turn = lens.toAct(this);
    this.data.involved = this.data.involved.filter(_ => _!=turn);

    addAct({ 'act': 'fold' });
    return Promise.resolve();
  };

  this.call = (call, stack) => {
    lens.setStack(this, stack);
    addAct({ 'act': 'call', amount: call });
    return Promise.resolve();
  };

  this.raise = (raise, stack) => {
    lens.setStack(this, stack);
    addAct({ 'act': 'raise', amount: raise });
    return Promise.resolve();
  };

  this.allin = (allin) => {
    lens.setStack(this, 0);
    addAct({ 'act': 'allin', amount: allin });
    return Promise.resolve();
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

  this.refreshClock = () => {
    this.clock.refresh();
  };

  this.setClock = (o) => {
    this.clock.setClock(o);
  };

  this.clearClock = () => {
    this.clock.setClock({});
  };

  const clearAnims = () => {
    this.anims.updates.forEach(_ => _.unbind());

    this.anims = {
      updates: []
    };
  };

  const updateAnims = (delta) => {
    this.anims.updates.forEach(_ => _.update(delta));
  };

  this.update = (delta) => {
    this.clock.update(delta);
    updateAnims(delta);
  };

  this.clickSit = (index) => {
    callUserFunction(this.data.events.sit, index);
  };

  this.trans = trans(state.i18n);
  
}
