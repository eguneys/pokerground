import { h } from 'snabbdom';

import { numbers, numberFormat, chipsFormat, currencyFormat } from './util';
import * as util from './util';

import * as lens from './lens';
import * as icons from './icons';

function renderSeat(ctrl, seat, index) {
  return (seat === null) ?
    h('div.seat.empty.'+numbers[index], [
      icons.sit
    ]) :
    h('div.seat.' + numbers[index], [
      h('div.timer', [
        h('svg', { attrs: { viewBox: '0 0 40 40' } }, [
          h('circle.border', {
            attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
          }),
          h('circle.bar', {
            attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
          })
        ])
      ]),
      h('img', { attrs: { src: seat.img } }),
      h('span.stack', (seat.stack === 0) ? ctrl.trans('allin') : numberFormat(seat.stack) + ctrl.data.currency)
    ]);
}

function renderSeats(ctrl) {
  var seats = lens.seats(ctrl);

  return h('div.seats', seats.map((seat, i) => renderSeat(ctrl, seat, i)));
}

const actionStyle = (ctrl, index) => ({
  transition: 'transform .3s, opacity .5s',
  remove: {
    transform: util.translatePots(ctrl.data.seats, index),
    opacity: '0.2'
  }
});

function renderAction(ctrl, type, index, klass, amount) {
  var content;
  amount = amount?numberFormat(amount) + ctrl.data.currency: undefined;
  klass = '.' + numbers[index] + klass;
  switch (type) {
  case 'bigBlind':
    content = h('div.big-blind', [
      h('i', 'B'),
      h('span', amount)]);
    break;
  case 'smallBlind':
    content = h('div.small-blind', [
      h('i', 'B'),
      h('span', amount)]);
    break;
  case 'raise':
    content = h('div.raise', [
      icons.raise,
      h('span', amount)]);
    break;
  case 'allin':
    content = h('div.allin', [
      icons.raise,
      h('span', amount)]);    
    break;
  case 'call':
    content = h('div.call', [
      h('i', 'C'),
      h('span', amount)]);
    break;
  case 'fold':
    content = h('div.fold', [
      icons.fold,
      amount ? h('span', amount): null
    ]);
    break;
  case 'check':
    content = h('div.check', icons.check);
    break;
  }
  return h('div.action.' + klass, {
    style: (ctrl.collectPots && type !== 'check') ? actionStyle(ctrl, index): ''
  }, content);
}

function renderActions(ctrl) {
  var deal;
  const actionsKlass = '';
  var content = [];
  const lastActionsWithIndex = lens.takeLastActionsWithIndex(ctrl);

  if (ctrl.data.round === 'preflop') {
    deal = ctrl.data.deal;
    var indexes = lastActionsWithIndex.map(_=>lens.nextSeat(ctrl, lens.firstToAct(ctrl), _.i));
    var containsBigBlind = indexes.some(_=>_===deal.bigBlind);
    var containsSmallBlind = indexes.some(_=>_===deal.smallBlind);
    if (!containsBigBlind) content.push(
      renderAction(ctrl, 'bigBlind', deal.bigBlind, '', deal.blinds));
    if (!containsSmallBlind)
      content.push(
        renderAction(ctrl, 'smallBlind', deal.smallBlind, '', deal.blinds / 2));
  }

  content = [...content,
             ...lastActionsWithIndex.slice(0, -1)
             .map(({ action, i }) =>
               renderAction(ctrl, action.act, lens.nextSeat(ctrl, lens.firstToAct(ctrl), i), '', action.amount)),
             ...lastActionsWithIndex.slice(-1).map(({action, i}) =>
               renderAction(ctrl, action.act, lens.nextSeat(ctrl, lens.firstToAct(ctrl), i), '.last', action.amount)
             )];
  
  return h('div.actions.' + actionsKlass, content);
}

function renderPots(ctrl) {
  const potShareStyle = (ctrl, index) => ({
    transition: 'transform .3s, opacity .3s',
    delayed: {
      transform: util.translatePots(ctrl.data.seats, index, true)
    }
  });

  var amount = ctrl.data.pot;
  
  var sidePot = ctrl.shareProgress;

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
  var klass = numbers[ctrl.data.button];
  
  return h('div.button.' + klass, 'D');
}

const dealRotatingStyle = (() => {

  var rotations = {};

  return (ctrl, index, hand) => {
    if (!rotations[index+" "+hand]) {
      rotations[index+" "+hand] = (hand==2)?Math.random() * 30: Math.random() * 10;
    }
    var rotation = rotations[index+" "+hand];

    return dealBackStyle(ctrl, index, rotation);
  };
})();

const dealBackStyle = (ctrl, index, rotation) => ({
  transform: util.translateDeal(ctrl.data.seats, index) + ' rotate(0deg)',
  transition: 'transform .3s, opacity .3s',
  delayed: {
    transform: `translateX(0) translateY(0) rotate(${rotation}deg)`
  },
  remove: {
    transform: util.translateDeal(ctrl.data.seats, index),
    opacity: '0.2'
  }
});



function renderHands(ctrl) {
  var content;

  var ins = lens.involved(ctrl);

  content = [
    h('div.hand.dealer', [
      h('div.card.back'),
      h('div.card.back'),
      h('div.card.back')
    ]),
    ...ins.map(index => {
      return h('div.hand.' + numbers[index], {}, [
        (ctrl.dealProgress[index]>=1)?h('div.card.back', {
          style: dealRotatingStyle(ctrl, index, 1)
        }): null,
        (ctrl.dealProgress[index]==2)?h('div.card.back', {
          style: dealRotatingStyle(ctrl, index, 2)
        }): null
      ]);
    })
  ];

  return content;
}

function renderCard(card) {
  return h('div.card.' + card.rank + '.' + card.suit);
}

function renderMiddleCard(card) {
  return [
    h('div.card.back'),
    renderCard(card)];
}

function renderMiddle(ctrl) {
  var content = [],
      flop,
      turn,
      river;
  var middle = ctrl.data.middle;

  var revealFlop = !ctrl.hideFlop && middle.flop,
      revealTurn = !ctrl.hideTurn && middle.turn,
      revealRiver = !ctrl.hideRiver && middle.river;

  flop = revealFlop?middle.flop.map((flop, i) => h('div.flop', renderMiddleCard(flop))):[1,2,3].map(_ => h('div.flop'));
  turn = h('div.turn', revealTurn?renderMiddleCard(middle.turn):[]);
  river = h('div.river', revealRiver?renderMiddleCard(middle.river):[]);

  content = [...content, ...flop, turn, river];
  
  return h('div.middle', content);
}

function renderHoles(ctrl) {
  var content = [];
  var sd = ctrl.data.showdown;

  if (sd) {
    content = [
      ...content, ...Object.keys(sd.hands).map(index => {
        var { hole } = sd.hands[index];
      
        return h('div.hole.' + numbers[index],
                 hole.map(hole =>
                   h('div', renderMiddleCard(hole))));
      })
    ];
  }
  
  return content;
}

function renderShareHandValue(ctrl) {
  var pot = ctrl.shareProgress;
  var content;
  if (pot) {
    var index = pot.involved[0];
    var hand = lens.showdownHands(ctrl)[index];

    content = [h('div', hand.rank)];
    
    return h('div.handvalue', content);
  }
  return null;
}

function renderCards(ctrl) {
  var content = [
    renderButton(ctrl),
    ...renderHands(ctrl),
    renderMiddle(ctrl),
    ...renderHoles(ctrl),
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
