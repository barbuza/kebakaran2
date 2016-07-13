import * as assert from 'power-assert';
import * as firebase from 'firebase';
import { createStore, Action, Dispatch, Store } from 'redux';
import { Transform, Struct, List, Emitter, enhancer } from '../lib';

firebase.initializeApp({
  apiKey: 'AIzaSyCxyLT0arghKyY9N3SBz9WZ40TR0ovDFXo',
  databaseURL: 'https://kebakaran-tests.firebaseio.com'
});

const database = firebase.database();

const fit = (expectation: string, assertion: (done: MochaDone) => void) =>
  (it(expectation, assertion) as any).timeout(10000);

interface IUserData {
  name: string | undefined;
  age: number | undefined;
}

interface IUser extends IUserData {
  id: number;
}

const usersData = [
  { id: 1, name: 'foo', age: 10 },
  { id: 2, name: 'bar', age: 20 }
];

function makeUserData(userId: string): Emitter<IUserData> {
  return new Struct<IUserData>({
    name: Transform.val<string>(database.ref('names').child(userId)),
    age: Transform.val<number>(database.ref('ages').child(userId))
  });
}

function makeUser(userId: string): Emitter<IUser> {
  return new Transform<IUserData, IUser>(makeUserData(userId), data => ({
    id: parseInt(userId, 10),
    name: data.name,
    age: data.age
  }));
}

describe('Firebase', () => {
  fit('should be compatible with Struct', done => {
    const struct = makeUserData('1');

    function listener(value: IUserData) {
      assert.deepEqual(value, { name: 'foo', age: 10 });
      struct.off('value', listener);
      done();
    }

    struct.on('value', listener);
  });

  fit('should be compatible with List', done => {
    const userListRef = Transform.keys(database.ref('users'));

    const list = new List<string, IUser>(userListRef, makeUser);

    function listener(value: Array<IUser>) {
      assert.deepEqual(value, usersData);
      list.off('value', listener);
      done();
    }

    list.on('value', listener);
  });

  fit('should be compatible with redux', done => {
    interface IReduxState {
      users: Array<IUser> | undefined;
    }

    interface ISetUsersAction extends Action {
      type: 'SET_USERS';
      users: Array<IUser>;
    }

    function isSetUsersAction(action: Action): action is ISetUsersAction {
      return action.type === 'SET_USERS';
    }

    function reducer<A extends Action>(state: IReduxState = { users: undefined }, action: A): IReduxState {
      if (isSetUsersAction(action)) {
        return { users: action.users };
      }
      return state;
    }

    const configs = [{
      key: (state: IReduxState) => state.users ? undefined : true,
      ref: () => new List(Transform.keys(database.ref('users')), makeUser),
      dispatch: (dispatch: Dispatch<IReduxState>, users: Array<IUser>) => dispatch({ type: 'SET_USERS', users })
    }];

    const store: Store<IReduxState> = enhancer<IReduxState>(configs)(createStore)(reducer);
    assert.deepEqual(store.getState(), { users: undefined });

    store.subscribe(() => {
      assert.deepEqual(store.getState(), {
        users: usersData
      });
      done();
    });
  });
});
