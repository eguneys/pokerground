export const rounds = ['predeal', 'preflop', 'flop', 'turn', 'river', 'showdown'];

export function seenRound(ctrl, r) {
  return rounds.indexOf(round(ctrl)) >= rounds.indexOf(r);
};

export function round(ctrl) {
  return rounds[acts(ctrl).length];
}

export function preflop(ctrl) {
  return round(ctrl) === 'preflop';
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

export function stack(ctrl, idx) {
  return ctrl.data.play.stacks[idx];
}

export function acts(ctrl) {
  return ctrl.data.play.acts;
}

export function recentActions(ctrl) {
  return ctrl.data.play.acts[0];
}

export function blinds(ctrl) {
  return ctrl.data.play.blinds;
}

export function deal(ctrl) {
  return ctrl.data.play.deal;
}

export function button(ctrl) {
  return deal(ctrl).button;
}

export function smallBlind(ctrl) {
  return nextSeat(ctrl, button(ctrl), 1);
}

export function bigBlind(ctrl) {
  return nextSeat(ctrl, smallBlind(ctrl), 1);
}

function firstToAct(ctrl) {
  let firstToActOnPreflop = nextSeat(ctrl, bigBlind(ctrl), 1),
      firstToActOnFlop = nextSeat(ctrl, button(ctrl), 1);

  return preflop(ctrl) ? firstToActOnPreflop : firstToActOnFlop;
}

export function toSeatIndex(ctrl, index) {
  return seats(ctrl).indexOf(seats(ctrl).find(seat => seat && seat.idx === index));
}

export function seatIndexes(ctrl) {
  return seats(ctrl).reduce((acc, seat) => {
    if (seat != null) {
      acc.push(seat.idx);
    }
    return acc;
  }, []);
}

export function nextSeat(ctrl, from, i) {
  var indexes = seatIndexes(ctrl);
  var to = indexes[(indexes.indexOf(from) + i) % indexes.length];

  return to;
}

export function recentActionsWithIndex(ctrl) {
  function nextIndex(involved, i) {
    return involved[(involved.indexOf(i) + 1) % involved.length];
  }

  return recentActions(ctrl).reduce((acc, action) => {
    acc.actions.push({ action, i: acc.next });

    let involved = acc.involved;
    if (action.act === 'fold' || action.act === 'allin') {
      involved = involved.filter(_ => _!==acc.next);
    }
    return {
      actions: acc.actions,
      involved,
      next: nextIndex(acc.involved, acc.next)
    };
  }, { actions: [],
       involved: seatIndexes(ctrl),
       next: firstToAct(ctrl)
     });
}

export function toAct(ctrl) {
  return recentActionsWithIndex(ctrl).next;
}

export function takeLastActionsWithIndex(ctrl) {
  var recent = recentActionsWithIndex(ctrl).actions;
  var players = ctrl.data.players;

  return recent.reduce((acc, action) => {
    acc = acc.filter(_ => _.i !== action.i);

    acc.push(action);
    return acc;
  }, []);

}
