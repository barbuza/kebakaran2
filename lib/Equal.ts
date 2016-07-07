import * as Immutable from 'immutable';
import { Emitter } from './Emitter';

export class Equal<V> extends Emitter<V> {
  private _ref: kebakaran.IRef<V>;
  private _data: any = undefined;
  private _immutableData: any;
  private _hasData: boolean = false;

  constructor(ref: kebakaran.IRef<V>) {
    super();
    this._ref = ref;
  }

  protected getData(): V {
    return this._data;
  }

  protected hasData(): boolean {
    return this._hasData;
  }

  private onData(value: V) {
    const newImmutableValue = Immutable.fromJS(value);

    if (!Immutable.is(newImmutableValue, this._immutableData)) {
      this._immutableData = newImmutableValue;
      this._data = value;
      this._hasData = true;
      this.emit();
    }
  }

  protected subscribe(): void {
    this._ref.on('value', this.onData, this);
  }

  protected close(): void {
    this._ref.off('value', this.onData, this);
  }
}
