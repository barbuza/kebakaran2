import { Emitter } from './Emitter';

export class Transform<F, T> extends Emitter<T> {

  private _ref: kebakaran.IRef<F>;
  private _transform: (from: F) => T;
  private _hasData: boolean = false;

  public static keys(ref: kebakaran.IRef<kebakaran.INestedSnapshot<any>>): kebakaran.IRef<Array<string>> {
    return new Transform<kebakaran.INestedSnapshot<any>, Array<string>>(ref, snapshot => {
      const result: Array<string> = [];
      snapshot.forEach(child => {
        result.push(child.key());
      });
      return result;
    });
  }

  public static values<T>(ref: kebakaran.IRef<kebakaran.INestedSnapshot<T>>): kebakaran.IRef<Array<T>> {
    return new Transform<kebakaran.INestedSnapshot<T>, Array<T>>(ref, snapshot => {
      const result: Array<T> = [];
      snapshot.forEach(child => {
        result.push(child.val());
      });
      return result;
    });
  }

  public static val<T>(ref: kebakaran.IRef<kebakaran.ISnapshot<T>>): kebakaran.IRef<T> {
    return new Transform<kebakaran.ISnapshot<T>, T>(ref, snapshot => snapshot.val());
  }

  constructor(ref: kebakaran.IRef<F>, transform: (from: F) => T) {
    super();
    this._ref = ref;
    this._transform = transform;
  }

  protected _ready(): boolean {
    return this._hasData;
  }

  protected _subscribe(): void {
    this._ref.on('value', this._onRefValue, this);
  }

  protected _close(): void {
    this._ref.off('value', this._onRefValue, this);
  }

  private _onRefValue(value: F) {
    this._data = this._transform(value);
    this._hasData = true;
    this._emit();
  }

}
