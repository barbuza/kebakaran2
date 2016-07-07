import { Emitter } from './Emitter';

export class Transform<F, T> extends Emitter<T> {

  private _ref: kebakaran.IRef<F>;
  private _transform: (from: F) => T;
  private _data: T = undefined;
  private _hasData: boolean = false;

  constructor(ref: kebakaran.IRef<F>, transform: (from: F) => T) {
    super();
    this._ref = ref;
    this._transform = transform;
  }

  private onRefValue(value: F) {
    this._data = this._transform(value);
    this._hasData = true;
    this.emit();
  }

  protected getData(): T {
    return this._data;
  }

  protected hasData(): boolean {
    return this._hasData;
  }

  protected subscribe(): void {
    this._ref.on('value', this.onRefValue, this);
  }

  protected close(): void {
    this._ref.off('value', this.onRefValue, this);
  }

  public static keys(ref: kebakaran.IRef<kebakaran.INestedSnapshot<any>>): kebakaran.IRef<Array<string>> {
    return new Transform<kebakaran.INestedSnapshot<any>, Array<string>>(ref, snapshot => {
      const result: Array<string> = [];
      snapshot.forEach(child => {
        result.push(child.key());
      });
      return result;
    });
  }

  public static val<T>(ref: kebakaran.IRef<kebakaran.ISnapshot<T>>): kebakaran.IRef<T> {
    return new Transform<kebakaran.ISnapshot<T>, T>(ref, snapshot => snapshot.val());
  }

}
