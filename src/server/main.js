
export function Server() {
  var game = Game.makeGame();

  this.get = () => {
    const pov = new Pov(game, 6);
    return jsonView(pov);
  };
}

function Game({
  round,
  blinds,
  button,
  currency,
  seats
}) {

  const actions = [];

  this.smallBlind = () => (button + 1) % seats.length;

  this.bigBlind = () => (this.smallBlind() + 1) % seats.length;

  this.firstToAct = () => (this.bigBlind() + 1) % seats.length;

  this.toAct = () => this.firstToAct() + actions.length;

  this.deal = () => ({
    blinds,
    button,
    smallBlind: this.smallBlind(),
    bigBlind: this.bigBlind(),
    firstToAct: this.firstToAct(),
    toAct: this.toAct()
  });
  this.round = () => { return round; };
  this.currency = () => { return currency; };
  this.seats = () => { return seats; };

}

Game.makeGame = () => {
  return new Game({
    round: 'predeal',
    blinds: 100,
    button: 0,
    currency: '$',
    seats: [
      null,
      null,
      null,
      null,
      null
    ]
  });
};

function Pov(game, seat = 1) {
  
  this.nbSeats = game.seats.length;

  this.seatRel = (seatRel) => {
    const seatAbs = (seat + seatRel) % this.nbSeats;
    return game.seats[seatAbs];
  };

  this.seatsRel = () => {
    var res = [];
    for (var i = 0; i < this.nbSeats; i++) {
      res.push(this.seatRel(i));
    }
    return res;
  };

  this.game = () => { return game; };
}

function jsonView(pov) {
  return {
    seats: pov.seatsRel
  };
}
