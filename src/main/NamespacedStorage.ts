import { StorageProxyHandler } from './Storage/StorageProxyHandler';

/**
 * # Summary
 * A utility unit designed to encapsulate any `Storage` implementation.
 *
 * # Structure
 *
 * <uml>
 *   class     NamespacedStorage {
 *     +length: number
 *     +clear(): void
 *     +getItem(key:string): string|null
 *     +key(inex: number): string | null
 *     +removeItem(key: string): void
 *     +setItem(key: string, value: string): void
 *   }
 *   interface Storage {
 *     +length: number
 *     +clear(): void
 *     +getItem(key:string): string|null
 *     +key(inex: number): string | null
 *     +removeItem(key: string): void
 *     +setItem(key: string, value: string): void
 *   }
 *   Storage     <|-----     NamespacedStorage : Implements
 *   Storage "1"  o----- "1" NamespacedStorage : Subdivides
 * </uml>
 *
 * # Description
 * Designed and implemented to be in full, drop-in replacement compatibility with the native `Storage` API both
 * interface and behavior-wise, it empowers developers to create namespaced `Storage` scopes.
 * It allows you to subdivide `Storage` implementations into smaller groups of `Storage` units with reduced focus to
 * their smaller scope.
 *
 * Due to its dependency on [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy),
 * instances may only be created via the factory method `#create`:
 * ```typescript
 * const storage: Storage = NamespacedStorage.create(window.localStorage, 'example');
 * const nestedStorage: Storage = NamespacedStorage.create(storage, 'nested');
 * const deepestStorage: Storage = NamespacedStorage.create(storage, 'deepest');
 * ```
 *
 * # Important Tip
 * Despite the contemporary trends with TypeScript on the UI or the Back-End, please, make sure to always depend on
 * interfaces instead of implementations. It will help you keep your software as dynamic and flexible as it can be.
 *
 * Software is meant to be soft. Keep it that way.
 *
 * # Perks
 * ## Get & Set Items (AKA: CRUD)
 * As per the official [`Storage` API](https://developer.mozilla.org/en-US/docs/Web/API/Storage), it allows for IO
 * operations both via methods and properties. Take the following example:
 * ### The following lines of code all set the same value to the same storage unit
 * ```typescript
 * storage.cool    = 'It\'s awesome!';
 * storage['cool'] = 'It\'s awesome!';
 * localStorage['example.cool'] = 'It\'s awesome!';
 * storage.setItem('cool', 'It\'s awesome!');
 * localStorage.setItem('example.cool', 'It\'s awesome!');
 * ```
 * ### The following lines of code all return the same value written to the same storage unit
 * ```typescript
 * console.info(storage.getItem('cool'));
 * console.info(storage.cool);
 * console.info(storage['cool']);
 * console.info(localStorage.getItem('example.cool'));
 * console.info(localStorage['example.cool']);
 * ```
 * ### A more practical example for property accessors:
 * ```typescript
 * type TodoItem = {
 *   summary?: string,
 *   priority?: number
 * }
 *
 * function increasePriority(todoItem: TodoItem): void {
 *   todoItem.priority = (todoItem.priority ?? 0) + 1;
 * }
 *
 * const todos: Storage = NamespacedStorage.create(storage, 'todoItems');
 * const todo: Storage & TodoItem = NamespacedStorage.create(todos, 'item1');
 * increasePriority(todo);
 * increasePriority(todo);
 * increasePriority(todo);
 * // returns String("3")
 * console.info(localStorage.getItem('example.todoItem.item1.priority'));
 * ```
 *
 * ##  Scope-Reduced interactions
 * A namespaced storage will only execute its methods within its namespace. This implies, that the keys which belong a
 * specific namespace are strongly connected to the given instance. When running `clear`, `key`, or getting `length`,
 * it behaves as expected: all operations & information is restricted to the namespace only.
 *
 * @version 1.0.0
 * @since   1.0.0
 * @see     [MDN Proxy Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
 * @see     [MDN Storage Interface](https://developer.mozilla.org/en-US/docs/Web/API/Storage)
 */
export class NamespacedStorage implements Storage {
  [name: string]: unknown;

  private static namespaceSeparator: string = '.';
  private static proxyHandler: ProxyHandler<Storage> = new StorageProxyHandler();
  private keys: Array<string>;
  private readonly namespace: string;
  private readonly storage: Storage;


  private constructor(storage: Storage, namespace: string, keys: Array<string>) {
    this.storage = storage;
    this.namespace = namespace;
    this.keys = keys;
  }

  /**
   * Tells the number of entries within the given `NamespacedStorage`.
   * @return {number} Number of entries within the namespace.
   * @version 1.0.0
   * @since   1.0.0
   */
  public get length(): number {
    return this.keys.length;
  }

  /**
   * Creates a new `NamespacedStorage` instance with the appropriate `Proxy` handler in place.
   * @param {Storage}  storage   The `Storage` object to encapsulate. Any `Storage` implementation.
   * @param {string}   namespace The string to use as a namespace for the newly created `NamespacedStorage`.
   * @return {Storage}           The newly created namespaced storage object.
   * @version 1.0.0
   * @since   1.0.0
   */
  public static create(storage: Storage, namespace: string): Storage {
    let keyIndex: number = storage.length;
    const keys: Array<string> = [];
    while (keyIndex--) {
      const key: string | null = storage.key(keyIndex);
      if (!key) continue;
      if (key.startsWith(`${namespace}.`)) keys.push(key);
    }
    return new Proxy(
      new NamespacedStorage(storage, namespace, keys),
      this.proxyHandler,
    );
  }

  /**
   * Removes all storage entries keyed to belong to the current `NamespacedStorage`.
   * @version 1.0.0
   * @since   1.0.0
   */
  public clear(): void {
    this.keys.forEach(key => this.storage.removeItem(key));
    this.keys = [];
  }

  /**
   * Returns the queried entry within the encapsulated namespace.
   * @param {string}
   * @return {string | null}
   * @version 1.0.0
   * @since   1.0.0
   */
  public getItem(key: string): string | null {
    return this.storage.getItem(this.packNamespacedKey(key));
  }

  /**
   * Returns the `index`th key encapsulated by the `NamespacedStorage`.
   * @param {number} index
   * @return {string | null}
   * @version 1.0.0
   * @since   1.0.0
   */
  public key(index: number): string | null {
    return index in this.keys
      ? this.unpackNamespacedKey(this.keys[index])
      : null;
  }

  /**
   * Removes the item stored under the given `key` within the encapsulated namespace.
   * @param {string} key
   * @version 1.0.0
   * @since   1.0.0
   */
  public removeItem(key: string): void {
    const namespacedKey = this.packNamespacedKey(key);
    this.storage.removeItem(namespacedKey);
    this.keys = this.keys.filter(key => key !== namespacedKey);
  }

  /**
   * Sets the `value` under the given `key` within the encapsulated namespace.
   * @param {string} key
   * @param {string} value
   * @version 1.0.0
   * @since   1.0.0
   */
  public setItem(key: string, value: string): void {
    const namespacedKey = this.packNamespacedKey(key);
    this.storage.setItem(namespacedKey, value);
    if (!this.keys.includes(namespacedKey)) this.keys.push(namespacedKey);
  }

  private unpackNamespacedKey(key: string): string {
    return key.replace(
      new RegExp(`^${this.namespace}\\${NamespacedStorage.namespaceSeparator}`),
      '',
    );
  }

  private packNamespacedKey(key: string): string {
    return [this.namespace, key].join(NamespacedStorage.namespaceSeparator);
  }

}

