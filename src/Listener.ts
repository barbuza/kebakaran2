export class Listener<T> {
  private fn: (value: T) => void;
  private context: any;
  private once: boolean;
  private called: boolean = false;
  private promise: Promise<T> | undefined;
  private resolve: (value: T) => void | undefined;

  constructor(fn: (value: T) => void, context: any, once?: boolean) {
    this.fn = fn;
    this.context = context || undefined;
    this.once = once || false;
    if (this.once) {
      this.promise = new Promise((resolve) => {
        this.resolve = resolve;
      });
    }
  }

  public call(value: T): void {
    if (this.once && this.called) {
      throw new Error("once listener called twice");
    }

    if (this.resolve) {
      this.resolve(value);
    }

    this.called = true;
    this.fn.call(this.context, value);
  }

  public getFn(): (value: T) => void {
    return this.fn;
  }

  public getContext(): any {
    return this.context;
  }

  public getPromise(): Promise<T> {
    if (!this.promise) {
      throw new Error("only for `once` listeners");
    }
    return this.promise;
  }
}
