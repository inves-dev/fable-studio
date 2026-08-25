// Tiny pub/sub event bus. Strongly typed channels.

export type EventHandler<T> = (payload: T) => void;

export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler<unknown>>>();

  on<T>(channel: string, handler: EventHandler<T>): () => void {
    let set = this.handlers.get(channel);
    if (!set) {
      set = new Set();
      this.handlers.set(channel, set);
    }
    set.add(handler as EventHandler<unknown>);
    return () => this.off(channel, handler);
  }

  off<T>(channel: string, handler: EventHandler<T>): void {
    const set = this.handlers.get(channel);
    if (!set) return;
    set.delete(handler as EventHandler<unknown>);
    if (set.size === 0) this.handlers.delete(channel);
  }

  emit<T>(channel: string, payload?: T): void {
    const set = this.handlers.get(channel);
    if (!set) return;
    for (const handler of [...set]) {
      try {
        handler(payload as unknown);
      } catch (err) {
        console.error(`[EventBus] handler error on "${channel}":`, err);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const bus = new EventBus();