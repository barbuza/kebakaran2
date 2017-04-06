import * as Immutable from "immutable";
import { Emitter } from "./Emitter";
import { IRef } from "./IRef";

export class Equal<V> extends Emitter<V> {

  private ref: IRef<V>;
  private immutableData: any;
  private hasData: boolean = false;

  constructor(ref: IRef<V>) {
    super();
    this.ref = ref;
  }

  protected ready(): boolean {
    return this.hasData;
  }

  protected subscribe(): void {
    this.ref.on("value", this.onValue, this);
  }

  protected close(): void {
    this.ref.off("value", this.onValue, this);
  }

  private onValue(value: V) {
    const newImmutableValue = Immutable.fromJS(value);

    if (!Immutable.is(newImmutableValue, this.immutableData)) {
      this.immutableData = newImmutableValue;
      this.data = value;
      this.hasData = true;
      this.emit();
    }
  }

}
