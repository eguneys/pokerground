import { configure } from './config';
import * as lens from './lens';
import { trans } from './trans';
import { makeSerialPromise } from './util';
import { readMiddle, readHands } from './fen';
import { ClockController } from './clock/clockCtrl';

function callUserFunction(f, ...args) {
  if (f) setTimeout(() => f(...args), 1);
}

export default function Controller(state, redraw) {
  const d = this.data = state;

  this.clock = new ClockController(this, {
    onFlag: () => {
      console.log('flag');
    }
  });

  const addAct = (act) => {
    lens.recentActions(this).push(act);
  };

  const beginDelay = (delay = 1000) => {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  };

  const beginDeal = () => {
    this.dealProgress = {};

    var serialPromise = makeSerialPromise();
    
    return this.data.involved.reduce((acc, i) => {
      return serialPromise(resolve => {
        redraw();
        setTimeout(() => {
          this.dealProgress[i] = 1;
          redraw();
          setTimeout(() => {
            this.dealProgress[i] = 2;
            redraw();
            resolve();
          }, 300);
        }, 300);
      });
    }, Promise.resolve());
  };

  const beginCollectPots = (pot) => {
    this.collectPots = true;

    return new Promise(resolve => {
      setTimeout(() => {
        this.collectPots = false;

        this.data.pot = pot;
        lens.acts(this).unshift([]);

        redraw();
        resolve();
      }, 500);
    });
  };

  const beginRevealCards = () => {
    this.hideFlop = !lens.seenRound(this, 'flop');
    this.hideTurn = !lens.seenRound(this, 'turn');
    this.hideRiver = !lens.seenRound(this, 'river');
    
    
    return new Promise(resolve => {
      setTimeout(() => {
        this.hideFlop = false;
        redraw();
        setTimeout(() => {
          this.hideTurn = false;
          redraw();
          setTimeout(() => {
            this.hideRiver = false;
            redraw();
            setTimeout(() => {
              resolve();
            }, 1000);
          }, 2000);
        }, this.hideTurn?2000:0);
      }, this.hideFlop?1000:0);
    });
  };

  const beginSharePots = () => {
    var pots = this.data.showdown.pots;

    var serialPromise = makeSerialPromise();

    return pots.slice(0).reverse().reduce((acc, pot) => {
      return serialPromise(resolve => {
        setTimeout(() => {
          this.shareProgress = pot;
          this.data.pot -= pot.amount;
          redraw();
          setTimeout(() => {
            this.shareProgress = undefined;
            redraw();
            resolve();
          }, 1000);
        }, 500);
      });
    }, Promise.resolve())
      .then(() => {
        this.data.involved = [];
        redraw();
      });
    
  };

  this.deal = (button) => {
    this.data.pot = 0;
    this.data.middle = {};
    this.data.showdown = undefined;
    this.data.play.acts = [[]];
    this.data.play.deal.button = button;

    // some kind of bug on snabbdom doesnt remove dealt cards
    // https://github.com/snabbdom/snabbdom/issues/440
    // this.data.involved = [];
    // redraw();

    this.data.involved = lens.handIndexes(this);

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

  this.call = (call) => {
    addAct({ 'act': 'call', amount: call });
  };

  this.raise = (raise) => {
    addAct({ 'act': 'raise', amount: raise });
  };

  this.allin = (allin) => {
    this.data.play.stacks[lens.toAct(this)] = 0;

    addAct({ 'act': 'allin', amount: allin });
  };

  this.move = (move) => {
    let lp;
    switch(move.act) {
    case 'check':
      lp = this.check();
      break;
    case 'fold':
      lp = this.fold();
      break;
    case 'call':
      lp = this.call(move.amount);
      break;
    case 'allin':
      lp = this.allin(move.amount);
      break;
    case 'raise':
      lp = this.raise(move.amount);
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

  this.trans = trans(state.i18n);
  
}
