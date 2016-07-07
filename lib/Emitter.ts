import { Listener } from './Listener';

function assertName(name: string): void {
  if (name !== 'value') {
    throw new Error(`unknown event '${name}'`);
  }
}

export abstract class Emitter<T> implements kebakaran.IRef<T> {

  private _subscribed = false;
  private _onceListeners: Array<Listener<T>> = [];
  private _listeners: Array<Listener<T>> = [];

  protected abstract getData(): T;

  protected abstract hasData(): boolean;

  protected abstract subscribe(): void;

  protected abstract close(): void;

  protected subscribeIfNeeded(): void {
    if (!this._subscribed && (this._listeners.length || this._onceListeners.length)) {
      this._subscribed = true;
      this.subscribe();
    }
  }

  protected unsubscribeIfNeeded(): void {
    if (this._subscribed && this._listeners.length === 0 && this._onceListeners.length === 0) {
      this._subscribed = false;
      this.close();
    }
  }

  protected addListener(listener: (value: T) => void, context: any, once?: boolean): void {
    if (once) {
      this._onceListeners.push(new Listener<T>(listener, context));
    } else {
      this._listeners.push(new Listener<T>(listener, context));
    }
  }

  protected removeListener(listener: (value: T) => void, context: any, once?: boolean): void {
    let listeners: Array<Listener<T>> = once ? this._onceListeners : this._listeners;
    context = context || undefined;
    listeners = listeners.filter(item => item.getFn() !== listener || item.getContext() !== context);
    if (once) {
      this._onceListeners = listeners;
    } else {
      this._listeners = listeners;
    }
  }

  protected emit(): void {
    const value: T = this.getData();
    this._listeners.forEach(listener => listener.call(value));
    this._onceListeners.forEach(listener => listener.call(value));
    this._onceListeners = [];
    this.unsubscribeIfNeeded();
  }

  public on(name: string, listener: (value: T) => void, context?: any): this {
    assertName(name);

    this.addListener(listener, context);
    if (this.hasData()) {
      listener.call(context, this.getData());
    }
    this.subscribeIfNeeded();

    return this;
  }

  public off(name: string, listener: (value: T) => void, context?: any): this {
    assertName(name);

    this.removeListener(listener, context);
    this.unsubscribeIfNeeded();

    return this;
  }

  public once(name: string, listener: (value: T) => void, context?: any): this {
    assertName(name);

    if (this.hasData()) {
      listener.call(context, this.getData());
    } else {
      this.addListener(listener, context, true);
      this.subscribeIfNeeded();
    }

    return this;
  }

}
