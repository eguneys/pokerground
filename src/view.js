import { h } from 'snabbdom';

import { numbers, numberFormat, chipsFormat, currencyFormat } from './util';

import { renderClock } from './clock/clockView';

import { bind } from './viewUtil';

import * as util from './util';

import * as lens from './lens';
import * as icons from './icons';

function renderSeat(ctrl, seat, index) {
  const stack = lens.stack(ctrl, index);

  return (seat === null) ?
    h('div.seat.empty.'+numbers[index], {
      hook: bind('click', () => ctrl.clickSit(index))
    }, [
      icons.sit
    ]) :
    h('div.seat.' + numbers[index], [
      renderClock(ctrl, seat, index),
      h('img', { attrs: { src: seat.img } }),
      h('span.stack', (stack === 0) ? ctrl.trans('allin') : (!stack) ? '' : numberFormat(stack) + ctrl.data.currency)
    ]);
}

function renderSeats(ctrl) {
  var seats = lens.seats(ctrl);
  return h('div.seats', seats.map((seat, i) => renderSeat(ctrl, seat, i)));
}

const actionStyle = (ctrl, index) => ({
  transition: 'transform .8s, opacity .8s',
  remove: {
    transform: util.translatePots(ctrl.data.seats, index),
    opacity: '0.4'
  }
});

function renderAction(ctrl, type, index, klass, amount) {
  function renderAmount(amount) {
    return h('div', h('span', amount));
  }

  var content;
  amount = amount?numberFormat(amount) + ctrl.data.currency: undefined;
  klass = '.' + numbers[index] + klass;
  if (ctrl.anims.collectPots)
    klass += '.' + 'collect';

  switch (type) {
  case 'bigBlind':
    klass += '.big-blind';
    content = [
      h('i', 'B'),
      renderAmount(amount)];
    break;
  case 'smallBlind':
    klass += '.small-blind';
    content = [
      h('i', 'B'),
      renderAmount(amount)];
    break;
  case 'raise':
    klass += '.raise';
    content = [
      icons.raise,
      renderAmount(amount)];
    break;
  case 'allin':
    klass += '.allin';
    content = [
      icons.raise,
      renderAmount(amount)];
    break;
  case 'call':
    klass += '.call';
    content = [
      h('i', 'C'),
      renderAmount(amount)];
    break;
  case 'fold':
    klass += '.fold';
    content = [
      icons.fold,
      amount ? renderAmount(amount):null
    ];
    break;
  case 'check':
    klass += '.check';
    content = [icons.check];
    break;
  }
  return h('div.action.' + klass, {
    style: (ctrl.anims.collectPots && type !== 'check') ? actionStyle(ctrl, index): ''
  }, content);
}

function renderActions(ctrl) {
  var deal = lens.deal(ctrl),
      blinds = lens.blinds(ctrl);
  const actionsKlass = '';
  var content = [];
  const lastActionsWithIndex = lens.takeLastActionsWithIndex(ctrl);

  if (lens.preflop(ctrl)) {
    const players = lens.players(ctrl);
    const bigBlindAction = lastActionsWithIndex.length < players;
    const smallBlindAction = lastActionsWithIndex.length < players - 1;

    if (bigBlindAction)
      content.push(
        renderAction(ctrl, 'bigBlind', lens.bigBlind(ctrl), '', blinds));
    if (smallBlindAction)
      content.push(
        renderAction(ctrl, 'smallBlind', lens.smallBlind(ctrl), '', blinds / 2));
  }

  content = [...content,
             ...lastActionsWithIndex.slice(0, -1)
             .map(({ action, i }) =>
               renderAction(ctrl, action.act, i, '', action.amount)),
             ...lastActionsWithIndex.slice(-1).map(({action, i}) =>
               renderAction(ctrl, action.act, i, '.last', action.amount)
             )];
  
  return h('div.actions.' + actionsKlass, content);
}

function renderPots(ctrl) {
  const potShareStyle = (ctrl, index) => ({
    transition: 'transform 1s, opacity 1s',
    delayed: {
      opacity: 0.8,
      transform: util.translatePots(ctrl.data.seats, index, true)
    }
  });

  var amount = (ctrl.anims.pot !== undefined) ? ctrl.anims.pot : ctrl.data.pot;

  var sidePot = ctrl.anims.shareProgress;

  var mainContent = amount > 0 ? h('div.pot', [
    icons.chip,
    h('span', currencyFormat(chipsFormat(amount), ctrl.data.currency))]) : null;

  var sideContent = sidePot ? sidePot.involved.map(index =>
    h('div.pot', {
      style: potShareStyle(ctrl, index)
    }, [
      icons.chip,
      h('span', currencyFormat(chipsFormat(sidePot.amount / sidePot.involved.length), ctrl.data.currency))])
  ) : [];

  return h('div.pots', [mainContent,
                        ...sideContent]);
}

function renderButton(ctrl) {
  var klass = numbers[lens.button(ctrl)];
  
  return h('div.button.' + klass, 'D');
}

const dealRotatingStyle = (() => {

  var rotations = {};

  return (ctrl, index, hand) => {
    if (!rotations[index+" "+hand]) {
      rotations[index+" "+hand] = (hand==2)?Math.random() * 30: Math.random() * 5;
    }
    var rotation = rotations[index+" "+hand];

    return dealBackStyle(ctrl, index, rotation);
  };
})();

const dealBackStyle = (ctrl, index, rotation) => {
  return {
    transform: util.translateDeal(ctrl.data.seats, index) + ' rotate(0deg)',
    transition: 'transform .3s, opacity .3s',
    delayed: {
      transform: `translateX(0) translateY(0) rotate(${rotation}deg)`
    },
    remove: {
      transform: util.translateDeal(ctrl.data.seats, index),
      opacity: '0.2'
    }
  };
};



function renderHands(ctrl) {
  var content;

  var ins = lens.involved(ctrl);

  var dealProgress = ctrl.anims.dealProgress;

  content = [
    h('div.hand.dealer', [
      h('div.card.back'),
      h('div.card.back'),
      h('div.card.back')
    ]),
    h('div.hands', ins.map(index => {
      return h('div.hand.' + numbers[index], {}, [
        (dealProgress && dealProgress[index]>=1)?h('div.card.back', {
          style: dealRotatingStyle(ctrl, index, 1)
        }): null,
        (dealProgress && dealProgress[index]==2)?h('div.card.back', {
          style: dealRotatingStyle(ctrl, index, 2)
        }): null
      ]);
    }))
  ];

  return content;
}

function renderCard(card, klass) {
  return h('div.card.' + [card.rank, card.suit, klass].join('.'));
}

function renderMiddleCard(card, highlight, shouldShade) {
  var glow = (highlight || []).some(_ => _.rank === card.rank && _.suit === card.suit) ? h('div.card.glow') : null;

  var shade = shouldShade ? h('div.card.shade') : null;

  return [
    glow,
    h('div.card.back'),
    renderCard(card),
    shade];
}

function renderMiddle(ctrl) {
  var content = [],
      flop,
      turn,
      river;
  var middle = ctrl.data.middle;
  var revealFlop = !ctrl.anims.hideFlop && middle.flop,
      revealTurn = !ctrl.anims.hideTurn && middle.turn,
      revealRiver = !ctrl.anims.hideRiver && middle.river;

  var highlightHand,
      hand,
      pot = ctrl.anims.shareProgress;

  if (pot) {
    hand = lens.showdownHand(ctrl, pot.involved[0]);
    highlightHand = hand && hand.hand;
  }

  flop = revealFlop?middle.flop.map((flop, i) => h('div.flop', renderMiddleCard(flop, highlightHand))):[1,2,3].map(_ => h('div.flop'));
  turn = h('div.turn', revealTurn?renderMiddleCard(middle.turn, highlightHand):[]);
  river = h('div.river', revealRiver?renderMiddleCard(middle.river, highlightHand):[]);

  content = [...content, ...flop, turn, river];

  return h('div.middle', content);
}

function renderHoles(ctrl) {
  var content = [];
  var sd = ctrl.data.showdown;

  var me = ctrl.data.pov.me;

  var highlightHand,
      hand,
      pot = ctrl.anims.shareProgress;

  if (pot) {
    hand = lens.showdownHand(ctrl, pot.involved[0]);
    highlightHand = hand && hand.hand;
  }

  if (sd) {
    content = [
      ...content, ...sd.hands
        .map((hand, i) => {
          if (!hand) return null;
          const { hole } = hand;
          var seatIndex = lens.handIndexes(ctrl)[i];
          if (me && seatIndex === 0) return null;
          return h('div.hole.' + numbers[seatIndex],
                   hole.map(hole =>
                     h('div', renderMiddleCard(hole, highlightHand))));
        })
    ];
  }

  if (me) {
    const hasFolded = !lens.isInvolved(ctrl, 0);

    const dealProgress = ctrl.anims.dealProgress;
    let hasDealt = !dealProgress || dealProgress[0] === 2;

    if (hasDealt) {
      content = [
        ...content, h('div.hole.me.' + numbers[0],
                      me.map(card =>
                        h('div', renderMiddleCard(card, highlightHand, hasFolded))))
      ];
    }
  }
  
  return content;
}

function renderShareHandValue(ctrl) {
  var pot = ctrl.anims.shareProgress;
  var content;
  if (pot) {
    var hand = lens.showdownHand(ctrl, pot.involved[0]);

    if (hand) {
      content = [h('div', hand.rank)];
    }
    
    return h('div.handvalue', content);
  }
  return null;
}

function renderCards(ctrl) {
  var content = [
    renderButton(ctrl),
    ...renderHands(ctrl),
    renderMiddle(ctrl),
    h('div.holes', renderHoles(ctrl)),
    renderShareHandValue(ctrl)
  ];
  return h('div.cards', content);
}

function renderTable(ctrl) {
  return [
    renderPots(ctrl),
    renderCards(ctrl),
    renderActions(ctrl),
    renderSeats(ctrl)
  ];
}

export default function(ctrl) {
  var wrapKlass = 'is2d';
  var tableKlass = (ctrl.data.seats === 5) ? 'five':'nine';
  return h('div.pg-wrap.' + wrapKlass, [
    h('pg-container', [
      h('pg-table.' + tableKlass, renderTable(ctrl))
    ])
  ]);
}
