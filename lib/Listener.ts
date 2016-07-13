import { Promise } from 'es6-promise';

export class Listener<T> {
  private _fn: (value: T) => void;
  private _context: any;
  private _once: boolean;
  private _called: boolean = false;
  private _promise: Promise<T> | undefined;
  private _resolve: (value: T) => void | undefined;

  constructor(fn: (value: T) => void, context: any, once?: boolean) {
    this._fn = fn;
    this._context = context || undefined;
    this._once = once || false;
    if (this._once) {
      this._promise = new Promise(resolve => {
        this._resolve = resolve;
      });
    }
  }

  public call(value: T): void {
    if (this._once && this._called) {
      throw new Error('once listener called twice');
    }

    this._called = true;
    this._fn.call(this._context, value);

    if (this._resolve) {
      this._resolve(value);
    }
  }

  public getFn(): (value: T) => void {
    return this._fn;
  }

  public getContext(): any {
    return this._context;
  }

  public getPromise(): Promise<T> {
    if (!this._promise) {
      throw new Error('only for `once` listeners');
    }
    return this._promise;
  }
}
