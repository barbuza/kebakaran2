declare namespace kebakaran {

  interface IRef<T> {
    on(name: string, listener: (value: T) => void, context?: any): (value: T) => void;
    once(name: string, listener: (value: T) => void, context?: any): any;
    off(name: string, listener: (value: T) => void, context?: any): any;
  }

  interface ISnapshot<T> {
    key: string;
    val(): T;
  }

  interface INestedSnapshot<T> extends ISnapshot<Array<ISnapshot<T>>> {
    forEach(childAction: (child: ISnapshot<T>) => void | boolean): void;
  }

}
