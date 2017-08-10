import { Action, createStore, Dispatch, Store } from "redux";
import { enhancer, IReduxEmitterConfig } from "../redux";
import { RefMock } from "./support/RefMock";

interface IReduxState {
  counter: number;
  enabled: boolean;
}

interface IIncAction extends Action {
  type: "INC";
}

interface IDecAction extends Action {
  type: "DEC";
}

interface IEnableAction extends Action {
  type: "ENABLE";
}

interface IDisableAction extends Action {
  type: "DISABLE";
}

type IActionType = "INC" | "DEC" | "ENABLE" | "DISABLE";

type IFinalAction = IIncAction | IDecAction | IEnableAction | IDisableAction;

describe("redux ehancer", () => {
  it("should handle running state", () => {

    function reducer(st: IReduxState = { counter: 0, enabled: true }, action: IFinalAction): IReduxState {
      switch (action.type) {
        case "INC":
          return { counter: st.counter + 1, enabled: st.enabled };
        case "DEC":
          return { counter: st.counter - 1, enabled: st.enabled };
        case "ENABLE":
          return { counter: st.counter, enabled: true };
        case "DISABLE":
          return { counter: st.counter, enabled: false };
        default:
          return st;
      }
    }

    const commandRef = new RefMock<IActionType>();
    const enablerRef = new RefMock<undefined>();

    const command: IReduxEmitterConfig<IReduxState, boolean, string> = {
      dispatch: (dispatch: Dispatch<IReduxState>, value: IActionType) => dispatch({ type: value }),
      key: (st: IReduxState) => st.enabled || undefined,
      ref: () => commandRef,
    };

    const enabler: IReduxEmitterConfig<IReduxState, boolean, undefined> = {
      dispatch: (dispatch: Dispatch<IReduxState>, value: undefined) => dispatch({ type: "ENABLE" }),
      key: (st: IReduxState) => st.enabled ? undefined : true,
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
