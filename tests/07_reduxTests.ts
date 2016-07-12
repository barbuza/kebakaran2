import * as assert from 'power-assert';
import { Action, Dispatch, Store, createStore } from 'redux';
import { enhancer, IReduxEmitterConfig } from '../lib/redux';
import { RefMock } from './support/RefMock';

describe('redux ehancer', () => {
  it('should handle running state', () => {
    interface IReduxState {
      counter: number;
      enabled: boolean;
    }

    function reducer(state: IReduxState = { counter: 0, enabled: true }, action: Action): IReduxState {
      switch (action.type) {
        case 'INC':
          return { counter: state.counter + 1, enabled: state.enabled };
        case 'DEC':
          return { counter: state.counter - 1, enabled: state.enabled };
        case 'ENABLE':
          return { counter: state.counter, enabled: true };
        case 'DISABLE':
          return { counter: state.counter, enabled: false };
        default:
          return state;
      }
    }

    const commandRef = new RefMock<string>();
    const enablerRef = new RefMock<void>();

    const command: IReduxEmitterConfig<IReduxState, boolean, string> = {
      key: (state: IReduxState) => state.enabled || undefined,
      ref: () => commandRef,
      dispatch: (dispatch: Dispatch<IReduxState>, type: string) => dispatch({ type })
    };

    const enabler: IReduxEmitterConfig<IReduxState, boolean, undefined> = {
      key: (state: IReduxState) => state.enabled ? undefined : true,
      ref: () => enablerRef,
      dispatch: (dispatch: Dispatch<IReduxState>, value: undefined) => dispatch({ type: 'ENABLE' })
    };

    const store: Store<IReduxState> = enhancer([command, enabler])(createStore)(reducer);
    assert.ok(commandRef.isOpen);
    assert.ok(!enablerRef.isOpen);

    let state: IReduxState = store.getState();
    store.subscribe(() => {
      state = store.getState();
    });

    commandRef.fakeEmit('INC');
    assert.equal(state.counter, 1);

    commandRef.fakeEmit('DEC');
    assert.equal(state.counter, 0);

    commandRef.fakeEmit('DISABLE');
    assert.ok(!commandRef.isOpen);

    commandRef.fakeEmit('ENABLE');
    assert.ok(!commandRef.isOpen);

    commandRef.fakeEmit('INC');
    assert.equal(state.counter, 0);

    commandRef.fakeEmit('DEC');
    assert.equal(state.counter, 0);

    enablerRef.fakeEmit(undefined);
    assert.ok(commandRef.isOpen);
    assert.equal(state.counter, -1);
  });
});
