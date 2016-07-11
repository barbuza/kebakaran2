import { Emitter } from './Emitter';

export interface IStructFields {
  [key: string]: kebakaran.IRef<any>;
}

interface IFieldListeners {
  [key: string]: (value: any) => void;
}

export class Struct<T> extends Emitter<T> {

  protected _data: T = {} as T;

  private _unknownFields: Array<string> = [];
  private _fieldListeners: IFieldListeners = {};
  private _fields: IStructFields = {};

  constructor(fields: IStructFields) {
    super();
    this._fields = fields;
    for (const name in this._fields) {
      if (this._fields.hasOwnProperty(name)) {
        this._unknownFields.push(name);
      }
    }
  }

  protected hasData(): boolean {
    return this._unknownFields.length === 0;
  }

  protected subscribe(): void {
    for (const name in this._fields) {
      if (this._fields.hasOwnProperty(name)) {
        const listener = this.onFieldValue.bind(this, name);
        this._fieldListeners[name] = listener;
        this._fields[name].on('value', listener);
      }
    }
  }

  protected close(): void {
    this._data = {} as T;
    this._unknownFields = [];
    for (const name in this._fields) {
      if (this._fields.hasOwnProperty(name)) {
        this._unknownFields.push(name);
        this._fields[name].off('value', this._fieldListeners[name]);
      }
    }
    this._fieldListeners = {};
  }

  private onFieldValue(name: string, value: any): void {
    this._data[name] = value;
    const unknownIndex = this._unknownFields.indexOf(name);
    if (unknownIndex !== -1) {
      this._unknownFields.splice(unknownIndex, 1);
    }
    if (!this._unknownFields.length) {
      this.emit();
    }
  }

}
