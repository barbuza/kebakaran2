import { Emitter } from '../lib/Emitter';

const NO_VALUE = {};

export class RefMock<T> extends Emitter<T> {

  private data: T = NO_VALUE as T;
  public isOpen: boolean = false;

  protected getData(): T {
    return this.data;
  }

  protected hasData(): boolean {
    return this.data !== NO_VALUE;
  }

  protected subscribe(): void {
    this.isOpen = true;
  }

  protected close(): void {
    this.isOpen = false;
  }

  public fakeEmit(value: T): void {
    this.data = value;
    this.emit();
  }

  public resetValue(): void {
    this.data = NO_VALUE as T;
  }

}
