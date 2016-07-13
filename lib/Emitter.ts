import { Promise } from 'es6-promise';
import { Listener } from './Listener';

function assertName(name: string): void {
  if (name !== 'value') {
    throw new Error(`unknown event '${name}'`);
  }
}

const noop = () => undefined;

export abstract class Emitter<T> implements kebakaran.IRef<T> {

  protected _data: T;

  private _subscribed = false;
  private _onceListeners: Array<Listener<T>> = [];
  private _listeners: Array<Listener<T>> = [];

  public on(name: string, listener: (value: T) => void, context?: any): (value: T) => void {
    assertName(name);

    this._addListener(listener, context);
    if (this._ready()) {
      listener.call(context, this._data);
    }
    this._subscribeIfNeeded();

    return listener;
  }

  public off(name: string, listener: (value: T) => void, context?: any): this {
    assertName(name);

    this._removeListener(listener, context);
    this._unsubscribeIfNeeded();

    return this;
  }

  public once(name: string, callback?: (value: T) => void, context?: any): Promise<T> {
    assertName(name);

    if (!callback) {
      callback = noop;
    }

    if (this._ready()) {
      callback.call(context, this._data);
      return Promise.resolve(this._data);
    }

    const listener = this._addListener(callback, context, true);
    this._subscribeIfNeeded();
    return listener.getPromise();
  }

  protected abstract _ready(): boolean;

  protected abstract _subscribe(): void;

  protected abstract _close(): void;

  protected _emit(): void {
    this._listeners.forEach(listener => listener.call(this._data));
    this._onceListeners.forEach(listener => listener.call(this._data));
    this._onceListeners = [];
    this._unsubscribeIfNeeded();
  }

  private _subscribeIfNeeded(): void {
    if (!this._subscribed && (this._listeners.length || this._onceListeners.length)) {
      this._subscribed = true;
      this._subscribe();
    }
  }

  private _unsubscribeIfNeeded(): void {
    if (this._subscribed && this._listeners.length === 0 && this._onceListeners.length === 0) {
      this._subscribed = false;
      this._close();
    }
  }

  private _addListener(callback: (value: T) => void, context: any, once?: boolean): Listener<T> {
    const listener = new Listener<T>(callback, context, once);
    if (once) {
      this._onceListeners.push(listener);
    } else {
      this._listeners.push(listener);
    }
    return listener;
  }

  private _removeListener(listener: (value: T) => void, context: any): void {
    context = context || undefined;
    this._onceListeners = this._onceListeners.filter(item => item.getFn() !== listener || item.getContext() !== context);
    this._listeners = this._listeners.filter(item => item.getFn() !== listener || item.getContext() !== context);
  }

}
