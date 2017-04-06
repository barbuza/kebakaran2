import { Action, createStore, Dispatch, Store } from "redux";
import { enhancer, IReduxEmitterConfig } from "../redux";
import { RefMock } from "./support/RefMock";

describe("redux ehancer", () => {
  it("should handle running state", () => {
    interface IReduxState {
      counter: number;
      enabled: boolean;
    }

    function reducer(state: IReduxState = { counter: 0, enabled: true }, action: Action): IReduxState {
      switch (action.type) {
        case "INC":
          return { counter: state.counter + 1, enabled: state.enabled };
        case "DEC":
          return { counter: state.counter - 1, enabled: state.enabled };
        case "ENABLE":
          return { counter: state.counter, enabled: true };
        case "DISABLE":
          return { counter: state.counter, enabled: false };
        default:
          return state;
      }
    }

    const commandRef = new RefMock<string>();
    const enablerRef = new RefMock<void>();

    const command: IReduxEmitterConfig<IReduxState, boolean, string> = {
      dispatch: (dispatch: Dispatch<IReduxState>, type: string) => dispatch({ type }),
      key: (state: IReduxState) => state.enabled || undefined,
      ref: () => commandRef,
    };

    const enabler: IReduxEmitterConfig<IReduxState, boolean, undefined> = {
      dispatch: (dispatch: Dispatch<IReduxState>, value: undefined) => dispatch({ type: "ENABLE" }),
      key: (state: IReduxState) => state.enabled ? undefined : true,
      ref: () => enablerRef,
    };

    const store: Store<IReduxState> = enhancer([command, enabler])(createStore)(reducer);
    expect(commandRef.isOpen).toBe(true);
    expect(enablerRef.isOpen).toBe(false);

    let state: IReduxState = store.getState();
    store.subscribe(() => {
      state = store.getState();
    });

    commandRef.fakeEmit("INC");
    expect(state.counter).toBe(1);

    commandRef.fakeEmit("DEC");
    expect(state.counter).toBe(0);

    commandRef.fakeEmit("DISABLE");
    expect(commandRef.isOpen).toBe(false);

    commandRef.fakeEmit("ENABLE");
    expect(commandRef.isOpen).toBe(false);

    commandRef.fakeEmit("INC");
    expect(state.counter).toBe(0);

    commandRef.fakeEmit("DEC");
    expect(state.counter).toBe(0);

    enablerRef.fakeEmit(undefined);
    expect(commandRef.isOpen).toBe(true);
    expect(state.counter).toBe(-1);
  });
});
