# kebakaran [![Build Status](https://travis-ci.org/barbuza/kebakaran2.svg?branch=master)](https://travis-ci.org/barbuza/kebakaran2) [![Coverage Status](https://coveralls.io/repos/github/barbuza/kebakaran2/badge.svg?branch=master)](https://coveralls.io/github/barbuza/kebakaran2?branch=master)

strongly typed high level utilities for consuming data from firebase

## usage

following firebase data

```json
{
  "ages": {
    "1": 10,
    "2": 20
  },
  "names": {
    "1": "foo",
    "2": "bar"
  },
  "users": {
    "1": true,
    "2": true
  }
}
```

may be accessed like that

### Struct

```typescript
import { Struct, Transform } from "kebakaran";

const database = firebase.database();

interface IUserData {
  age: number | undefined;
  name: string | undefined;
}

const struct = new Struct<IUserData>({
  age: Transform.val<number>(database.ref("ages").child("1") as any),
  name: Transform.val<string>(database.ref("names").child("1") as any),
});

struct.on("value", (value: IUserData) => {
  // handle data
});
```

### List

```typescript
import { Emitter, List, Struct, Transform } from "kebakaran";

const database = firebase.database();

interface IUserData {
  age: number | undefined;
  name: string | undefined;
}

interface IUser extends IUserData {
  id: number;
}

function makeUserData(userId: string): Emitter<IUserData> {
  return new Struct<IUserData>({
    age: Transform.val<number>(database.ref("ages").child(userId) as any),
    name: Transform.val<string>(database.ref("names").child(userId) as any),
  });
}

function makeUser(userId: string): Emitter<IUser> {
  return new Transform<IUserData, IUser>(makeUserData(userId), (userData) => ({
    age: userData.age,
    id: parseInt(userId, 10),
    name: userData.name,
  }));
}

const userListRef = Transform.keys(database.ref("users") as any);
const list = new List<string, IUser>(userListRef, makeUser);

list.on("value", (value: IUser[]) => {
  // handle data
});
```
