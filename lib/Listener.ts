export class Listener<T> {
  private _fn: (value: T) => void;
  private _context: any;

  constructor(fn: (value: T) => void, context: any) {
    this._fn = fn;
    this._context = context || undefined;
  }

  public call(value: T): void {
    this._fn.call(this._context, value);
  }

  public getFn(): (value: T) => void {
    return this._fn;
  }

  public getContext(): any {
    return this._context;
  }
}
