import * as Immutable from 'immutable';

import { Emitter } from './Emitter';
import { unwrapSnapshot } from './unwrapSnapshot';

const NO_VALUE = {};

export class Equal<V> extends Emitter<V> {
  private ref: kebakaran.IRef<V>;
  private value:any = NO_VALUE;
  private immutableValue: any;

  constructor(ref: kebakaran.IRef<V>) {
    super();
    this.ref = ref;
  }

  protected getData(): V {
    return this.value;
  }

  protected hasData(): boolean {
    return this.value !== NO_VALUE;
  }

  private onData(snapshot: kebakaran.ISnapshot<V> | V) {
    const value = unwrapSnapshot(snapshot);

    const newImmutableValue = Immutable.fromJS(value);

    if (!Immutable.is(newImmutableValue, this.immutableValue)) {
      this.immutableValue = newImmutableValue;
      this.value = value;
      this.emit();
    }
  }

  protected subscribe(): void {
    this.ref.on('value', this.onData, this);
  }

  protected close(): void {
    this.ref.off('value', this.onData, this);
  }
}
