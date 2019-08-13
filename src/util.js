export function makeSerialPromise() {
  var lastPromise = Promise.resolve();
  
  return function(f) {
    lastPromise = lastPromise.then(() => {
      return new Promise(f);
    });
    return lastPromise;
  };
};

export const currencyFormat = function(n, currency) {
  return n + currency;
};

export const chipsFormat = function(n) {
  return numberFormat(n);
};

export const numberFormat = (function() {
  var formatter = false;
  return function(n) {
    if (formatter === false) formatter = (window.Intl && Intl.NumberFormat) ? new Intl.NumberFormat() : null;
    if (formatter === null) return n;
    return formatter.format(n);
  };
})();

export const numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];


export function posDeal(seats, index) {
  const posMapNine = [
    [30, 48],
    [33, 33],
    [38, 17],
    [60, 20],
    [64, 32],
    [62, 65],
    [54, 76],
    [44, 78],
    [35, 65]
  ];

  const posMapFive = [
  ];

  var pos = (seats === 5) ? posMapFive[index]:posMapNine[index];

  return {
    bottom: pos[0] + '%',
    left: pos[1] + '%'
  };
}
