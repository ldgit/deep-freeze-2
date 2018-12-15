module.exports = function deepFreeze(object) {
  if (typeof object !== 'object' && typeof object !== 'function') {
    return object;
  }

  Object.freeze(object);
  Object.getOwnPropertyNames(object).forEach((propName) => {
    deepFreeze(object[propName]);
  });

  return object;
};
