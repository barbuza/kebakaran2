import { Emitter } from '../../lib/Emitter';

export class RefMock<T> extends Emitter<T> {

  private _hasData: boolean = false;
  private _data: T = undefined;
  public isOpen: boolean = false;

  protected getData(): T {
    return this._data;
  }

  protected hasData(): boolean {
    return this._hasData;
  }

  protected subscribe(): void {
    this.isOpen = true;
  }

  protected close(): void {
    this.isOpen = false;
  }

  public fakeEmit(value: T): void {
    this._data = value;
    this._hasData = true;
    this.emit();
  }

  public resetValue(): void {
    this._data = undefined;
    this._hasData = false;
  }

}
