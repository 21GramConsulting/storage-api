import { NamespacedStorage } from '../../main/NamespacedStorage';
import { SinonMock } from 'sinon';
import { assert } from 'chai';
import sinon = require('sinon');

describe(`NamespacedStorage`, () => {
  let stubStorage: Storage;
  let mockStorage: SinonMock;

  beforeEach(() => stubStorage = {
    length    : 0,
    clear     : () => undefined,
    key       : () => null,
    getItem   : () => null,
    removeItem: () => null,
    setItem   : () => undefined
  });
  beforeEach(() => mockStorage = sinon.mock(stubStorage));
  afterEach(() => mockStorage.verify());

  describe(`#setItem()`, () => {
    it(`should call encapsulated storage's setItem with the namespaced key.`, async () => {
      mockStorage
        .expects('setItem')
        .once()
        .withArgs('test.entry', 'hello');
      const unitUnderTest = NamespacedStorage.create(stubStorage, 'test');
      unitUnderTest.setItem('entry', 'hello');
    });
  });

  describe(`#getItem()`, () => {
    it(`should call encapsulated storage's getItem with the namespaced key.`, async () => {
      const testValue = 'test value';
      mockStorage
        .expects('getItem')
        .once()
        .withArgs('test.entry')
        .returns(testValue);

      const unitUnderTest = NamespacedStorage.create(stubStorage, 'test');
      assert.equal(testValue, unitUnderTest.getItem('entry'));
    });
  });

  describe(`#removeItem()`, () => {
    it(`should call encapsulated storage's removeItem with the namespaced key.`, async () => {
      mockStorage
        .expects('removeItem')
        .once()
        .withArgs('test.entry');
      const unitUnderTest = NamespacedStorage.create(stubStorage, 'test');
      unitUnderTest.removeItem('entry');
    });
  });

  describe(`#clear()`, () => {
    it(`should clear all of its namespaced records from the encapsulated storage.`, async () => {
      const testKeysToRemove = ['key', 'testKey', 'entry'];
      testKeysToRemove.forEach((key, index) => mockStorage
        .expects('removeItem')
        .withExactArgs(`test.${key}`)
        .onCall(index)
      );
      const unitUnderTest = NamespacedStorage.create(stubStorage, 'test');
      testKeysToRemove.forEach(key => unitUnderTest.setItem(key, 'test value'));
      unitUnderTest.clear();
    });
  });

  describe(`#length`, () => {
    it(`should return the number of unique keyed entries within the namespace.`, async () => {
      const unitUnderTest = NamespacedStorage.create(stubStorage, 'test');
      const expectedNumberOfEntries = 10;
      for (let i = 0; i < expectedNumberOfEntries; i++) {
        unitUnderTest.setItem(`test key ${i}`, `test value ${i}`);
      }
      for (let i = 0; i < expectedNumberOfEntries; i++) {
        unitUnderTest.setItem(`test key ${i}`, `test value ${i}`);
      }
      assert.equal(expectedNumberOfEntries, unitUnderTest.length);
    });
  });

  describe(`#key`, () => {
    it(`should return null if the provided key index isn't part of the namespace.`, async () => {
      const unitUnderTest = NamespacedStorage.create(stubStorage, 'test');
      assert.isNull(unitUnderTest.key(0));
    });
    it(`should return the key stored at the provided index.`, async () => {
      const unitUnderTest = NamespacedStorage.create(stubStorage, 'test');
      const testKey = 'test_key';
      unitUnderTest.setItem(testKey, 'test value');
      assert.equal(testKey, unitUnderTest.key(0));
    });
  });

});
