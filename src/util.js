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

export function translateDeal(seats, index) {
  var translateMapNine = [
  ];

  var translateMapFive = [
    [0, -400],
    [600, -300],
    [-600, -300],
    [-600, -300],
    [-600, -300]
  ];
  
  var translate = (seats === 5) ? translateMapFive[index]:translateMapNine[index];

  return `translateX(${translate[0]}%) translateY(${translate[1]}%)`;
}

export function translatePots(seats, index) {
  var translateMapNine = [
  ];

  var translateMapFive = [
    [-50, -440],
    [80, -300],
    [80, -300],
    [-180, -300],
    [-180, -300]
  ];
  
  var translate = (seats === 5) ? translateMapFive[index]:translateMapNine[index];

  return `translateX(${translate[0]}%) translateY(${translate[1]}%)`;
}
