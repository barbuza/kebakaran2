import * as Immutable from 'immutable';
import { Emitter } from './Emitter';

export class Equal<V> extends Emitter<V> {

  private _ref: kebakaran.IRef<V>;
  private _immutableData: any;
  private _hasData: boolean = false;

  constructor(ref: kebakaran.IRef<V>) {
    super();
    this._ref = ref;
  }

  protected _ready(): boolean {
    return this._hasData;
  }

  protected _subscribe(): void {
    this._ref.on('value', this._onValue, this);
  }

  protected _close(): void {
    this._ref.off('value', this._onValue, this);
  }

  private _onValue(value: V) {
    const newImmutableValue = Immutable.fromJS(value);

    if (!Immutable.is(newImmutableValue, this._immutableData)) {
      this._immutableData = newImmutableValue;
      this._data = value;
      this._hasData = true;
      this._emit();
    }
  }

}
