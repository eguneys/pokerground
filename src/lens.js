export function seats(ctrl) {
  return ctrl.data.pov.seats;
}

export function recentActions(ctrl) {
  return ctrl.data.recentActs;
}

export function firstToAct(ctrl) {
  return ctrl.data.firstToAct;
}

export function nextSeat(ctrl, from, i) {
  var to = from;
  var ss = seats(ctrl);
  while (i > 0) {
    i--;
    do {
      to = (to + 1) % ctrl.data.seats;
    } while (ss[to] === null);
  }
  return to;
}

export function toAct(ctrl) {
  return nextSeat(ctrl, ctrl.data.firstToAct, recentActions(ctrl).length);
}

export function takeLastActionsWithIndex(ctrl) {
  var recent = recentActions(ctrl);
  var players = ctrl.data.players;

  return recent
    .map((r, i) => ({ action: r, i }))
    .slice(-players);
}
