import deepFreeze from '../index';

describe('deepFreeze', () => {
  it('should do nothing when given non object', () => {
    expect(deepFreeze()).toEqual(undefined);
    expect(deepFreeze('')).toEqual('');
    expect(deepFreeze(5)).toEqual(5);
    expect(deepFreeze(true)).toEqual(true);
    expect(deepFreeze(null)).toEqual(null);
  });

  it('should shallow freeze objects', () => {
    const anObject = { existingProp: 'just some prop' };

    deepFreeze(anObject);

    expect(addPropertyTo(anObject)).toThrow(TypeError);
    expect(addPropertyTo(anObject)).toThrow('object is not extensible');
    expect(changeExistingProperty(anObject, 'existingProp')).toThrow(TypeError);
    expect(changeExistingProperty(anObject, 'existingProp')).toThrow('Cannot assign to read only property');
  });

  it('should shallow freeze arrays', () => {
    const anArray = [4, 5];

    deepFreeze(anArray);

    expect(addElementToArray(anArray)).toThrow(TypeError);
    expect(addElementToArray(anArray)).toThrow('object is not extensible');
    expect(modifyFirstElementOf(anArray)).toThrow(TypeError);
    expect(modifyFirstElementOf(anArray)).toThrow('Cannot assign to read only property');
  });

  it('should freeze objects one level deep', () => {
    const anObject = {
      levelOne: { existingProp: 'just some prop' },
    };

    deepFreeze(anObject);

    expect(addPropertyTo(anObject.levelOne)).toThrow(TypeError);
    expect(addPropertyTo(anObject.levelOne)).toThrow('object is not extensible');
    expect(changeExistingProperty(anObject.levelOne, 'existingProp')).toThrow(TypeError);
    expect(changeExistingProperty(anObject.levelOne, 'existingProp')).toThrow('Cannot assign to read only property');
  });

  it('should freeze arrays one level deep', () => {
    const anArray = [[4, 5]];

    deepFreeze(anArray);

    expect(addElementToArray(anArray[0])).toThrow(TypeError);
    expect(addElementToArray(anArray[0])).toThrow('object is not extensible');
    expect(modifyFirstElementOf(anArray[0])).toThrow(TypeError);
    expect(modifyFirstElementOf(anArray[0])).toThrow('Cannot assign to read only property');
  });

  it('should freeze objects and arrays with null elements', () => {
    const anArray = [null];
    const anObject = { prop: null };

    deepFreeze(anArray);
    deepFreeze(anObject);

    expect(addElementToArray(anArray)).toThrow(TypeError);
    expect(modifyFirstElementOf(anArray)).toThrow(TypeError);
    expect(addPropertyTo(anObject)).toThrow(TypeError);
    expect(changeExistingProperty(anObject, 'prop')).toThrow(TypeError);
  });

  it('should freeze objects three levels deep', () => {
    const anObject = {
      levelOne: {
        levelTwo: {
          levelThree: { existingProp: 'just some prop' },
        },
      },
    };

    deepFreeze(anObject);

    expect(addPropertyTo(anObject.levelOne.levelTwo.levelThree)).toThrow(TypeError);
    expect(addPropertyTo(anObject.levelOne.levelTwo.levelThree)).toThrow('object is not extensible');
    expect(changeExistingProperty(anObject.levelOne.levelTwo.levelThree, 'existingProp')).toThrow(TypeError);
    expect(changeExistingProperty(anObject.levelOne.levelTwo.levelThree, 'existingProp')).toThrow('Cannot assign to read only property');
  });

  it('should freeze arrays three levels deep', () => {
    const anArray = [
      [
        [
          [4, 5],
        ],
      ],
    ];

    deepFreeze(anArray);

    expect(addElementToArray(anArray[0][0][0])).toThrow(TypeError);
    expect(addElementToArray(anArray[0][0][0])).toThrow('object is not extensible');
    expect(modifyFirstElementOf(anArray[0][0][0])).toThrow(TypeError);
    expect(modifyFirstElementOf(anArray[0][0][0])).toThrow('Cannot assign to read only property');
  });

  it('should ignore already frozen objects', () => {
    const anObject = {
      levelOne: { existingProp: 'just some prop' },
    };

    deepFreeze(anObject.levelOne);
    expect(changeExistingProperty(anObject.levelOne, 'existingProp')).toThrow(TypeError);
    expect(changeExistingProperty(anObject.levelOne, 'existingProp')).toThrow('Cannot assign to read only property');

    anObject.anotherLevelOneProp = { really: 'yes!' };
    deepFreeze(anObject);

    expect(changeExistingProperty(anObject.anotherLevelOneProp, 'really')).toThrow(TypeError);
    expect(changeExistingProperty(anObject.anotherLevelOneProp, 'really')).toThrow('Cannot assign to read only property');
  });

  it('repeated calls on same object should work', () => {
    const anObject = {
      levelOne: { existingProp: 'just some prop' },
    };

    deepFreeze(anObject);
    deepFreeze(anObject);
    deepFreeze(anObject);

    expect(addPropertyTo(anObject)).toThrow(TypeError);
    expect(addPropertyTo(anObject)).toThrow('object is not extensible');
  });

  it('should work on function properties', () => {
    const anObject = {
      aFunction() {},
    };

    deepFreeze(anObject);

    expect(addPropertyTo(anObject.aFunction)).toThrow(TypeError);
    expect(addPropertyTo(anObject.aFunction)).toThrow('object is not extensible');
  });

  it('should return the frozen object', () => {
    expect(deepFreeze({ a: 'b' })).toEqual({ a: 'b' });
  });

  it('should freeze objects with "constructor" property', () => {
    const anObject = { constructor: { a_prop: 'foo' } };

    deepFreeze(anObject);

    expect(changeExistingProperty(anObject.constructor, 'a_prop')).toThrow(TypeError);
    expect(changeExistingProperty(anObject.constructor, 'a_prop')).toThrow('Cannot assign to read only property');
  });

  it('should freeze all non frozen props of a partially frozen object', () => {
    const aPartiallyFrozenObject = {
      levelOne: {},
    };
    Object.freeze(aPartiallyFrozenObject); // levelOne not frozen
    aPartiallyFrozenObject.levelOne.a_prop = 'foo';
    const anObject = { aPartiallyFrozenObject };

    deepFreeze(anObject);

    expect(addPropertyTo(anObject.aPartiallyFrozenObject.levelOne)).toThrow(TypeError);
    expect(addPropertyTo(anObject.aPartiallyFrozenObject.levelOne)).toThrow('object is not extensible');
    expect(changeExistingProperty(anObject.aPartiallyFrozenObject.levelOne, 'a_prop')).toThrow(TypeError);
    expect(changeExistingProperty(anObject.aPartiallyFrozenObject.levelOne, 'a_prop')).toThrow('Cannot assign to read only property');
  });
});

function changeExistingProperty(object, propertyName) {
  return () => {
    // eslint-disable-next-line no-param-reassign
    object[propertyName] = 'a new value';
  };
}

function addPropertyTo(object) {
  return () => {
    // eslint-disable-next-line no-param-reassign
    object.thisPropertyDoesNotExist = 'foo';
  };
}

function addElementToArray(array) {
  return () => {
    array.push('an element');
  };
}

function modifyFirstElementOf(array) {
  return () => {
    // eslint-disable-next-line no-param-reassign
    array[0] = 'something new';
  };
}
