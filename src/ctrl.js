import { configure } from './config';

import * as lens from './lens';

import { trans } from './trans';

import { makeSerialPromise } from './util';

import { readMiddle, readHands } from './fen';

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

  const beginCollectPots = (pot) => {
    this.collectPots = true;

    return new Promise(resolve => {
      setTimeout(() => {
        this.collectPots = false;

        this.data.pot = pot;
        this.data.round = lens.nextRound(this);
        this.data.recentActs = [];

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

    pots.slice(0).reverse().reduce((acc, pot) => {
      return acc.then(serialPromise(resolve => {
        setTimeout(() => {
          this.shareProgress = pot;
          this.data.pot -= pot.amount;
          redraw();
          setTimeout(() => {
            this.shareProgress = undefined;
            redraw();
            resolve();
          }, 2000);
        }, 500);
      }));
    }, Promise.resolve());
    
  };

  this.deal = (o) => {
    configure(this.data, { deal: o });

    this.data.round = 'preflop';
    this.data.involved = lens.seatIndexes(this);

    return beginDeal();
  };

  this.nextRound = ({ middle, pot }) => {
    this.data.middle = readMiddle(middle) || {};

    return beginCollectPots(pot);
  };

  this.showdown = ({ hands, pot, pots, middle }) => {
    this.data.showdown = { pots, hands: readHands(hands) };
    this.data.middle = readMiddle(middle);

    return Promise.all([
      beginCollectPots(pot),
      beginRevealCards()
        .then(beginSharePots)
    ]);
  };

  this.endRound = ({ pot, pots }) => {
    this.data.showdown = { pots, hands: {} };

    beginCollectPots(pot)
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
    this.data.pov.seats[lens.toAct(this)].stack = 0;

    addAct({ 'act': 'allin', amount: allin });
  };

  this.trans = trans(state.i18n);
  
}
