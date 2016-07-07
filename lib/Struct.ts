import { Emitter } from './Emitter';
import { unwrapSnapshot } from './unwrapSnapshot';

export interface StructFields {
  [key: string]: kebakaran.IRef<any>;
}

interface FieldListeners {
  [key: string]: (value: any) => void;
}

export class Struct<T> extends Emitter<T> {

  private data: T = {} as T;
  private unknownFields: Array<string> = [];
  private fieldListeners: FieldListeners = {};
  private fields: StructFields = {};

  constructor(fields: StructFields) {
    super();
    this.fields = fields;
    for (const name in this.fields) {
      if (this.fields.hasOwnProperty(name)) {
        this.unknownFields.push(name);
      }
    }
  }

  protected getData(): T {
    return this.data;
  }

  protected hasData(): boolean {
    return this.unknownFields.length === 0;
  }

  protected subscribe(): void {
    for (const name in this.fields) {
      if (this.fields.hasOwnProperty(name)) {
        const listener = this.onFieldValue.bind(this, name);
        this.fieldListeners[name] = listener;
        this.fields[name].on('value', listener);
      }
    }
  }

  protected onFieldValue(name: string, snapshot: kebakaran.ISnapshot<any> | any): void {
    const value = unwrapSnapshot(snapshot);

    this.data[name] = value;
    const unknownIndex = this.unknownFields.indexOf(name);
    if (unknownIndex !== -1) {
      this.unknownFields.splice(unknownIndex, 1);
    }
    if (!this.unknownFields.length) {
      this.emit();
    }
  }

  protected close(): void {
    this.data = {} as T;
    this.unknownFields = [];
    for (const name in this.fields) {
      if (this.fields.hasOwnProperty(name)) {
        this.unknownFields.push(name);
        this.fields[name].off('value', this.fieldListeners[name]);
      }
    }
    this.fieldListeners = {};
  }

}