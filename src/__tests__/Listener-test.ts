import { Promise } from "es6-promise";
import { Listener } from "../Listener";

describe("Listener", () => {
  it("stores context as undefined", () => {
    const ok = new Listener<string>((value) => expect(value).toBe("foo"), null);
    expect(ok.getContext()).toBeUndefined();
    ok.call("foo");
  });

  it("handles once param", () => {
    const fail = new Listener<string>((value) => expect(value).toBe("foo"), null, true);
    fail.call("foo");
    expect(() => {
      fail.call("bar");
    }).toThrow(/twice/);
  });

  it("should provide promises on `once` mode", () => {
    const invalid = new Listener<string>(() => undefined, null);
    expect(() => {
      invalid.getPromise();
    }).toThrow(/once/);

    const valid = new Listener<string>(() => undefined, null, true);
    const promiseA = valid.getPromise();
    const promiseB = valid.getPromise();
    expect(promiseA).toBeInstanceOf(Promise);
    expect(promiseB).toBeInstanceOf(Promise);
    expect(promiseA).toBe(promiseB);

    valid.call("foo");

    return promiseA.then((val) => {
      expect(val).toBe("foo");
    });
  });
});
