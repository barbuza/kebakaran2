import { ISnapshot } from "./ISnapshot";

export interface INestedSnapshot<T> extends ISnapshot<Array<ISnapshot<T>>> {
  forEach(childAction: (child: ISnapshot<T>) => void | boolean): void;
}
