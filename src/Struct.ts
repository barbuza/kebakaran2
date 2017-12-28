import { database } from "firebase";
import { Emitter } from "./Emitter";
import { IRef } from "./IRef";

export type IStructFields<T> = {
  [K in keyof T]: IRef<T[K]> | database.Query;
};

interface IFieldListeners {
  [key: string]: (value: any) => void;
}

export class Struct<T> extends Emitter<T> {

  protected data: T = {} as any;

  private unknownFields: string[] = [];
  private fieldListeners: IFieldListeners = {};

  constructor(private fields: IStructFields<T>) {
    super();
    for (const name of Object.keys(this.fields)) {
      this.unknownFields.push(name);
    }
  }

  protected ready(): boolean {
    return this.unknownFields.length === 0;
  }

  protected subscribe(): void {
    for (const name of Object.keys(this.fields)) {
      const listener = this.onFieldValue.bind(this, name);
      this.fieldListeners[name] = listener;
      this.fields[name].on("value", listener);
    }
  }

  protected close(): void {
    this.data = {} as any;
    this.unknownFields = [];
    for (const name of Object.keys(this.fields)) {
      this.unknownFields.push(name);
      this.fields[name].off("value", this.fieldListeners[name]);
    }
    this.fieldListeners = {};
  }

  private onFieldValue(name: string, value: any): void {
    this.data[name] = value;
    const unknownIndex = this.unknownFields.indexOf(name);
    if (unknownIndex !== -1) {
      this.unknownFields.splice(unknownIndex, 1);
    }
    if (!this.unknownFields.length) {
      this.emit();
    }
  }

}
