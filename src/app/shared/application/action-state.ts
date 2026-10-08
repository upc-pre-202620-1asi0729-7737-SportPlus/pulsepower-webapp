import { signal } from '@angular/core';
export abstract class ActionState {
  private readonly busyState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly messageState = signal<string | null>(null);
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly message = this.messageState.asReadonly();
  private running: Promise<boolean> | null = null;
  private reading: Promise<boolean> | null = null;
  protected read(action: () => Promise<void>): Promise<boolean> {
    if (this.reading) return this.reading;
    const previous = this.running;
    this.reading = (
      previous ? previous.then(() => this.execute(action)) : this.execute(action)
    ).finally(() => {
      this.reading = null;
    });
    return this.reading;
  }
  protected execute(action: () => Promise<void>, message?: string): Promise<boolean> {
    if (this.busyState()) return Promise.resolve(false);
    this.busyState.set(true);
    this.errorState.set(null);
    this.messageState.set(null);
    this.running = Promise.resolve()
      .then(action)
      .then(() => {
        if (message) this.messageState.set(message);
        return true;
      })
      .catch((error: unknown) => {
        this.errorState.set(
          error instanceof Error
            ? error.message
            : 'This action could not be completed. Please try again.',
        );
        return false;
      })
      .finally(() => {
        this.busyState.set(false);
        this.running = null;
      });
    return this.running;
  }
}
