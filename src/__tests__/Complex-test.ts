import { Equal, IRef, List, Struct, Transform } from "../";
import { NestedSnapshotMock } from "./support/NestedSnapshotMock";
import { RefMock } from "./support/RefMock";
import { SnapshotMock } from "./support/SnapshotMock";

const fixtureData = {
  tags: {
    0: "spam",
    1: "eggs",
  },
  userList: {
    0: true,
    1: true,
    2: true,
  },
  users: {
    0: {
      firstName: "foo",
      tags: {
        0: true,
      },
    },
    1: {
      firstName: "bar",
      tags: {
        0: true,
        1: true,
      },
    },
    2: {
      firstName: "spam",
      tags: {},
    },
  },
};

const expectedData = [
  {
    firstName: "foo",
    id: 0,
    tags: [
      {
        id: 0,
        name: "spam",
      },
    ],
  },
  {
    firstName: "bar",
    id: 1,
    tags: [
      {
        id: 0,
        name: "spam",
      },
      {
        id: 1,
        name: "eggs",
      },
    ],
  },
  {
    firstName: "spam",
    id: 2,
    tags: [],
  },
];

interface ITag {
  id: number;
  name: string;
}

interface IUser {
  id: number;
  firstName: string;
  tags: ITag[];
}

interface IFixture {
  users: IRef<IUser[]>;
  firstNameRefs: Array<RefMock<SnapshotMock<string>>>;
  tagsListRefs: Array<RefMock<NestedSnapshotMock<any>>>;
  tagNameRefs: Array<RefMock<SnapshotMock<string>>>;
  userListRef: RefMock<NestedSnapshotMock<any>>;
}

function makeFixture(): IFixture {

  const firstNameRefs: Array<RefMock<SnapshotMock<string>>> =
    Object.keys(fixtureData.users).map(() => new RefMock<SnapshotMock<string>>());

  const tagsListRefs: Array<RefMock<NestedSnapshotMock<any>>> =
    Object.keys(fixtureData.users).map(() => new RefMock<NestedSnapshotMock<any>>());

  const tagNameRefs: Array<RefMock<SnapshotMock<string>>> =
    Object.keys(fixtureData.tags).map(() => new RefMock<SnapshotMock<string>>());

  const userListRef = new RefMock<NestedSnapshotMock<any>>();

  const userIdList = Transform.keys(userListRef);

  function createUserStruct(id: string): IRef<IUser> {
    const tagListIds = Transform.keys(tagsListRefs[id]);

    const tagList = new List<string, ITag>(tagListIds, (tagId) => {
      return new Transform<{ name: string }, ITag>(
        new Struct<{ name: string }>({
          name: Transform.val(tagNameRefs[parseInt(tagId, 10)]),
        }),
        (data) => ({
          id: parseInt(tagId, 10),
          name: data.name,
        }),
      );
    });

    const userData = new Struct<{ firstName: string, tags: ITag[] }>({
      firstName: Transform.val(firstNameRefs[parseInt(id, 10)]),
      tags: tagList,
    });

    return new Transform<{ firstName: string, tags: ITag[] }, IUser>(userData, (data) => ({
      firstName: data.firstName,
      id: parseInt(id, 10),
      tags: data.tags,
    }));
  }

  const users = new List<string, IUser>(userIdList, createUserStruct);

  return {
    firstNameRefs,
    tagNameRefs,
    tagsListRefs,
    userListRef,
    users,
  };
}

describe("Complex", () => {
  it("all parts should work together", () => {
    const fixture: IFixture = makeFixture();

    fixture.userListRef.fakeEmit(
      new NestedSnapshotMock("userLid", Object.keys(fixtureData.users).map((userId: string) =>
        new SnapshotMock(userId, true),
      )),
    );

    Object.keys(fixtureData.users).forEach((userId) => {

      fixture.firstNameRefs[parseInt(userId, 10)].fakeEmit(
        new SnapshotMock("firstName", fixtureData.users[userId].firstName),
      );

      fixture.tagsListRefs[parseInt(userId, 10)].fakeEmit(
        new NestedSnapshotMock("tags", Object.keys(fixtureData.users[userId].tags).map((tagId: string) =>
          new SnapshotMock(tagId, true),
        )),
      );
    });

    Object.keys(fixtureData.tags).forEach((tagId) => {
      fixture.tagNameRefs[parseInt(tagId, 10)].fakeEmit(new SnapshotMock("name", fixtureData.tags[tagId]));
    });

    return new Equal(fixture.users).once("value", (users) => {
      expect(users).toEqual(expectedData);
    });
  });
});
