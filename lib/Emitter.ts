import { Listener } from './Listener';

function assertName(name: string): void {
  if (name !== 'value') {
    throw new Error(`unknown event '${name}'`);
  }
}

export abstract class Emitter<T> implements kebakaran.IRef<T> {

  private subscribed = false;
  private onceListeners: Array<Listener<T>> = [];
  private listeners: Array<Listener<T>> = [];

  protected abstract getData(): T;

  protected abstract hasData(): boolean;

  protected abstract subscribe(): void;

  protected abstract close(): void;

  protected subscribeIfNeeded(): void {
    if (!this.subscribed && (this.listeners.length || this.onceListeners.length)) {
      this.subscribed = true;
      this.subscribe();
    }
  }

  protected unsubscribeIfNeeded(): void {
    if (this.subscribed && this.listeners.length === 0 && this.onceListeners.length === 0) {
      this.subscribed = false;
      this.close();
    }
  }

  protected addListener(listener: (value: T) => void, context: any, once?: boolean): void {
    if (once) {
      this.onceListeners.push(new Listener<T>(listener, context));
    } else {
      this.listeners.push(new Listener<T>(listener, context));
    }
  }

  protected removeListener(listener: (value: T) => void, context: any, once?: boolean): void {
    let listeners: Array<Listener<T>> = once ? this.onceListeners : this.listeners;
    context = context || undefined;
    listeners = listeners.filter(item => item.getFn() !== listener || item.getContext() !== context);
    if (once) {
      this.onceListeners = listeners;
    } else {
      this.listeners = listeners;
    }
  }

  protected emit(): void {
    const value: T = this.getData();
    this.listeners.forEach(listener => listener.call(value));
    this.onceListeners.forEach(listener => listener.call(value));
    this.onceListeners = [];
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
