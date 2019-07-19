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

export function showdownHand(ctrl, index) {
  return showdownHands(ctrl)[handIndexes(ctrl).indexOf(index)];
}

export function involved(ctrl) {
  return ctrl.data.involved;
}

export function seats(ctrl) {
  return ctrl.data.pov.seats;
}

export function players(ctrl) {
  return handIndexes(ctrl).length;
}

export function setStack(ctrl, stack) {
  var handIndex = handIndexes(ctrl)
      .indexOf(toAct(ctrl));
  ctrl.data.play.stacks[handIndex] = stack;
}

export function stack(ctrl, idx) {
  const handIndex = handIndexes(ctrl).indexOf(idx);
  return ctrl.data.play.stacks[handIndex];
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
  return handIndexes(ctrl)[deal(ctrl).button];
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

export function handIndexes(ctrl) {
  return ctrl.data.pov.handIndexes;
}

function nextSeat(ctrl, fromSeat, i) {
  var fromI = handIndexes(ctrl).indexOf(fromSeat);
  var to = (fromI + i) % handIndexes(ctrl).length;
  return handIndexes(ctrl)[to];
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
       involved: handIndexes(ctrl),
       next: firstToAct(ctrl)
     });
}

export function toAct(ctrl) {
  return recentActionsWithIndex(ctrl).next;
}

export function takeLastActionsWithIndex(ctrl) {
  var recent = recentActionsWithIndex(ctrl).actions;

  return recent.reduce((acc, action) => {
    acc = acc.filter(_ => _.i !== action.i);

    acc.push(action);
    return acc;
  }, []);

}
