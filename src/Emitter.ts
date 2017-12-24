import { IRef } from "./IRef";
import { Listener } from "./Listener";

function assertName(name: string): void {
  if (name !== "value") {
    throw new Error(`unknown event '${name}'`);
  }
}

const noop = () => undefined;

export abstract class Emitter<T> implements IRef<T> {

  protected data: T;

  private subscribed = false;
  private onceListeners: Array<Listener<T>> = [];
  private listeners: Array<Listener<T>> = [];

  public on(name: string, listener: (value: T) => void, context?: any): (value: T) => void {
    assertName(name);

    this.addListener(listener, context);
    if (this.ready()) {
      listener.call(context, this.data);
    }
    this.subscribeIfNeeded();

    return listener;
  }

  public off(name: string, listener: (value: T) => void, context?: any): this {
    assertName(name);

    this.removeListener(listener, context);
    this.unsubscribeIfNeeded();

    return this;
  }

  public once(name: string, callback?: (value: T) => void, context?: any): Promise<T> {
    assertName(name);

    if (!callback) {
      callback = noop;
    }

    if (this.ready()) {
      callback.call(context, this.data);
      return Promise.resolve(this.data);
    }

    const listener = this.addListener(callback, context, true);
    this.subscribeIfNeeded();
    return listener.getPromise();
  }

  protected abstract ready(): boolean;

  protected abstract subscribe(): void;

  protected abstract close(): void;

  protected emit(): void {
    this.listeners.forEach((listener) => listener.call(this.data));
    this.onceListeners.forEach((listener) => listener.call(this.data));
    this.onceListeners = [];
    this.unsubscribeIfNeeded();
  }

  private subscribeIfNeeded(): void {
    if (!this.subscribed && (this.listeners.length || this.onceListeners.length)) {
      this.subscribed = true;
      this.subscribe();
    }
  }

  private unsubscribeIfNeeded(): void {
    if (this.subscribed && this.listeners.length === 0 && this.onceListeners.length === 0) {
      this.subscribed = false;
      this.close();
    }
  }

  private addListener(callback: (value: T) => void, context: any, once?: boolean): Listener<T> {
    const listener = new Listener<T>(callback, context, once);
    if (once) {
      this.onceListeners.push(listener);
    } else {
      this.listeners.push(listener);
    }
    return listener;
  }

  private removeListener(listener: (value: T) => void, context: any): void {
    context = context || undefined;
    this.onceListeners = this.onceListeners.filter(
      (item) => item.getFn() !== listener || item.getContext() !== context);
    this.listeners = this.listeners.filter((item) => item.getFn() !== listener || item.getContext() !== context);
  }

}
