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
    return [];
  }

  return ['fold', 'checkfold', 'check', 'callany'].map((_) =>
    renderMeControl(ctrl,
                    _,
                    icons[_](),
                    () => ctrl.clickCheck(_),
                    '.' + _ + (ctrl.checked(_) ? '.checked': ''))
  );
}

function renderMeControls(ctrl) {

  return h('div.mecontrols', [
    ...renderUnchecked(ctrl)
  ]);
}

export function render(ctrl) {
  return [
    renderMeControls(ctrl)
  ];
}
