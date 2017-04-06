import { Equal } from "../Equal";
import { RefMock } from "./support/RefMock";

describe("Equal", () => {
  it("should emit once for similar values", () => {
    const ref = new RefMock<string[]>();
    const eq = new Equal<string[]>(ref);

    let value: string[] | undefined;
    let count: number = 0;

    const listener = (val: string[]) => {
      value = val;
      count += 1;
    };

    eq.on("value", listener);

    ref.fakeEmit(["foo", "bar"]);
    ref.fakeEmit(["foo", "bar"]);

    expect(value).toEqual(["foo", "bar"]);
    expect(count).toBe(1);

    eq.off("value", listener);
    expect(ref.isOpen).toBe(false);
  });
});
