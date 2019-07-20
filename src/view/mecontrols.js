import { h } from 'snabbdom';

import { bind } from './util';

import * as icons from './icons';

import * as util from '../util';

import * as lens from '../lens';


function renderAction(ctrl, text, klass, icon) {
  return h('div.' + klass, [
    h('span', ctrl.trans(text)),
    icon,
  ]);
}

function renderActions(ctrl) {

  return h('div.actions', [
    renderAction(ctrl, 'fold', 'fold', icons.fold),
    renderAction(ctrl, 'check', 'check', icons.check),
    renderAction(ctrl, 'call', 'call', h('i', 'C')),
    renderAction(ctrl, 'raise', 'raise', icons.raise)
  ]);
}

export function render(ctrl) {
  return h('div.mecontrols', [
    renderActions(ctrl)
  ]);
}
