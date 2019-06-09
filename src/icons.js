import { h } from 'snabbdom';

export function icon(name, opts) {
  return h('i.icon.ion-md-'+name, opts);
}

export const sit = icon('arrow-round-down');

export const raise = icon('arrow-dropup');

export const fold = icon('close');

export const check = icon('checkmark');

export const chip = icon('help-buoy');
