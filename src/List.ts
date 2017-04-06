import * as Immutable from "immutable";
import { Emitter } from "./Emitter";
import { IRef } from "./IRef";

const emptySet = Immutable.Set<any>();
const emptyList = Immutable.List<any>();
const emptyMap = Immutable.Map<any, any>();

export class List<K, V> extends Emitter<V[]> {

  private ref: IRef<K[]>;
  private createChild: (key: K) => IRef<V>;
  private unknownKeys: Immutable.Set<K> = emptySet;
  private keys: Immutable.List<K> = emptyList;
  private values: Immutable.Map<K, V> = emptyMap;
  private childListeners: Immutable.Map<K, (value: V) => void> = emptyMap;
  private childRefs: Immutable.Map<K, IRef<V>> = emptyMap;
  private hasKeys: boolean = false;

  constructor(ref: IRef<K[]>, createChild: (key: K) => IRef<V>) {
    super();
    this.ref = ref;
    this.createChild = createChild;
  }

  protected ready(): boolean {
    return this.hasKeys && this.unknownKeys.size === 0;
  }

  protected subscribe(): void {
    this.ref.on("value", this.onRefValue, this);
  }

  protected close(): void {
    this.ref.off("value", this.onRefValue, this);
    this.childListeners.forEach((listener: (value: V) => void, key: K) => {
      this.childRefs.get(key).off("value", listener);
    });
    this.childListeners = emptyMap;
    this.childRefs = emptyMap;
    this.keys = emptyList;
    this.unknownKeys = emptySet;
    this.values = emptyMap;
    this.data = [];
    this.hasKeys = false;
  }

  private onRefValue(value: K[]) {
    const prevKeySet = Immutable.Set(this.keys);

    this.keys = Immutable.List(value);
    this.hasKeys = true;

    const keySet: Immutable.Set<K> = Immutable.Set(value);

    const newKeys: Immutable.Set<K> = keySet.subtract(prevKeySet);
    const oldKeys: Immutable.Set<K> = prevKeySet.subtract(keySet);

    this.unknownKeys = Immutable.Set<K>(this.unknownKeys.concat(newKeys)).subtract(oldKeys);

    this.childListeners = this.childListeners.withMutations(
      (mutableListeners: Immutable.Map<K, (value: V) => void>) => {
        this.childRefs = this.childRefs.withMutations(
          (mutableChildRefs: Immutable.Map<K, IRef<V>>) => {

            newKeys.forEach((key: K) => {
              const child = this.createChild(key);
              const listener = this.onChildValue.bind(this, key);
              mutableListeners.set(key, listener);
              mutableChildRefs.set(key, child);
              child.on("value", listener);
            });

            oldKeys.forEach((key: K) => {
              const child = mutableChildRefs.get(key);
              const listener = mutableListeners.get(key);
              child.off("value", listener);
              mutableListeners.remove(key);
              mutableChildRefs.remove(key);
              this.values = this.values.remove(key);
            });

          });
      });

    this.tryEmit();
  }

  private onChildValue(key: K, value: V) {
    this.values = this.values.set(key, value);
    this.unknownKeys = this.unknownKeys.remove(key);

    this.tryEmit();
  }

  private tryEmit() {
    if (this.ready()) {
      this.data = [];
      this.keys.forEach((key: K) => {
        this.data.push(this.values.get(key));
      });
      this.emit();
    }
  }

}
