import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
const root = path.resolve('src/app/modules');
const contexts = ['community', 'iam', 'physiology', 'reports', 'sleep', 'training', 'wellness'];
const layers = ['domain', 'application', 'infrastructure', 'presentation'];
const configFile = ts.readConfigFile('tsconfig.app.json', ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(path.join(directory, entry.name))
      : [path.join(directory, entry.name)],
  );
}
function imports(source: string): string[] {
  const result: string[] = [];
  const file = ts.createSourceFile('source.ts', source, ts.ScriptTarget.Latest, true);
  function visit(node: ts.Node): void {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    )
      result.push(node.moduleSpecifier.text);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteralLike(argument)) result.push(argument.text);
      else result.push('<non-literal import>');
    }
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    )
      result.push(node.argument.literal.text);
    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    )
      result.push(node.moduleReference.expression.text);
    ts.forEachChild(node, visit);
  }
  visit(file);
  return result;
}
function violations(file: string, source: string): string[] {
  const [context, layer] = path.relative(root, file).split(path.sep);
  const errors: string[] = [];
  for (const dependency of imports(source)) {
    const resolved = ts.resolveModuleName(dependency, file, config.options, ts.sys).resolvedModule
      ?.resolvedFileName;
    const target =
      resolved ??
      (dependency.startsWith('.') ? path.resolve(path.dirname(file), dependency) : dependency);
    const targetParts = path.relative(root, target).split(path.sep);
    const reasons: string[] = [];
    if (dependency === '<non-literal import>')
      reasons.push('Import target must be statically verifiable');
    if (
      layer === 'domain' &&
      /^(?:@angular(?:\/|$)|rxjs(?:\/|$)|(?:node:)?https?(?:\/|$)|https?:|axios(?:\/|$)|ky(?:\/|$)|(?:node-)?fetch(?:\/|$)|undici(?:\/|$))/.test(
        dependency,
      )
    )
      reasons.push('Domain depends on a framework or HTTP');
    if (layer === 'domain' && /(?:^|[\/\\])http(?:[.\/\\-]|$)/i.test(target))
      reasons.push('Domain imports HTTP infrastructure');
    if (
      ['presentation', 'application'].includes(layer ?? '') &&
      target.split(/[\/\\]/).includes('infrastructure')
    )
      reasons.push('Use an application port instead of infrastructure');
    if (layer !== 'presentation' && /^@angular\/material(?:\/|$)/.test(dependency))
      reasons.push('Material belongs only in presentation');
    if (contexts.includes(targetParts[0] ?? '') && targetParts[0] !== context)
      reasons.push('Direct dependency on another bounded context');
    for (const reason of reasons)
      errors.push(path.relative(process.cwd(), file) + ' -> ' + dependency + ': ' + reason);
  }
  return errors;
}
describe('DDD architecture', () => {
  it('restricts Material imports to presentation throughout the application', () => {
    const errors = files(path.resolve('src/app'))
      .filter(
        (file) =>
          file.endsWith('.ts') &&
          !file.endsWith('.spec.ts') &&
          !file.split(path.sep).includes('presentation'),
      )
      .flatMap((file) =>
        imports(readFileSync(file, 'utf8'))
          .filter((dependency) => dependency.startsWith('@angular/material'))
          .map((dependency) => path.relative(process.cwd(), file) + ' -> ' + dependency),
      );
    expect(errors, errors.join('\n')).toEqual([]);
  });
  it('keeps exactly seven contexts and their four layers', () => {
    const folders = readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    expect(folders).toEqual(contexts);
    for (const context of contexts)
      for (const layer of layers)
        expect(existsSync(path.join(root, context, layer)), context + '/' + layer).toBe(true);
    expect(
      readdirSync('src/app', { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort(),
    ).toEqual(['assets', 'modules', 'shared']);
  });
  it('enforces dependency directions and context isolation', () => {
    const errors = files(root)
      .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
      .flatMap((file) => violations(file, readFileSync(file, 'utf8')));
    expect(errors, errors.join('\n')).toEqual([]);
  });
  it('detects multiline, dynamic, re-export and cross-context violations', () => {
    const file = path.join(root, 'training/application/example.ts');
    for (const source of [
      "import {\n Repository\n} from '../infrastructure/repository';",
      "const repository = import('../infrastructure/repository');",
      "export * from '../infrastructure/repository';",
      "import { SleepStore } from '../../sleep/application/sleep.store';",
      "import { MatButton } from '@angular/material/button';",
    ])
      expect(violations(file, source), source).not.toEqual([]);
    for (const dependency of ['@angular/core', 'rxjs/operators', 'node:http', 'axios'])
      expect(
        violations(path.join(root, 'training/domain/example.ts'), 'import "' + dependency + '";'),
      ).not.toEqual([]);
    expect(violations(file, "import { Port } from './ports/repository';")).toEqual([]);
  });
});

it('renders PulsePower routes instead of the Angular starter page', () => {
  expect(readFileSync('src/app/app.html', 'utf8').trim()).toBe('<router-outlet />');
  expect(readFileSync('src/index.html', 'utf8')).toContain('<title>PulsePower</title>');
});
