export const rounds = ['predeal', 'preflop', 'flop', 'turn', 'river', 'showdown'];

export function seenRound(ctrl, round) {
  return rounds.indexOf(ctrl.data.round) >= rounds.indexOf(round);
};

export function nextRound(ctrl) {
  return rounds[(rounds.indexOf(ctrl.data.round) + 1) % rounds.length];
}

export function showdownHands(ctrl) {
  return ctrl.data.showdown.hands;
}

export function involved(ctrl) {
  return ctrl.data.involved;
}

export function seats(ctrl) {
  return ctrl.data.pov.seats;
}

export function recentActions(ctrl) {
  return ctrl.data.recentActs;
}

export function firstToAct(ctrl) {
  return ctrl.data.firstToAct;
}

export function seatIndexes(ctrl) {
  return seats(ctrl)
    .map((seat, i)=> ({ seat, i }))
    .reduce((acc, {seat, i}) => {
    if (seat != null) {
      acc.push(i);
    }
    return acc;
  }, []);
}

export function nextSeat(ctrl, from, i) {
  var indexes = seatIndexes(ctrl);
  var to = indexes[(indexes.indexOf(from) + i) % ctrl.data.players];
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
