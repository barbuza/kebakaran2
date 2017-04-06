import { Promise } from "es6-promise";
import * as firebase from "firebase";
import { Action, createStore, Dispatch, Store } from "redux";
import { Emitter, enhancer, List, Struct, Transform } from "../";

firebase.initializeApp({
  apiKey: "AIzaSyCxyLT0arghKyY9N3SBz9WZ40TR0ovDFXo",
  databaseURL: "https://kebakaran-tests.firebaseio.com",
});

const database = firebase.database();

interface IUserData {
  name: string | undefined;
  age: number | undefined;
}

interface IUser extends IUserData {
  id: number;
}

const usersData = [
  { id: 1, name: "foo", age: 10 },
  { id: 2, name: "bar", age: 20 },
];

function makeUserData(userId: string): Emitter<IUserData> {
  return new Struct<IUserData>({
    age: Transform.val<number>(database.ref("ages").child(userId) as any),
    name: Transform.val<string>(database.ref("names").child(userId) as any),
  });
}

function makeUser(userId: string): Emitter<IUser> {
  return new Transform<IUserData, IUser>(makeUserData(userId), (data) => ({
    age: data.age,
    id: parseInt(userId, 10),
    name: data.name,
  }));
}

afterAll(() => {
  database.goOffline();
});

describe("Firebase", () => {
  it("should be compatible with Struct", () => {
    const struct = makeUserData("1");

    return makeUserData("1").once("value").then((value) => {
      expect(value).toEqual({ name: "foo", age: 10 });
    });
  });

  it("should be compatible with List", () => {
    const userListRef = Transform.keys(database.ref("users") as any);
    const list = new List<string, IUser>(userListRef, makeUser);

    return list.once("value").then((value) => {
      expect(value).toEqual(usersData);
    });
  });

  it("should be compatible with redux", () => {
    interface IReduxState {
      users: IUser[] | undefined;
    }

    interface ISetUsersAction extends Action {
      type: "SET_USERS";
      users: IUser[];
    }

    function isSetUsersAction(action: Action): action is ISetUsersAction {
      return action.type === "SET_USERS";
    }

    function reducer<A extends Action>(state: IReduxState = { users: undefined }, action: A): IReduxState {
      if (isSetUsersAction(action)) {
        return { users: action.users };
      }
      return state;
    }

    const configs = [{
      dispatch: (dispatch: Dispatch<IReduxState>, users: IUser[]) => dispatch({ type: "SET_USERS", users }),
      key: (state: IReduxState) => state.users ? undefined : true,
      ref: () => new List(Transform.keys(database.ref("users") as any), makeUser),
    }];

    const store: Store<IReduxState> = enhancer<IReduxState>(configs)(createStore)(reducer);
    expect(store.getState()).toEqual({ users: undefined });

    const storeState = new Promise((resolve) => {
      store.subscribe(() => {
        resolve(store.getState());
      });
    });

    return storeState.then((state) => {
      expect(state).toEqual({ users: usersData });
    });
  });
});
