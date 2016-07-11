export class Listener<T> {
  private _fn: (value: T) => void;
  private _context: any;
  private _once: boolean;
  private _called: boolean = false;

  constructor(fn: (value: T) => void, context: any, once?: boolean) {
    this._fn = fn;
    this._context = context || undefined;
    this._once = once || false;
  }

  public call(value: T): void {
    if (this._once && this._called) {
      throw new Error('once listener called twice');
    }

    this._called = true;
    this._fn.call(this._context, value);
  }

  public getFn(): (value: T) => void {
    return this._fn;
  }

  public getContext(): any {
    return this._context;
  }
}
