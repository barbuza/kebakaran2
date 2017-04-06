export interface ISnapshot<T> {
  key: string;
  val(): T;
}
