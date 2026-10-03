import type { TestContext } from 'node:test';

import test from 'node:test';

import { maybe } from '../../lib/fn.ts';
import * as event from '../../test/event.ts';
import struct from '../../test/component.ts';

test('datagrid', async (t: TestContext) => {
  const { window, document } = await struct(import.meta.dirname)('datagrid');

  /** @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/#wai-ariaroles,states,andproperties */
  t.test('html', () => {
    t.assert.ok(document.querySelector('[role="grid"]'), 'role');

    const rows = document.querySelectorAll('[role="grid"] tr');
    t.assert.ok(rows.length > 0, 'rows');

    const cells = document.querySelectorAll('[role="grid"] tr td');
    t.assert.ok(cells.length > 0, 'cells');

    t.assert.ok(document.querySelector('[role="grid"] th[aria-sort]'), 'aria-sort');
    t.assert.ok(document.querySelector('[role="grid"][aria-rowcount]'), 'aria-rowcount');
    t.assert.ok(document.querySelector('[role="grid"] tr[aria-rowindex]'), 'aria-rowindex');
    t.assert.ok(!document.querySelector('[role="grid"] tr[aria-rowindex="0"]'), 'aria-rowindex offset');
  });

  /** @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/#datagridsforpresentingtabularinformation */
  t.test('keyboard controls', () => {
    const datagrid = document.querySelector('[role="grid"]');
    datagrid?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();

    event.arrowRight(window)(datagrid);
    t.assert.equal(
      document.querySelector('th:nth-child(2) button'),
      document.activeElement,
      'right arrow +x'
    );

    event.arrowLeft(window)(datagrid);
    t.assert.equal(
      document.querySelector('th button'),
      document.activeElement,
      'left arrow -x'
    );

    event.arrowDown(window)(datagrid);
    t.assert.equal(
      document.querySelector('td'),
      document.activeElement,
      'down arrow +y'
    );

    event.arrowUp(window)(datagrid);
    t.assert.equal(
      document.querySelector('th button'),
      document.activeElement,
      'up arrow -y'
    );

    event.arrowDown(window)(datagrid);
    event.arrowRight(window)(datagrid);
    event.home(window)(datagrid);

    t.assert.equal(
      document.querySelector('td'),
      document.activeElement,
      'home x=min'
    );

    event.end(window)(datagrid);
    t.assert.equal(
      document.querySelector('tr td:last-child'),
      document.activeElement,
      'home x=max'
    );

    event.ctrlHome(window)(datagrid);
    t.assert.equal(
      document.querySelector('th button'),
      document.activeElement,
      'ctrl + home xy=0,0'
    );

    event.ctrlEnd(window)(datagrid);
    t.assert.equal(
      document.querySelector('tr:last-child td:last-child'),
      document.activeElement,
      'ctrl + end xy=max,max'
    );

    event.pageUp(window)(datagrid);
    t.assert.equal(
      document.querySelectorAll('tr:not([hidden])').item(6).children.item(9),
      document.activeElement,
      'page up -y'
    );
    t.assert.equal(
      +(document.querySelector<HTMLElement>('chrono-datagrid')?.dataset.index ?? 0),
      92,
      'page up [data-index]'
    );


    event.pageDown(window)(datagrid);
    t.assert.equal(
      document.querySelector('tr:last-child td:last-child'),
      document.activeElement,
      'page down +y'
    );
    t.assert.equal(
      +(document.querySelector<HTMLElement>('chrono-datagrid')?.dataset.index ?? 0),
      93,
      'page down [data-index]'
    );
  });

  t.test('sort', () => {
    t.assert.equal(document.querySelectorAll('thead [data-sort]:not([hidden])').length, 0, 'caret hidden');

    const button = document.querySelector<HTMLButtonElement>('thead button');
    button?.click();
    t.assert.ok(button?.querySelector('[data-sort="ascending"]:not([hidden])'), 'sort ascending');
    button?.click();
    t.assert.ok(button?.querySelector('[data-sort="descending"]:not([hidden])'), 'sort descending');
    button?.click();
    t.assert.ok(button?.querySelector('[data-sort="ascending"]:not([hidden])'), 'sort ascending');

    const buttons = document.querySelectorAll<HTMLButtonElement>('thead button');
    buttons.item(0).click();
    buttons.item(3).click();
    t.assert.equal(document.querySelectorAll('thead [data-sort]:not([hidden])').length, 1, 'has caret');
    t.assert.ok(buttons.item(3).querySelector('[data-sort="ascending"]:not([hidden])'), 'caret column');

    document.querySelector<HTMLButtonElement>('[data-type="string"] [data-action="sort"]')?.click();
    t.assert.equal(document.querySelector('td')?.textContent, 'Aachen', 'a-z');
    document.querySelector<HTMLButtonElement>('[data-type="string"] [data-action="sort"]')?.click();
    t.assert.equal(document.querySelector('td')?.textContent, 'Zvonkov', 'z-a');

    document.querySelector<HTMLButtonElement>('[data-type="number"] [data-action="sort"]')?.click();
    t.assert.equal(document.querySelector('tr td:nth-child(2)')?.textContent, '1', '0-9');
    document.querySelector<HTMLButtonElement>('[data-type="number"] [data-action="sort"]')?.click();
    t.assert.equal(document.querySelector('tr td:nth-child(2)')?.textContent, '57354', '9-0');
  });

  t.test('search', () => {
    const input = document.querySelector<HTMLInputElement>('input[type="search"]');
    if (!input) t.assert.fail('Missing input');

    input.value = 'Os';
    maybe(event.click(window))(document.querySelector('[name="search"] button'));

    t.assert.equal(
      document.querySelectorAll('tbody tr:not([hidden])').length,
      25,
      'filters'
    );
    t.assert.ok(document.querySelector('[role="toolbar"] output')?.textContent.includes('35'), 'total');
  });
});
