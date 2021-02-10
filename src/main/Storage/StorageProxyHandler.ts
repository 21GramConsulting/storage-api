/**
 * # Summary
 * Utility object used to implement the
 * [Indexable Behavior](https://www.typescriptlang.org/docs/handbook/interfaces.html#indexable-types)
 * of `Storage` implementations.
 *
 * # Description
 * It's primarily intended for internal Library use, however it's implemented in
 * a way to allow for use by Library users. **If possible**, at least submit a
 * ticket when you create custom `Storage` implementations so that maintainers
 * can learn more about developer use cases, and make the library better by
 * extending the Library's feature set.
 *
 * # Usage
 * ```typescript
 * const proxy: Storage = new Proxy(
 *  myCustomStorageImplementation,
 *  this.proxyHandler,
 * );
 * ```
 *
 * @version 1.0.0
 * @since   1.0.0
 * @see     [MDN Proxy Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
 * @see     [MDN Storage Interface](https://developer.mozilla.org/en-US/docs/Web/API/Storage)
 */
export class StorageProxyHandler implements ProxyHandler<Storage> {

  /**
   * Removes the item stored in `storage` under the provided `key`.
   * It enables for the `delete` operator's use on custom `Storage`
   * implementations when passed in a `Proxy`.
   * @param {Storage} storage
   * @param {PropertyKey} key
   * @return {boolean}
   * @version 1.0.0
   * @since   1.0.0
   */
  public deleteProperty(storage: Storage, key: PropertyKey): boolean {
    storage.removeItem(key.toString());
    return true;
  }

  /**
   * Returns the item stored in `storage` under the provided `key`.
   * It enables for the property accessors on custom `Storage` implementations
   * when passed in a `Proxy`.
   * @param {Storage} target
   * @param {PropertyKey} propertyKey
   * @return {unknown}
   * @version 1.0.0
   * @since   1.0.0
   */
  public get(target: Storage, propertyKey: PropertyKey): unknown {
    const property = propertyKey.toString();
    if (property in target) return target[property];
    return target.getItem(property);
  }

  /**
   * Returns a synthetic property descriptor for the value stored in `storage`
   * under the provided `key`. It enables for property descriptor accessors on
   * custom `Storage` implementations when passed in a `Proxy`.
   * when passed in a `Proxy`.
   * @param {Storage} storage
   * @param {PropertyKey} key
   * @return {PropertyDescriptor | undefined}
   * @version 1.0.0
   * @since   1.0.0
   */
  public getOwnPropertyDescriptor(
    storage: Storage,
    key: PropertyKey
  ): PropertyDescriptor | undefined {
    const value = storage.getItem(key.toString());
    return value === null
      ? undefined
      : { value, enumerable: true, configurable: true, writable: true };
  }

  /**
   * Tells whether there's a value stored in `storage` under the provided `key`.
   * It enables for presence checks on custom `Storage` implementations when
   * passed in a `Proxy`, for example: `"myKey" in myStorage ? "yay" : "nay"`
   * @param {Storage} storage
   * @param {PropertyKey} key
   * @return {boolean}
   * @version 1.0.0
   * @since   1.0.0
   */
  public has(storage: Storage, key: PropertyKey): boolean {
    return storage.getItem(key.toString()) !== null;
  }

  /**
   * Returns the keys present in `storage`.
   * It enables for `PropertyKey` retrievals on custom `Storage` implementations
   * when passed in a `Proxy`, for example: `for (key in myStorage) ...`
   * @param {Storage} storage
   * @return {Array<PropertyKey>}
   * @version 1.0.0
   * @since   1.0.0
   */
  public ownKeys(storage: Storage): Array<PropertyKey> {
    const ownKeys = [];
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (key === null) continue;
      ownKeys.push(key);
    }
    return ownKeys;
  }

  /**
   * Sets the provided `value` in `storage` under the provided `key`.
   * It enables for the property setters on custom `Storage` implementations
   * when passed in a `Proxy`.
   * @param {Storage} target
   * @param {PropertyKey} key
   * @param {unknown} value
   * @return {boolean}
   * @version 1.0.0
   * @since   1.0.0
   */
  public set(target: Storage, key: PropertyKey, value: unknown): boolean {
    const property = key.toString();
    if (property in target) {
      try {
        target[property] = value;
        return true;
      } catch (_) {
        return false;
      }
    }
    target.setItem(property, String(value));
    return true;
  }
}
