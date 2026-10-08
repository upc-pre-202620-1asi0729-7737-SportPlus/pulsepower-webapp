import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { routes } from '../../../app.routes';
describe('Public legal pages', () => {
  it('exposes titled lazy routes outside the workspace layout', () => {
    for (const path of ['terms', 'privacy']) {
      const route = routes.find((route) => route.path === path);
      expect(route?.title).toBeTruthy();
      expect(route?.loadComponent).toBeTypeOf('function');
      expect(route?.canActivate).toBeUndefined();
    }
  });
  it('shows the legal and help footer only on authentication pages', () => {
    const auth = readFileSync(
      'src/app/modules/iam/presentation/components/auth-layout/auth-layout.html',
      'utf8',
    );
    const footer = auth.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
    for (const path of ['terms', 'privacy', 'help'])
      expect(footer).toContain('routerLink="/' + path + '"');
    expect(footer).toContain('Your body speaks every day. Our platform translates it.');
    const workspace = readFileSync(
      'src/app/shared/presentation/components/layout/layout.html',
      'utf8',
    );
    expect(workspace).not.toContain('<footer');
    expect(workspace).not.toContain('Your body speaks every day. Our platform translates it.');
  });
});
