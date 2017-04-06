import { Struct } from "../Struct";
import { RefMock } from "./support/RefMock";

describe("Struct", () => {
  it("should work with flat refs", () => {
    const foo = new RefMock<string>();
    const bar = new RefMock<number>();

    interface IStructValue {
      foo: string;
      bar: number;
    }

    const struct = new Struct<IStructValue>({ foo, bar });

    expect(foo.isOpen).toBe(false);
    expect(bar.isOpen).toBe(false);

    let val: IStructValue | undefined;

    const listener = (value: IStructValue) => {
      val = value;
    };

    struct.on("value", listener);

    expect(foo.isOpen).toBe(true);
    expect(bar.isOpen).toBe(true);

    foo.fakeEmit("spam");

    expect(val).toBeUndefined();

    bar.fakeEmit(1);

    expect(val).toEqual({ foo: "spam", bar: 1 });

    struct.off("value", listener);

    expect(foo.isOpen).toBe(false);
    expect(bar.isOpen).toBe(false);

    val = undefined;

    struct.on("value", listener);

    expect(val).toEqual({ foo: "spam", bar: 1 });

    struct.off("value", listener);
    foo.resetValue();
    bar.resetValue();

    val = undefined;

    struct.on("value", listener);

    expect(val).toBeUndefined();
  });

  it("should work with nested structs", () => {
    const foo = new RefMock<string>();

    interface IChildValue {
      foo: string;
    }

    interface IParentValue {
      child: IChildValue;
    }

    const child = new Struct<IChildValue>({ foo });
    const parent = new Struct<IParentValue>({ child });

    expect(foo.isOpen).toBe(false);

    let val: IParentValue | undefined;

    const listener = (value: IParentValue) => {
      val = value;
    };

    parent.on("value", listener);

    foo.fakeEmit("bar");

    expect(val).toEqual({ child: { foo: "bar" } });

    parent.off("value", listener);

    expect(foo.isOpen).toBe(false);
  });

  it("should work with `once` listeners", () => {
    const foo = new RefMock<string>();
    const bar = new RefMock<number>();

    interface IStructValue {
      foo: string;
      bar: number;
    }

    const struct = new Struct<IStructValue>({ foo, bar });

    foo.fakeEmit("spam");
    bar.fakeEmit(1);

    let value: IStructValue | undefined;

    struct.once("value", (val) => {
      value = val;
    });

    expect(value).toEqual({
      bar: 1,
      foo: "spam",
    });

    expect(foo.isOpen).toBe(false);
    expect(bar.isOpen).toBe(false);
  });
});
