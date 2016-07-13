export class SnapshotMock<T> implements kebakaran.ISnapshot<T> {

  public key: string;

  private _val: T;

  constructor(key: string, val: T) {
    this.key = key;
    this._val = val;
  }

  public val(): T {
    return this._val;
  }

}
