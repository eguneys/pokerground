const suits = { d: 'diamonds', h: 'hearts', 'c': 'clubs', s: 'spades' };

const ranks = { 'A': 'ace', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', 'T': 'ten', 'J': 'jack', 'Q': 'queen', 'K': 'king' };

export function readCard(card) {
  return {
    rank: ranks[card[0]],
    suit: suits[card[1]]
  };
}

export function readCards(cards) {
  return cards.split(' ').map(readCard);
}

export function readMiddle(middle) {
  var res = {};
  if (middle.flop) {
    res.flop = readCards(middle.flop);
  }
  if (middle.turn) {
    res.turn = readCard(middle.turn);
  }
  if (middle.river) {
    res.river = readCard(middle.river);
  }

  return res;
}

export function readHands(hands) {
  return hands.map(hand => ({ 
    hole: readCards(hand.hole),
    rank: hand.rank,
    hand: readCards(hand.hand) 
  }));
}

const acts = { 'R': 'raise', 'C': 'call', 'H': 'check', 'F': 'fold', 'A': 'allin' };

const stackPattern = /(\d+)(b|B|s)?/;

const potPattern = /(\d+)\(([^\)]*)\)~(\d+)/;

const movePattern = /(R|C|A|H|F)(\d*)/;

export function readMove(uci) {
  return readAct(uci);
}

function readAct(act) {
  act = act.match(movePattern);
  return { act: acts[act[1]], amount: act[2] };
}

function readDeal(stacks, preflop) {
  const players = stacks.length;

  let button,
      blindsPosted;
  
  button = stacks.indexOf(stacks.find(stack =>
    stack.indexOf('b') !== -1));

  blindsPosted = !!stacks.find(stack =>
    stack.indexOf('B') !== -1);

  return {
    button,
    blindsPosted
  };
}

function readStack(stack) {
  stack = stack.match(stackPattern);

  return parseInt(stack[1]);
}

function readPots(pots) {
  pots = pots.match(potPattern);

  pots = pots[2].split(' ');

  pots = pots.reduce((acc, pot) => {
    if (pot === '.') return acc;
    return acc + parseInt(pot);
  }, 0);
  
  return pots;
}

function readBlinds(pots) {
  pots = pots.match(potPattern);
  return parseInt(pots[3]);
}

export function readPlay(play) {
  play = play.split('\n');
  const stackspot = play[0].split('!');

  const acts = play.slice(1).map(_ => _===''?[]:_.split(' ').map(readAct));

  const stacks = stackspot[0].split(' ').map(readStack);
  const pots = readPots(stackspot[1]);
  const blinds = readBlinds(stackspot[1]);

  const deal = readDeal(stackspot[0].split(' '));

  return {
    deal,
    stacks,
    blinds,
    pot: pots,
    acts
  };
}
