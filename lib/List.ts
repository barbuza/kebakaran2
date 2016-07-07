import * as Immutable from 'immutable';
import { Emitter } from './Emitter';

const emptySet = Immutable.Set<any>();
const emptyList = Immutable.List<any>();
const emptyMap = Immutable.Map<any, any>();

export class List<K, V> extends Emitter<Array<V>> {

  private _ref: kebakaran.IRef<Array<K>>;
  private _createChild: (key: K) => kebakaran.IRef<V>;
  private _unknownKeys: Immutable.Set<K>;
  private _keys: Immutable.List<K> = emptyList;
  private _values: Immutable.Map<K, V> = emptyMap;
  private _childListeners: Immutable.Map<K, (value: V) => void> = emptyMap;
  private _childRefs: Immutable.Map<K, kebakaran.IRef<V>> = emptyMap;

  constructor(ref: kebakaran.IRef<Array<K>>, createChild: (key: K) => kebakaran.IRef<V>) {
    super();
    this._ref = ref;
    this._createChild = createChild;
  }

  private onRefValue(value: Array<K>) {
    this._keys = Immutable.List(value);
    const keySet: Immutable.Set<K> = Immutable.Set(value);

    const newKeys: Immutable.Set<K> = Immutable.Set(keySet.keySeq()).subtract(this._childListeners.keySeq());
    const oldKeys: Immutable.Set<K> = Immutable.Set(this._childListeners.keySeq()).subtract(keySet.keySeq());

    if (!this._unknownKeys) {
      this._unknownKeys = emptySet;
    }
    this._unknownKeys = Immutable.Set<K>(this._unknownKeys.concat(newKeys)).subtract(oldKeys);

    this._childListeners = this._childListeners.withMutations((mutableListeners: Immutable.Map<K, (value: V) => void>) => {
      this._childRefs = this._childRefs.withMutations((mutableChildRefs: Immutable.Map<K, kebakaran.IRef<V>>) => {

        newKeys.forEach((key: K) => {
          const child = this._createChild(key);
          const listener = this.onChildValue.bind(this, key);
          mutableListeners.set(key, listener);
          mutableChildRefs.set(key, child);
          child.on('value', listener);
        });

        oldKeys.forEach((key: K) => {
          const child = mutableChildRefs.get(key);
          const listener = mutableListeners.get(key);
          child.off('value', listener);
          mutableListeners.remove(key);
          mutableChildRefs.remove(key);
          this._values = this._values.remove(key);
        });

      });
    });

    if (this._unknownKeys.size === 0) {
      this.emit();
    }
  }

  private onChildValue(key: K, value: V) {
    this._values = this._values.set(key, value);
    this._unknownKeys = this._unknownKeys.remove(key);

    if (this._unknownKeys.size === 0) {
      this.emit();
    }
  }

  protected getData(): Array<V> {
    const result: Array<V> = [];
    this._keys.forEach((key: K) => {
      result.push(this._values.get(key));
    });
    return result;
  }

  protected hasData(): boolean {
    return this._unknownKeys && this._unknownKeys.size == 0
  }

  protected subscribe(): void {
    this._ref.on('value', this.onRefValue, this);
  }

  protected close(): void {
    this._ref.off('value', this.onRefValue, this);
    this._childListeners.forEach((listener: (value: V) => void, key: K) => {
      this._childRefs.get(key).off('value', listener);
    });
    this._childListeners = emptyMap;
    this._childRefs = emptyMap;
    this._keys = emptyList;
    delete this._unknownKeys;
    this._values = emptyMap;
  }

}