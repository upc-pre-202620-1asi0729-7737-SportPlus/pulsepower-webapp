import { expect, it } from 'vitest';
import { ActionState } from './action-state';
class ExampleStore extends ActionState {
  reads = 0;
  load(): Promise<boolean> {
    return this.read(async () => {
      this.reads++;
      await Promise.resolve();
    });
  }
}
it('coalesces concurrent page and summary reads instead of reporting false failures', async () => {
  const store = new ExampleStore();
  expect(await Promise.all([store.load(), store.load(), store.load()])).toEqual([true, true, true]);
  expect(store.reads).toBe(1);
  expect(store.error()).toBeNull();
});
