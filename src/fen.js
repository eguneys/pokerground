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
  var res = {};
  Object.keys(hands).forEach(key => {
    var hand = hands[key];
    res[key] = { hole: readCards(hand.hole), rank: hand.rank, value: readCards(hand.value) };
  });
  return res;
}