import { suite, test } from 'node:test';
import assert from 'node:assert/strict';

import { maybe } from '../../lib/fn.ts';
import * as event from '../../test/event.ts';
import struct from '../../test/struct.ts';

const { document, window } = await struct(new URL('datagrid.struct.html', import.meta.url));

/** @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/#wai-ariaroles,states,andproperties */
suite('[datagrid] creates accessible HTML', () => {
  test('has role', () => {
    assert.ok(document.querySelector('[role="grid"]'));
  });

  test('has rows', () => {
    const rows = document.querySelectorAll('[role="grid"] tr');

    assert.ok(rows.length > 0);
  });

  test('has cells', () => {
    const cells = document.querySelectorAll('[role="grid"] tr td');

    assert.ok(cells.length > 0);
  });

  test('has label', () => {
    assert.ok(document.querySelector('[role="grid"][aria-label],[role="grid"][aria-labelledby]'));
  });

  test('has aria-sort on table header', () => {
    assert.ok(document.querySelector('[role="grid"] th[aria-sort]'));
  });

  test('has aria-rowcount, aria-rowindex', () => {
    assert.ok(document.querySelector('[role="grid"][aria-rowcount]'));
    assert.ok(document.querySelector('[role="grid"] tr[aria-rowindex]'));
    assert.ok(!document.querySelector('[role="grid"] tr[aria-rowindex="0"]'), 'index 1');
  });
});

/** @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/#datagridsforpresentingtabularinformation */
suite('[datagrid] implements keyboard controls', () => {
  const datagrid = document.querySelector('[role="grid"]');
  datagrid?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();

  test('Right arrow moves one cell to the right', () => {
    event.arrowRight(window)(datagrid);

    assert.equal(
      document.querySelector('th:nth-child(2) button'),
      document.activeElement
    );
  });

  test('Left arrow moves one cell to the left', () => {
    event.arrowLeft(window)(datagrid);

    assert.equal(
      document.querySelector('th button'),
      document.activeElement
    );
  });

  test('Down arrow moves one cell down', () => {
    event.arrowDown(window)(datagrid);

    assert.equal(
      document.querySelector('td'),
      document.activeElement
    );
  });

  test('Up arrow moves one cell up', () => {
    event.arrowUp(window)(datagrid);

    assert.equal(
      document.querySelector('th button'),
      document.activeElement
    );
  });

  test('Home moves to first cell in row', () => {
    event.arrowDown(window)(datagrid);
    event.arrowRight(window)(datagrid);
    event.home(window)(datagrid);

    assert.equal(
      document.querySelector('td'),
      document.activeElement
    );
  });

  test('End moves to last cell in row', () => {
    event.end(window)(datagrid);

    assert.equal(
      document.querySelector('tr td:last-child'),
      document.activeElement
    );
  });

  test('Control home moves to first cell in table', () => {
    event.ctrlHome(window)(datagrid);

    assert.equal(
      document.querySelector('th button'),
      document.activeElement
    );
  });

  test('Control end moves to last cell in table', () => {
    event.ctrlEnd(window)(datagrid);

    assert.equal(
      document.querySelector('tr:last-child td:last-child'),
      document.activeElement
    );
  });

  test('Page up moves up one page', () => {
    event.pageUp(window)(datagrid);
  
    assert.equal(
      +(document.querySelector<HTMLElement>('chrono-datagrid')?.dataset.index ?? 0),
      92
    );
    assert.equal(
      document.querySelectorAll('tr:not([hidden])').item(6).children.item(9),
      document.activeElement
    );
  });

  test('Page down moves down one page', () => {
    event.pageDown(window)(datagrid);

    assert.equal(
      +(document.querySelector<HTMLElement>('chrono-datagrid')?.dataset.index ?? 0),
      93
    );
    assert.equal(
      document.querySelector('tr:last-child td:last-child'),
      document.activeElement
    );
  });
});

suite('[datagrid] implements sorting', () => {
  test('does not show caret', () => {
    assert.equal(document.querySelectorAll('thead [data-icon]:not([hidden])').length, 0);
  });

  test('changes caret down on click', () => {
    const button = document.querySelector<HTMLButtonElement>('thead button');

    button?.click();
    assert.ok(button?.querySelector('[data-icon="caret-up"]:not([hidden])'));
    button?.click();
    assert.ok(button?.querySelector('[data-icon="caret-down"]:not([hidden])'));
    button?.click();
    assert.ok(button?.querySelector('[data-icon="caret-up"]:not([hidden])'));
  });

  test('moves caret on click', () => {
    const buttons = document.querySelectorAll<HTMLButtonElement>('thead button');

    buttons.item(0).click();
    buttons.item(3).click();
    assert.equal(document.querySelectorAll('thead [data-icon]:not([hidden])').length, 1);
    assert.ok(buttons.item(3).querySelector('[data-icon="caret-up"]:not([hidden])'));
  });

  test('sorts string', () => {
    document.querySelector<HTMLButtonElement>('[data-type="string"] [data-action="sort"]')?.click();
    assert.equal(document.querySelector('td')?.textContent, 'Aachen');
    document.querySelector<HTMLButtonElement>('[data-type="string"] [data-action="sort"]')?.click();
    assert.equal(document.querySelector('td')?.textContent, 'Zvonkov');
  });

  test('sorts number', () => {
    document.querySelector<HTMLButtonElement>('[data-type="number"] [data-action="sort"]')?.click();
    assert.equal(document.querySelector('tr td:nth-child(2)')?.textContent, '1');
    document.querySelector<HTMLButtonElement>('[data-type="number"] [data-action="sort"]')?.click();
    assert.equal(document.querySelector('tr td:nth-child(2)')?.textContent, '57354');
  });
});

suite('[datagrid] implements searching', () => {
  test('filters non-matching results', () => {
    const input = document.querySelector<HTMLInputElement>('input[type="search"]');
    if (!input) assert.fail('Missing input');

    input.value = 'Os';
    maybe(event.click(window))(document.querySelector('.search > button'));

    assert.equal(
      document.querySelectorAll('tr:not([hidden])').length,
      26 // 25 + 1 (th)
    );
    assert.ok(document.querySelector('.status')?.textContent.includes('35'));
  });
});
