import { h } from 'snabbdom';

import { bind } from './util';

import * as icons from './icons';

import * as util from '../util';

import * as lens from '../lens';


function renderMeControl(ctrl, text, icon, onClick, klass = '') {
  return h('div' + klass, {
    hook: bind('click', onClick)
  }, [
    h('span', ctrl.trans(text)),
    icon,
  ]);
}

function renderUnchecked(ctrl) {

  if (!lens.mePlaying(ctrl) || lens.meTurn(ctrl)) {
    return null;
  }

  const content = ['fold', 'checkfold', 'check', 'callany'].map((_) =>
    renderMeControl(ctrl,
                    _,
                    icons[_](),
                    () => ctrl.clickCheck(_),
                    '.' + _ + (ctrl.checked(_) ? '.checked': ''))
  );

  return h('div.mecontrols', content);
}

function renderChecked(ctrl) {
  if (!lens.mePlaying(ctrl) || !lens.meTurn(ctrl)) {
    return null;
  }

  const content = ['fold', 'check', 'raise'].map((_) =>
    renderMeControl(ctrl,
                    _,
                    icons[_](),
                    () => ctrl.clickChecked(_),
                    '.' + _ + '.checked')
  );

  return h('div.mecontrols', content);
}

function renderRaise(ctrl) {
  if (!lens.mePlaying(ctrl) || !lens.meTurn(ctrl)) {
    return null;
  }

  const raiseCtrl = ctrl.raiseCtrl,
        currency = ctrl.data.currency;

  return h('div.raisecontrols', [
    h('div.label', util.currencyFormat(raiseCtrl.value, currency)),
    h('div.slider', [
      h('i.btn', {
        hook: bind('click', raiseCtrl.removeBlind ) }, icons.minus()),
      h('input', { 
        attrs: { type: 'range', step: lens.blinds(ctrl), min: lens.minRaise(ctrl), max: lens.maxRaise(ctrl), value: raiseCtrl.value },
        hook: {
          ...bind('input', (e) => {
            const value = parseInt(e.target.value);
            raiseCtrl.set(value);
          }),
          postpatch: (_, vnode) => {
            vnode.elm.dispatchEvent(new Event('change'));
          }
        }
      }),
      h('i.btn', {
        hook: bind('click', raiseCtrl.addBlind)
      },
        icons.plus())
    ]),
    h('div.quick', [
      h('span.btn', { hook: bind('click', raiseCtrl.min) }, ctrl.trans('min')),
      h('span.btn', { hook: bind('click', raiseCtrl.half) }, '1/2'),
      h('span.btn', { hook: bind('click', raiseCtrl.threeQuarters) }, '3/4'),
      h('span.btn', { hook: bind('click', raiseCtrl.pot) }, ctrl.trans('pot'))
    ])
  ]);
}

export function render(ctrl) {

  return h('div.hud', [
    renderRaise(ctrl),
    renderUnchecked(ctrl),
    renderChecked(ctrl),
  ]);
}
