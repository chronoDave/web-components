import test from 'node:test';
import assert from 'node:assert/strict';

import * as fn from './fn.ts';

test('[fn.maybe]', () => {
  const x = (i: number) => i;

  assert.equal(fn.maybe(x)(0), 0, 'value');
  assert.equal(fn.maybe(x)(null), null, 'null');
  assert.equal(fn.maybe(x)(undefined), null, 'undefined');
});

test('[fn.always]', () => {
  const always = fn.always(new Error());

  assert.doesNotThrow(() => always(1), 'values');
  assert.throws(() => always(null), 'null');
  assert.throws(() => always(undefined), 'undefined');
});
