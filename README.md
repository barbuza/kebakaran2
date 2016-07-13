# kebakaran

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
import { Struct, Transform } from 'kebakaran';

interface IUserData {
  name: string | undefined;
  age: number | undefined;
}

const nameRef = database.ref('names').child('1');
const ageRef = database.ref('ages').child('1');

const struct = new Struct<IUserData>({
  name: Transform.val<string>(nameRef),
  age: Transform.val<number>(ageRef)
});

struct.on('value', (value: IUserData) => {
  // handle data
});
```

### List

```typescript
import { Transform, Struct, List, Emitter } from 'kebakaran';

interface IUserData {
  name: string | undefined;
  age: number | undefined;
}

interface IUser extends IUserData {
  id: number;
}

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

const userListRef = Transform.keys(database.ref('users'));
const list = new List<string, IUser>(userListRef, makeUser);

list.on('value', (value: Array<IUser>) => {
  // handle data
});
```
