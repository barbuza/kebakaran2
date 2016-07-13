import * as assert from 'power-assert';
import * as firebase from 'firebase';
import { Transform, Struct, List, Emitter } from '../lib';

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

describe('Firebase', () => {
  fit('should be compatible with Struct', done => {
    const nameRef = database.ref('names').child('1');
    const ageRef = database.ref('ages').child('1');

    const struct = new Struct<IUserData>({
      name: Transform.val<string>(nameRef),
      age: Transform.val<number>(ageRef)
    });

    function listener(value: IUserData) {
      assert.deepEqual(value, { name: 'foo', age: 10 });
      struct.off('value', listener);
      done();
    }

    struct.on('value', listener);
  });

  fit('should be compatible with List', done => {
    const userListRef = Transform.keys(database.ref('users'));

    function makeUserData(userId: string): Emitter<IUserData> {
      return new Struct<IUserData>({
        name: Transform.val<string>(database.ref('names').child(userId)),
        age: Transform.val<number>(database.ref('ages').child(userId))
      });
    }

    function makeUser(userId: string): Emitter<IUser> {
      return new Transform<IUserData, IUser>(makeUserData(userId), userData => ({
        id: parseInt(userId, 10),
        name: userData.name,
        age: userData.age
      }));
    }

    const list = new List<string, IUser>(userListRef, makeUser);

    function listener(value: Array<IUser>) {
      assert.deepEqual(value, [
        { id: 1, name: 'foo', age: 10 },
        { id: 2, name: 'bar', age: 20 }
      ]);
      list.off('value', listener);
      done();
    }

    list.on('value', listener);
  });
});
