import { Emitter } from '../../lib/Emitter';

export class RefMock<T> extends Emitter<T> {

  public isOpen: boolean = false;
  private _hasData: boolean = false;

  public fakeEmit(value: T): void {
    this._data = value;
    this._hasData = true;
    this.emit();
  }

  public resetValue(): void {
    this._hasData = false;
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

}
