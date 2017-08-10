import * as Immutable from "immutable";
import { Action, Dispatch, Reducer, Store, StoreEnhancer, StoreEnhancerStoreCreator } from "redux";
import { IRef } from "./IRef";

export interface IReduxEmitterConfig<S, K, V> {
  key(state: S): K | undefined;
  ref(key: K): IRef<V>;
  dispatch(dispatch: Dispatch<S>, value: V): void;
}

class ReduxEmitter<S, K, V> {
  private config: IReduxEmitterConfig<S, K, V>;
  private dispatch: Dispatch<S>;
  private key: K | undefined = undefined;
  private ref: IRef<V> | undefined = undefined;

  constructor(config: IReduxEmitterConfig<S, K, V>, dispatch: Dispatch<S>) {
    this.config = config;
    this.dispatch = dispatch;
  }

  public adopt(state: S) {
    const newKey = this.config.key(state);
    if (!Immutable.is(newKey, this.key)) {
      this.key = newKey;
      const oldRef = this.ref;

      this.ref = typeof newKey === "undefined" ? undefined : this.config.ref(newKey);

      if (this.ref) {
        this.ref.on("value", this.onValue);
      }

      if (oldRef) {
        oldRef.off("value", this.onValue);
      }
    }
  }

  private onValue = (value: V) => {
    this.config.dispatch(this.dispatch, value);
  }
}

export function enhancer<S>(configs: Array<IReduxEmitterConfig<S, any, any>>): StoreEnhancer<S> {
  return (next: StoreEnhancerStoreCreator<S>) => {
    return (reducer: Reducer<S>, preloadedState?: S) => {
      const store: Store<S> = next(reducer, preloadedState);
      const emitters = configs.map((config) => new ReduxEmitter(config, store.dispatch));

      const adopt = () => {
        const newState = store.getState();
        emitters.forEach((emitter) => {
          emitter.adopt(newState);
        });
      };

      store.subscribe(adopt);
      adopt();

      return store;
    };
  };
}
