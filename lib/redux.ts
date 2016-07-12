import { Reducer, Action, StoreEnhancer, StoreEnhancerStoreCreator } from 'redux';
import * as Immutable from 'immutable';

export interface IReduxEmitterConfig<S, K, V> {
  key(state: S): K | undefined;
  ref(key: K): kebakaran.IRef<V>;
  dispatch(dispatch: (action: Action) => void, value: V): void;
}

class ReduxEmitter<S, K, V> {
  private _config: IReduxEmitterConfig<S, K, V>;
  private _dispatch: (action: Action) => void;
  private _key: K | undefined = undefined;
  private _ref: kebakaran.IRef<V> | undefined = undefined;

  constructor(config: IReduxEmitterConfig<S, K, V>, dispatch: (action: Action) => void) {
    this._config = config;
    this._dispatch = dispatch;
  }

  public adopt(state: S) {
    const newKey = this._config.key(state);
    if (!Immutable.is(newKey, this._key)) {
      this._key = newKey;

      if (this._ref) {
        this._ref.off('value', this._onValue, this);
      }

      if (typeof newKey === 'undefined') {
        this._ref = undefined;
      } else {
        this._ref = this._config.ref(newKey);
      }

      if (this._ref) {
        this._ref.on('value', this._onValue, this);
      }
    }
  }

  private _onValue(value: V) {
    this._config.dispatch(this._dispatch, value);
  }

}

export function enhancer<S>(configs: Array<IReduxEmitterConfig<S, any, any>>): StoreEnhancer<S> {
  return (next: StoreEnhancerStoreCreator<S>) => {
    return (reducer: Reducer<S>, preloadedState?: S) => {
      const store: Redux.Store<S> = next(reducer, preloadedState);
      const emitters = configs.map(config => new ReduxEmitter(config, store.dispatch));

      store.subscribe(() => {
        const state = store.getState();
        emitters.forEach(emitter => {
          emitter.adopt(state);
        });
      });

      const state = store.getState();
      emitters.forEach(emitter => {
        emitter.adopt(state);
      });

      return store;
    };
  };
}
