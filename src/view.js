import { h } from 'snabbdom';

import { numbers, numberFormat } from './util';
import { seats as getSeats, recentActions, firstToAct, nextSeat, takeLastActionsWithIndex } from './lens';
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
  var seats = getSeats(ctrl);

  var seatsKlass = (seats.length === 5) ? 'five':'nine';

  return h('div.seats.' + seatsKlass, seats.map((seat, i) => renderSeat(ctrl, seat, i)));
}

function renderAction(ctrl, type, klass, amount) {
  var content;
  amount = amount?numberFormat(amount) + ctrl.data.currency: null;
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
  return h('div.action.' + klass, {}, content);
}

function renderActions(ctrl) {
  var deal;
  const actionsKlass = (ctrl.data.seats === 5) ? 'five':'nine';
  var content = [];
  const lastActionsWithIndex = takeLastActionsWithIndex(ctrl);

  if (ctrl.data.round === 'preflop') {
    deal = ctrl.data.deal;
    var indexes = lastActionsWithIndex.map(_=>nextSeat(ctrl, firstToAct(ctrl), _.i));
    var containsBigBlind = indexes.some(_=>_===deal.bigBlind);
    var containsSmallBlind = indexes.some(_=>_===deal.smallBlind);
    if (!containsBigBlind) content.push(
      renderAction(ctrl, 'bigBlind', numbers[deal.bigBlind], deal.blinds));
    if (!containsSmallBlind)
      content.push(
        renderAction(ctrl, 'smallBlind', numbers[deal.smallBlind], deal.blinds / 2));
  }

  content = [...content,
             ...lastActionsWithIndex.slice(0, -1)
             .map(({ action, i }) =>
               renderAction(ctrl, action.act, numbers[nextSeat(ctrl, firstToAct(ctrl), i)], action.amount)),
             ...lastActionsWithIndex.slice(-1).map(({action, i}) =>
               renderAction(ctrl, action.act, numbers[nextSeat(ctrl, firstToAct(ctrl), i)] + '.last', action.amount)
             )];
  
  return h('div.actions.' + actionsKlass, content);
}

function renderButton(ctrl) {
  var klass = numbers[ctrl.data.button];
  
  return h('div.button.' + klass);
}

function renderCards(ctrl) {
  var content = [
    //renderShowdown(ctrl)
    renderButton(ctrl),
    // renderHands(ctrl)
  ];
  return h('div.cards', content);
}

function renderTable(ctrl) {
  return [
    renderCards(ctrl),
    renderActions(ctrl),
    renderSeats(ctrl)
  ];
}

export default function(ctrl) {
  return h('div.pg-wrap', [
    h('pg-container', [
      h('pg-table', renderTable(ctrl))
    ])
  ]);
}
