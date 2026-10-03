import test from 'node:test';

import * as is from './is.ts';

test('is.number', t => {
  t.assert.equal(is.number('1'), true, '1');
  t.assert.equal(is.number('0'), true, '0');
  t.assert.equal(is.number('-1'), true, '-1');
  t.assert.equal(is.number('0.5'), true, '0.5');
  t.assert.equal(is.number('Five'), false, 'Five');
  t.assert.equal(is.number('000'), true, '000');
  t.assert.equal(is.number('01'), true, '01');
});
