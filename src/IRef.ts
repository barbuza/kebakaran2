export interface IRef<T> {
  on(name: string, listener: (value: T) => void, context?: any): (value: T) => void;
  once(name: string, listener?: (value: T) => void, context?: any): Promise<T>;
  off(name: string, listener: (value: T) => void, context?: any): any;
}
