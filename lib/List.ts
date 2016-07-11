import * as Immutable from 'immutable';
import { Emitter } from './Emitter';

const emptySet = Immutable.Set<any>();
const emptyList = Immutable.List<any>();
const emptyMap = Immutable.Map<any, any>();

export class List<K, V> extends Emitter<Array<V>> {

  private _ref: kebakaran.IRef<Array<K>>;
  private _createChild: (key: K) => kebakaran.IRef<V>;
  private _unknownKeys: Immutable.Set<K> = emptySet;
  private _keys: Immutable.List<K> = emptyList;
  private _values: Immutable.Map<K, V> = emptyMap;
  private _childListeners: Immutable.Map<K, (value: V) => void> = emptyMap;
  private _childRefs: Immutable.Map<K, kebakaran.IRef<V>> = emptyMap;
  private _hasKeys: boolean = false;
  private _data: Array<V> = undefined;

  constructor(ref: kebakaran.IRef<Array<K>>, createChild: (key: K) => kebakaran.IRef<V>) {
    super();
    this._ref = ref;
    this._createChild = createChild;
  }

  private onRefValue(value: Array<K>) {
    const prevKeySet = Immutable.Set(this._keys);

    this._keys = Immutable.List(value);
    this._hasKeys = true;

    const keySet: Immutable.Set<K> = Immutable.Set(value);

    const newKeys: Immutable.Set<K> = keySet.subtract(prevKeySet);
    const oldKeys: Immutable.Set<K> = prevKeySet.subtract(keySet);

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

    this.tryEmit();
  }

  private onChildValue(key: K, value: V) {
    this._values = this._values.set(key, value);
    this._unknownKeys = this._unknownKeys.remove(key);

    this.tryEmit();
  }

  protected tryEmit() {
    if (this.hasData()) {
      this._data = [];
      this._keys.forEach((key: K) => {
        this._data.push(this._values.get(key));
      });
      this.emit();
    }
  }

  protected getData(): Array<V> {
    return this._data;
  }

  protected hasData(): boolean {
    return this._hasKeys && this._unknownKeys.size == 0;
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
    this._unknownKeys = emptySet;
    this._values = emptyMap;
    this._data = undefined;
    this._hasKeys = false;
  }

}