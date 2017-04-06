import { Emitter } from "../../Emitter";

export class RefMock<T> extends Emitter<T> {

  public isOpen: boolean = false;
  private hasData: boolean = false;

  public fakeEmit(value: T): void {
    this.data = value;
    this.hasData = true;
    this.emit();
  }

  public resetValue(): void {
    this.hasData = false;
  }

  protected ready(): boolean {
    return this.hasData;
  }

  protected subscribe(): void {
    this.isOpen = true;
  }

  protected close(): void {
    this.isOpen = false;
  }

}
