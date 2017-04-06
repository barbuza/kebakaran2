import { Emitter } from "./Emitter";
import { INestedSnapshot } from "./INestedSnapshot";
import { IRef } from "./IRef";
import { ISnapshot } from "./ISnapshot";

export class Transform<F, T> extends Emitter<T> {

  public static keys(ref: IRef<INestedSnapshot<any>>): IRef<string[]> {
    return new Transform<INestedSnapshot<any>, string[]>(ref, (snapshot) => {
      const result: string[] = [];
      snapshot.forEach((child) => {
        result.push(child.key);
      });
      return result;
    });
  }

  public static values<T>(ref: IRef<INestedSnapshot<T>>): IRef<T[]> {
    return new Transform<INestedSnapshot<T>, T[]>(ref, (snapshot) => {
      const result: T[] = [];
      snapshot.forEach((child) => {
        result.push(child.val());
      });
      return result;
    });
  }

  public static val<T>(ref: IRef<ISnapshot<T>>): IRef<T> {
    return new Transform<ISnapshot<T>, T>(ref, (snapshot) => snapshot.val());
  }

  private ref: IRef<F>;
  private transform: (from: F) => T;
  private hasData: boolean = false;

  constructor(ref: IRef<F>, transform: (from: F) => T) {
    super();
    this.ref = ref;
    this.transform = transform;
  }

  protected ready(): boolean {
    return this.hasData;
  }

  protected subscribe(): void {
    this.ref.on("value", this.onRefValue, this);
  }

  protected close(): void {
    this.ref.off("value", this.onRefValue, this);
  }

  private onRefValue(value: F) {
    this.data = this.transform(value);
    this.hasData = true;
    this.emit();
  }

}
