export class Listener<T> {
  private fn: (value: T) => void;
  private context: any;

  constructor(fn: (value: T) => void, context: any) {
    this.fn = fn;
    this.context = context || undefined;
  }

  public call(value: T): void {
    this.fn.call(this.context, value);
  }

  public getFn(): (value: T) => void {
    return this.fn;
  }

  public getContext(): any {
    return this.context;
  }
}
