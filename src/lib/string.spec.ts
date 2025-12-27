import test from 'node:test';
import assert from 'node:assert/strict';

import * as string from './string.ts';

test('[string.uid] generates unique id\s', () => {
  const ids = Array.from({ length: 1000 }).map(string.uid);

  assert.equal(ids.length, new Set(ids).size);
});
