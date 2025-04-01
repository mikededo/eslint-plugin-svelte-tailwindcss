import type { TSESTree } from '@typescript-eslint/types';

import { SEP_REGEX } from './constants';

export const getCallExpressionCalleeName = ({ callee: node }: TSESTree.CallExpression) => {
  if (node.type === 'Identifier') {
    return node.name;
  }

  if (node.type === 'MemberExpression') {
    if ('name' in node.object && 'name' in node.property) {
      return `${node.object.name}.${node.property.name}`;
    }
  }

  return null;
};

export const getTemplateElementPrefix = (text: string, raw: string) =>
  text.indexOf(raw) === 0 ? '' : text.split(raw).shift();

export const getTemplateElementSuffix = (text: string, raw: string) =>
  !text.includes(raw) ? '' : text.split(raw).pop();

export const getTemplateElementBody = (text: string, prefix: string, suffix: string) => {
  let arr = text.split(prefix);
  arr.shift();

  const body = arr.join(prefix);
  arr = body.split(suffix);

  arr.pop();
  return arr.join(suffix);
};

export const extractClassnamesFromValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return { classNames: [], headSpace: false, tailSpace: false, whitespaces: [] };
  }

  const parts = value.split(SEP_REGEX);
  if (parts[0] === '') {
    parts.shift();
  }

  if (parts[parts.length - 1] === '') {
    parts.pop();
  }

  const headSpace = SEP_REGEX.test(parts[0]);
  const tailSpace = SEP_REGEX.test(parts[parts.length - 1]);

  return {
    classNames: parts.filter((_, i) => (headSpace ? i % 2 !== 0 : i % 2 === 0)),
    headSpace,
    tailSpace,
    whitespaces: parts.filter((_, i) => (headSpace ? i % 2 === 0 : i % 2 !== 0))
  };
};
