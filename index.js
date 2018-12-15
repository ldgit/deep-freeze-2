module.exports = function deepFreeze(object) {
  if (typeof object !== 'object' && typeof object !== 'function') {
    return object;
  }

  Object.freeze(object);
  Object.getOwnPropertyNames(object).forEach((propName) => {
    if (typeof object[propName] === 'function' && propName === 'constructor') {
      return;
    }

    deepFreeze(object[propName]);
  });

  return object;
};
