declare namespace kebakaran {

  interface IRef<T> {
    on(name: string, listener: (value: T) => void, context?: any): this;
    once(name: string, listener: (value: T) => void, context?: any): this;
    off(name: string, listener: (value: T) => void, context?: any): this;
  }

  interface ISnapshot<T> {
    val(): T;
    key(): string;
  }

  interface INestedSnapshot<T> extends ISnapshot<Array<ISnapshot<T>>> {
    forEach(childAction: (child: ISnapshot<T>) => void | boolean): void;
  }

}
