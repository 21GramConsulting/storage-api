import { assert } from 'chai';
import { StorageProxyHandler } from '../../../main/Storage/StorageProxyHandler';
import { SinonMock } from 'sinon';
import sinon = require('sinon');

describe(`StorageProxyHandler`, () => {
  let stubStorage: Storage;
  let mockStorage: SinonMock;
  let unitUnderTest: StorageProxyHandler;

  beforeEach(() => stubStorage = ({
    length    : 0,
    clear     : () => undefined,
    key       : () => null,
    getItem   : () => null,
    removeItem: () => null,
    setItem   : () => undefined,
  }));
  beforeEach(() => mockStorage = sinon.mock(stubStorage));
  beforeEach(() => unitUnderTest = new StorageProxyHandler());

  afterEach(() => mockStorage.verify());

  describe(`#has`, () => {
    it(`should return false, if the queried storage returns null for the provided key.`, async () => {
      assert.isFalse(unitUnderTest.has(stubStorage, 'test'));
    });
    it(`should return false, if the queried storage returns null for the provided key.`, async () => {
      mockStorage
        .expects('getItem')
        .once()
        .returns('test value');
      assert.isTrue(unitUnderTest.has(stubStorage, 'test'));
    });
  });

  describe(`#get`, () => {
    it(`should resolve the storage's functions.`, async () => {
      assert.strictEqual(unitUnderTest.get(stubStorage, 'length'), stubStorage.length);
      assert.strictEqual(unitUnderTest.get(stubStorage, 'clear'), stubStorage.clear);
      assert.strictEqual(unitUnderTest.get(stubStorage, 'key'), stubStorage.key);
      assert.strictEqual(unitUnderTest.get(stubStorage, 'getItem'), stubStorage.getItem);
      assert.strictEqual(unitUnderTest.get(stubStorage, 'removeItem'), stubStorage.removeItem);
      assert.strictEqual(unitUnderTest.get(stubStorage, 'setItem'), stubStorage.setItem);
    });
    it(`should resolve the storage's getItem results if property access is not an original member.`, async () => {
      const testValue = 'test value';
      mockStorage
        .expects('getItem')
        .once()
        .withArgs('testKey')
        .returns(testValue);
      assert.strictEqual(testValue, unitUnderTest.get(stubStorage, 'testKey'));
    });
  });

  describe(`#getOwnPropertyDescriptor`, () => {
    it(`should return undefined if the storage doesn't resolve a record.`, async () => {
      assert.isUndefined(
        unitUnderTest.getOwnPropertyDescriptor(stubStorage, 'testKey'),
      );
    });
    it(`should return the same descriptor config for all resolved records.`, async () => {
      const testValue = 'test value';
      const expectedDescriptor: PropertyDescriptor = {
        value       : testValue,
        enumerable  : true,
        configurable: true,
        writable    : true,
      };
      mockStorage
        .expects('getItem')
        .once()
        .withArgs('testKey')
        .returns(testValue);
      assert.deepEqual(
        expectedDescriptor,
        unitUnderTest.getOwnPropertyDescriptor(stubStorage, 'testKey'),
      );
    });
  });

  describe(`#ownKeys`, () => {
    it(`should return an empty array if the storage is empty.`, async () => {
      assert.isEmpty(unitUnderTest.ownKeys(stubStorage));
    });
    it(`should return an array with the keys resolved by the storage.`, async () => {
      const testKeys = ['key', 'testKey', 'whatever'];
      sinon.stub(stubStorage, 'length').get(() => testKeys.length);
      let expectation = mockStorage.expects('key').exactly(testKeys.length);
      testKeys.forEach((key, index) => expectation.onCall(index).returns(key));
      assert.deepEqual(testKeys, unitUnderTest.ownKeys(stubStorage));
    });
  });

  describe(`#deleteProperty`, () => {
    it(`should forward the intent to the storage's removeItem method.`, async () => {
      const testKey = 'testKey';
      mockStorage
        .expects('removeItem')
        .once()
        .withArgs(testKey);
      assert.isTrue(unitUnderTest.deleteProperty(stubStorage, testKey));
    });
  });

  describe(`#set`, () => {
    it(`should call setItem if the value we wish to set is not a member of the storage unit.`, async () => {
      const testKey = 'testKey';
      const testValue = 'test Value';
      mockStorage
        .expects('setItem')
        .once()
        .withArgs(testKey, testValue);
      assert.isTrue(unitUnderTest.set(stubStorage, testKey, testValue));
    });
    it(`should override the storage's member when it can.`, async () => {
      // very dumb example cognitively,
      // but good enough for programmatic test purposes
      assert.isTrue(unitUnderTest.set(stubStorage, 'length', 123));
      assert.equal(123, stubStorage.length);
    });
    it(`should return false when it can't override the storage's member.`, async () => {
      // very dumb example cognitively,
      // but good enough for programmatic test purposes
      sinon.stub(stubStorage, 'length').set(() => {
        throw new Error('Expected Error');
      });
      assert.isFalse(unitUnderTest.set(stubStorage, 'length', 123));
    });
  });
});
