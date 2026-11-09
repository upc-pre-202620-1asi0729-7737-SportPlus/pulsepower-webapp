import '@angular/compiler';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { routes } from '../../../app.routes';
describe('Recovery guide navigation', () => {
  it('serves the assistant as its own workspace section for every focus', () => {
    const layout = routes.find((route) => route.children);
    const assistant = layout?.children?.find((route) => route.path === 'assistant');
    expect(assistant?.loadChildren).toBeTypeOf('function');
    expect(assistant?.canActivate).toBeUndefined();
    const simulator = layout?.children?.find((route) => route.path === 'device');
    expect(simulator?.loadChildren).toBeTypeOf('function');
    expect(simulator?.canActivate).toBeUndefined();
  });
  it('lists the assistant in the shared side navigation and not inside the recovery page', () => {
    const layout = readFileSync('src/app/shared/presentation/components/layout/layout.ts', 'utf8');
    expect(layout).toMatch(/SHARED_NAV[\s\S]*?path: '\/assistant'[\s\S]*?path: '\/device'/);
    const recovery = readFileSync(
      'src/app/modules/physiology/presentation/views/recovery-page/recovery-page.html',
      'utf8',
    );
    expect(recovery).not.toContain('assistant-input');
    expect(recovery).toContain('routerLink="/assistant"');
  });
});
