import type { TestContext } from 'node:test';

import test from 'node:test';
import h from '@chronocide/dom';

import dom from '../../../test/dom.ts';

import th from './th.ts';

test('th', (t: TestContext) => {
  dom();

  const root = h('th')()(h('span')()('abc'));
  th({ type: 'number', tabindex: 0 })(root);

  const button = root.querySelector('button');

  t.assert.ok(root.querySelector('span'), 'children');
  t.assert.equal(button?.getAttribute('type'), 'button', 'button type');
  t.assert.equal(button?.getAttribute('data-action'), 'sort', 'button data-action');
  t.assert.equal(button?.getAttribute('tabindex'), '0', 'button tabindex');
  t.assert.ok(root.querySelector('span[data-sort="ascending"]'), 'data-sort ascending');
  t.assert.ok(root.querySelector('span[data-sort="descending"]'), 'data-sort descending');
});
