
export function configure(state, config) {
  merge(state, config);

  if (config.pov) {
    state.seats = config.pov.seats.length;

    state.players = config.pov.seats.filter(_=>_!==null).length;
  }

  if (config.deal) {
    state.firstToAct = config.deal.firstToAct;
    state.button = config.deal.button;
  }

}

function merge(base, extend) {
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
