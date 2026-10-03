import type { TestContext } from 'node:test';

import test from 'node:test';

import dom from '../../../test/dom.ts';

import toolbar, { view, search, output, navigation } from './toolbar.ts';

test('toolbar.view', t => {
  t.test('html', t => {
    dom();
    const root = view('a')([]);

    t.assert.equal(root.getAttribute('name'), 'view', 'fieldset name');
    t.assert.equal(root.querySelector('label')?.getAttribute('for'), 'a-view', 'label for');
    t.assert.equal(root.querySelector('select')?.getAttribute('id'), 'a-view', 'select id');
  });

  t.test('empty', () => {
    dom();
    const options = view('a')([]).querySelectorAll('option');

    t.assert.equal(options.length, 1, 'size');
    t.assert.equal(options.item(0).value, '0', 'value');
    t.assert.equal(options.item(0).textContent, 'All', 'label');
  });

  t.test('values', () => {
    dom();
    const options = view('a')([5, 10, 20]).querySelectorAll('option');

    t.assert.equal(options.length, 4, 'size');
    t.assert.equal(options.item(1).value, '5', 'value');
    t.assert.equal(options.item(2).textContent, '10', 'label');
  });
});

test('toolbar.search', t => {
  dom();
  const root = search('a');

  t.assert.equal(root.getAttribute('name'), 'search', 'fieldset name');
  t.assert.equal(root.querySelector('label')?.getAttribute('for'), 'a-search', 'label for');
  t.assert.equal(root.querySelector('input')?.getAttribute('id'), 'a-search', 'input id');
  t.assert.equal(root.querySelector('button')?.getAttribute('type'), 'submit', 'button type');
});

test('toolbar.output', (t: TestContext) => {
  dom();
  const root = output('a');

  t.assert.equal(root.getAttribute('aria-live'), 'polite', 'aria-live');
  t.assert.equal(root.getAttribute('for'), 'a-view a-search', 'for');
  t.assert.ok(root.hasAttribute('hidden'), 'hidden');
});

test('toolbar.navigation', (t: TestContext) => {
  dom();
  const root = navigation('a');
  const previous = root.querySelector('button[data-action="previous"]');
  const next = root.querySelector('button[data-action="next"]');

  t.assert.ok(root.hasAttribute('aria-label'), 'aria-label');
  t.assert.equal(previous?.getAttribute('type'), 'button', 'previous type');
  t.assert.equal(previous?.getAttribute('aria-controls'), 'a', 'previous aria-controls');
  t.assert.equal(next?.getAttribute('type'), 'button', 'next type');
  t.assert.equal(next?.getAttribute('aria-controls'), 'a', 'next aria-controls');
});

test('toolbar', (t: TestContext) => {
  /** @see https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#wai-ariaroles,states,andproperties */
  t.test('html', () => {
    dom();
    const root = toolbar({ id: { root: 'a', body: 'b' } });

    t.assert.equal(root.getAttribute('role'), 'toolbar', 'role');
    t.assert.ok(root.hasAttribute('aria-label'), 'aria-label');
  });

  t.test('empty', () => {
    dom();

    t.assert.ok(toolbar({ id: { root: 'a', body: 'b' } }).hasAttribute('hidden'), 'hidden');
  });

  t.test('view', () => {
    dom();
    const root = toolbar({ id: { root: 'a', body: 'b' }, views: [1, 2, 3] });

    t.assert.ok(!root.hasAttribute('hidden'), 'not hidden');
    t.assert.equal(root.querySelectorAll('option').length, 4, 'options');
  });

  t.test('search', () => {
    dom();
    const root = toolbar({ id: { root: 'a', body: 'b' }, search: true });

    t.assert.ok(!root.hasAttribute('hidden'), 'not hidden');
    t.assert.ok(root.querySelector('input[type="search"]'), 'search');
  });
});
