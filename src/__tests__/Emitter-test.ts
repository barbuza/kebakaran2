import { RefMock } from "./support/RefMock";

describe("Emitter", () => {
  it("should handle `on` and `once` listeners", () => {
    const emitter = new RefMock<string>();
    expect(emitter.isOpen).toBe(false);

    let foo: string | undefined;
    let bar: string | undefined;

    emitter.on("value", (value) => {
      foo = value;
    });
    expect(emitter.isOpen).toBe(true);

    emitter.once("value", (value) => {
      bar = value;
    });
    emitter.fakeEmit("spam");
    expect(foo).toBe("spam");
    expect(bar).toBe("spam");

    emitter.fakeEmit("eggs");
    expect(foo).toBe("eggs");
    expect(bar).toBe("spam");
  });

  it("should handle `once` in instant mode", () => {
    const emitter = new RefMock<string>();
    let value: string | undefined;

    emitter.fakeEmit("foo");

    emitter.once("value", (val) => {
      value = val;
    });
    expect(value).toBe("foo");

    emitter.fakeEmit("bar");
    expect(value).toBe("foo");
  });

  it("should handle invalid event name", () => {
    const emitter = new RefMock<string>();

    expect(() => {
      emitter.on("spam", () => null);
    }).toThrow(/unknown event/);
  });

  it("should work with promices", () => {
    const emitter = new RefMock<string>();

    const promise = emitter.once("value").then((value) => {
      expect(value).toBe("foo");
    });

    emitter.fakeEmit("foo");

    return promise;
  });

  it("should work with promises in instant mode", () => {
    const emitter = new RefMock<string>();

    emitter.fakeEmit("foo");

    return emitter.once("value").then((value) => {
      expect(value).toBe("foo");
    });
  });
});
