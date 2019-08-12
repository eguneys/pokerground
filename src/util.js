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

  const dealX = 0,
        dealY = 600;

  const translateMapNine = [
    [dealX, -dealY],
    [dealX + 500, -dealY-10],
    [dealX + 600, -dealY-300],
    [900, 560],
    [660, 222],
    [-760, 82],
    [-940, 650],
    [-140, -1050],
    [dealX - 460, -dealY-100]
  ];

  const translateMapFive = [
    [dealX, -dealY],
    [dealX + 120, -dealY-100],
    [dealX + 500, 220],
    [dealX - 520, 120],
    [dealX - 20, -dealY-100]
  ];
  
  var translate = (seats === 5) ? translateMapFive[index]:translateMapNine[index];

  return `translateX(${translate[0]}%) translateY(${translate[1]}%)`;
}

export function translatePots(seats, index, reverse) {
  var translateMapNine = [
    [0, -425],
    [62, -425],
    [100, -350],
    [100, -60],
    [52, 56],
    [-52, 56],
    [-100, -60],
    [-100, -350],
    [-62, -425]
  ];

  const dealX = 0,
        dealY = 400;

  var translateMapFive = [
    [dealX + 40, -dealY-180],
    [dealX + 140, -dealY+10],
    [dealX + 130, dealY-400],
    [dealX - 60, dealY-400],
    [dealX - 70, -dealY+10]
  ];

  var multiply = reverse ? -1.5 : 1;
  
  var translate = (seats === 5) ? translateMapFive[index]:translateMapNine[index];

  return `translateX(${translate[0] * multiply * Math.abs(multiply)}%) translateY(${translate[1] * multiply}%)`;
}
