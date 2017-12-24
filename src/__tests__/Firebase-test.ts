import * as firebase from "firebase";
import { Emitter, List, Struct, Transform } from "../";

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
    age: Transform.val(database.ref("ages").child(userId)),
    name: Transform.val(database.ref("names").child(userId)),
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
    const userListRef = Transform.keys(database.ref("users"));
    const list = new List<string, IUser>(userListRef, makeUser);

    return list.once("value").then((value) => {
      expect(value).toEqual(usersData);
    });
  });
});
