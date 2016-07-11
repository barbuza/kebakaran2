import { Emitter } from '../../lib/Emitter';

export class RefMock<T> extends Emitter<T> {

  public isOpen: boolean = false;
  private _hasData: boolean = false;

  public fakeEmit(value: T): void {
    this._data = value;
    this._hasData = true;
    this._emit();
  }

  public resetValue(): void {
    this._hasData = false;
  }

  protected _ready(): boolean {
    return this._hasData;
  }

  protected _subscribe(): void {
    this.isOpen = true;
  }

  protected _close(): void {
    this.isOpen = false;
  }

}
