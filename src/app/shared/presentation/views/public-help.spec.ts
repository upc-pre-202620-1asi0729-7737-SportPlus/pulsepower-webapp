import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { routes } from '../../../app.routes';
describe('Help center access', () => {
  it('serves a public help page to visitors before the workspace layout', () => {
    const publicIndex = routes.findIndex((route) => route.path === 'help');
    const layoutIndex = routes.findIndex((route) => route.children);
    expect(publicIndex).toBeGreaterThanOrEqual(0);
    expect(publicIndex).toBeLessThan(layoutIndex);
    expect(routes[publicIndex]?.canMatch?.length).toBe(1);
    expect(routes[publicIndex]?.loadComponent).toBeTypeOf('function');
  });
  it('keeps the member help page and every workspace route behind a session', () => {
    const layout = routes.find((route) => route.children);
    expect(layout?.canActivate?.length).toBe(1);
    expect(layout?.children?.some((route) => route.path === 'help')).toBe(true);
  });
});
