import test from 'node:test';
import assert from 'node:assert/strict';

import * as is from './is.ts';

test('[is.number] returns boolean if string is number', () => {
  assert.equal(is.number('1'), true, '1');
  assert.equal(is.number('0'), true, '0');
  assert.equal(is.number('-1'), true, '-1');
  assert.equal(is.number('0.5'), true, '0.5');
  assert.equal(is.number('Five'), false, 'Five');
  assert.equal(is.number('000'), true, '000');
  assert.equal(is.number('01'), true, '01');
});
