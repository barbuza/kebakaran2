import * as Immutable from 'immutable';

import { Emitter } from './Emitter';
import { unwrapSnapshot } from './unwrapSnapshot';

const emptySet = Immutable.Set<any>();
const emptyList = Immutable.List<any>();
const emptyMap = Immutable.Map<any, any>();

export class List<K, V> extends Emitter<Array<V>> {

  private ref: kebakaran.IRef<Array<K>>;
  private createChild: (key: K) => kebakaran.IRef<V>;
  private unknownKeys: Immutable.Set<K>;
  private keys: Immutable.List<K> = emptyList;
  private values: Immutable.Map<K, V> = emptyMap;
  private childListeners: Immutable.Map<K, (value: V) => void> = emptyMap;
  private childRefs: Immutable.Map<K, kebakaran.IRef<V>> = emptyMap;

  constructor(ref: kebakaran.IRef<Array<K>>, createChild: (key: K) => kebakaran.IRef<V>) {
    super();
    this.ref = ref;
    this.createChild = createChild;
  }

  private onRefValue(snapshot: kebakaran.ISnapshot<Array<K>> | Array<K>) {
    const value = unwrapSnapshot(snapshot);

    this.keys = Immutable.List(value);
    const keySet: Immutable.Set<K> = Immutable.Set(value);

    const newKeys: Immutable.Set<K> = Immutable.Set(keySet.keySeq()).subtract(this.childListeners.keySeq());
    const oldKeys: Immutable.Set<K> = Immutable.Set(this.childListeners.keySeq()).subtract(keySet.keySeq());

    if (!this.unknownKeys) {
      this.unknownKeys = emptySet;
    }
    this.unknownKeys = Immutable.Set<K>(this.unknownKeys.concat(newKeys)).subtract(oldKeys);

    this.childListeners = this.childListeners.withMutations((mutableListeners: Immutable.Map<K, (value: V) => void>) => {
      this.childRefs = this.childRefs.withMutations((mutableChildRefs: Immutable.Map<K, kebakaran.IRef<V>>) => {

        newKeys.forEach((key: K) => {
          const child = this.createChild(key);
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
          this.values = this.values.remove(key);
        });

      });
    });

    if (this.unknownKeys.size === 0) {
      this.emit();
    }
  }

  private onChildValue(key: K, snapshot: kebakaran.ISnapshot<V> | V) {
    const value = unwrapSnapshot(snapshot);

    this.values = this.values.set(key, value);
    this.unknownKeys = this.unknownKeys.remove(key);

    if (this.unknownKeys.size === 0) {
      this.emit();
    }
  }

  protected getData(): Array<V> {
    const result:Array<V> = [];
    this.keys.forEach((key: K) => {
      result.push(this.values.get(key));
    }); 
    return result;
  }

  protected hasData(): boolean {
    return this.unknownKeys && this.unknownKeys.size == 0
  }

  protected subscribe(): void {
    this.ref.on('value', this.onRefValue, this);
  }

  protected close(): void {
    this.ref.off('value', this.onRefValue, this);
    this.childListeners.forEach((listener: (value: V) => void, key: K) => {
      this.childRefs.get(key).off('value', listener);
    });
    this.childListeners = emptyMap;
    this.childRefs = emptyMap;
    this.keys = emptyList;
    delete this.unknownKeys;
    this.values = emptyMap;
  }

}