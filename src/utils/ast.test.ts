import { parse } from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { getCallExpressionCalleeName } from './ast';

describe('getCallExpressionCalleeName', () => {
  const parseCode = (code: string) => {
    const ast = parse(code);
    return (ast.body[0] as TSESTree.ExpressionStatement)
      .expression as TSESTree.CallExpression;
  };

  it('should extract name from simple function calls', () => {
    const node = parseCode('someFunction();');
    expect(getCallExpressionCalleeName(node)).toBe('someFunction');
  });

  it('should extract name from method calls', () => {
    const node = parseCode('object.method();');
    expect(getCallExpressionCalleeName(node)).toBe('object.method');
  });

  it('should return null for computed properties', () => {
    const node = parseCode('obj["staticProp"]();');
    expect(getCallExpressionCalleeName(node)).toBe(null);
  });

  it('should return null for nested member expressions', () => {
    const node = parseCode('a.b.c();');
    expect(getCallExpressionCalleeName(node)).toBe(null);
  });

  it('should handle calls with arguments', () => {
    const node = parseCode('test(1, "string", true);');
    expect(getCallExpressionCalleeName(node)).toBe('test');
  });

  it('should handle method calls with arguments', () => {
    const node = parseCode('object.method(1, "string", true);');
    expect(getCallExpressionCalleeName(node)).toBe('object.method');
  });

  it('should return null for immediately invoked function expressions', () => {
    const node = parseCode('(function() {})();');
    expect(getCallExpressionCalleeName(node)).toBe(null);
  });

  it('should return null for arrow function invocations', () => {
    const node = parseCode('(() => {})();');
    expect(getCallExpressionCalleeName(node)).toBe(null);
  });

  it('should return null for call expressions on literals', () => {
    const node = parseCode('(42).toString();');
    expect(getCallExpressionCalleeName(node)).toBe(null);
  });

  it('should handle method calls on this', () => {
    const node = parseCode('this.method();');
    expect(getCallExpressionCalleeName(node)).toBe(null);
  });
});
