import { readPlay as fenReadPlay } from './fen';

export function configure(state, config) {
  merge(state, config);

  if (config.pov) {
    state.seats = config.pov.seats.length;
  }

  if (config.fen) {
    state.play = fenReadPlay(config.fen);
  }

}

export function merge(base, extend) {
  for (var key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) {
      merge(base[key], extend[key]);
    } else {
      base[key] = extend[key];
    }
  }
}

function isObject(o) {
  return typeof o === 'object';
}
