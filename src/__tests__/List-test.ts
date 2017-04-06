import { List } from "../List";
import { RefMock } from "./support/RefMock";

describe("List", () => {
  it("should work with plain refs", () => {
    const keys = new RefMock<number[]>();

    const children = [
      new RefMock<string>(),
      new RefMock<string>(),
    ];

    const list = new List<number, string>(keys, (key: number) => children[key]);

    let val: string[] | undefined;

    const listener = (value: string[]) => {
      val = value;
    };

    list.on("value", listener);

    keys.fakeEmit([0, 1]);
    children[0].fakeEmit("foo");
    children[1].fakeEmit("bar");

    expect(val).toEqual(["foo", "bar"]);

    list.off("value", listener);

    expect(keys.isOpen).toBe(false);
    expect(children[0].isOpen).toBe(false);
    expect(children[1].isOpen).toBe(false);

    children[1].resetValue();
    val = undefined;

    list.on("value", listener);
    expect(val).toBeUndefined();

    children[1].fakeEmit("eggs");
    expect(val).toEqual(["foo", "eggs"]);

    children[0].fakeEmit("spam");
    expect(val).toEqual(["spam", "eggs"]);
  });

  it("should handle changing key set", () => {
    const keys = new RefMock<number[]>();

    const children = [
      new RefMock<string>(),
      new RefMock<string>(),
    ];

    const list = new List<number, string>(keys, (key) => children[key]);

    let value: string[] | undefined;
    list.on("value", (val) => {
      value = val;
    });

    children[0].fakeEmit("foo");
    children[1].fakeEmit("bar");

    keys.fakeEmit([0]);
    expect(value).toEqual(["foo"]);

    keys.fakeEmit([0, 1]);
    expect(value).toEqual(["foo", "bar"]);

    keys.fakeEmit([1]);
    expect(value).toEqual(["bar"]);

    keys.fakeEmit([1, 0]);
    expect(value).toEqual(["bar", "foo"]);
  });

  it("should handle `once` listeners", () => {
    const keys = new RefMock<number[]>();

    const children = [
      new RefMock<string>(),
      new RefMock<string>(),
    ];

    const list = new List<number, string>(keys, (key) => children[key]);
    let value: string[] | undefined;

    children[0].fakeEmit("foo");
    children[1].fakeEmit("bar");

    keys.fakeEmit([0]);
    list.once("value", (val) => {
      value = val;
    });
    expect(value).toEqual(["foo"]);

    keys.fakeEmit([0, 1]);
    list.once("value", (val) => {
      value = val;
    });
    expect(value).toEqual(["foo", "bar"]);

    keys.fakeEmit([1]);
    list.once("value", (val) => {
      value = val;
    });
    expect(value).toEqual(["bar"]);

    keys.fakeEmit([1, 0]);
    list.once("value", (val) => {
      value = val;
    });
    expect(value).toEqual(["bar", "foo"]);
  });
});
