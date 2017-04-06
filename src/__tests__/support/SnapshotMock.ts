import { ISnapshot } from "../../ISnapshot";

export class SnapshotMock<T> implements ISnapshot<T> {

  public key: string;

  private value: T;

  constructor(key: string, val: T) {
    this.key = key;
    this.value = val;
  }

  public val(): T {
    return this.value;
  }

}
