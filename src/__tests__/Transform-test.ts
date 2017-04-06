import { Transform } from "../Transform";
import { NestedSnapshotMock } from "./support/NestedSnapshotMock";
import { RefMock } from "./support/RefMock";
import { SnapshotMock } from "./support/SnapshotMock";

describe("Transform", () => {
  it("should apply basic transformation", () => {
    const foo = new RefMock<number>();
    const transform = new Transform<number, number>(foo, (x) => x + 1);

    let val: number | undefined;

    const listener = (value: number) => {
      val = value;
    };

    transform.on("value", listener);
    expect(foo.isOpen).toBe(true);

    foo.fakeEmit(1);
    expect(val).toBe(2);

    transform.off("value", listener);
    expect(foo.isOpen).toBe(false);
  });

  it("should extract keys with static `keys` method", () => {
    const foo = new RefMock<NestedSnapshotMock<boolean>>();
    const transform = Transform.keys(foo);

    let value: string[] | undefined;

    transform.on("value", (val) => {
      value = val;
    });

    foo.fakeEmit(new NestedSnapshotMock<boolean>("parent", [
      new SnapshotMock<boolean>("foo", true),
      new SnapshotMock<boolean>("bar", true),
    ]));

    expect(value).toEqual(["foo", "bar"]);
  });

  it("should extract values with static `values` method", () => {
    const foo = new RefMock<NestedSnapshotMock<string>>();
    const transform = Transform.values(foo);
    let value: string[] | undefined;

    transform.on("value", (val) => {
      value = val;
    });

    foo.fakeEmit(new NestedSnapshotMock<string>("parent", [
      new SnapshotMock<string>("0", "foo"),
      new SnapshotMock<string>("1", "bar"),
    ]));

    expect(value).toEqual(["foo", "bar"]);
  });
});
