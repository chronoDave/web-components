import * as is from '../../lib/is.ts';
import { maybe } from '../../lib/fn.ts';
import { childIndex } from '../../lib/dom.ts';
import HTMLAbstractElement from '../../lib/element.ts';

import toolbar from './components/toolbar.ts';
import th from './components/th.ts';

type Cell = {
  row: Element | null;
  col: Element | null;
  x: number;
  y: number;
};

export class HTMLDatagridElement extends HTMLAbstractElement {
  static observedAttributes = ['data-index'];

  constructor() {
    super({ children: true });
  }

  /** Get active table cell */
  get #active(): Cell {
    const rows = this.querySelectorAll('tr:not([hidden])');
    const row = document.activeElement?.closest('tr') ?? null;
    const col =
      document.activeElement?.closest('td') ?? // Link
      document.activeElement?.closest('th') ?? // Button
      document.activeElement; // Cell
    const x = maybe(childIndex)(col) ?? 0;
    const y = row ?
      Math.max(0, Array.from(rows).indexOf(row)) :
      0;

    return { row, col, x, y };
  }

  /** Get view size (visible rows) */
  get #view() {
    const select = document.getElementById(`${this.id}-view`) as HTMLSelectElement | null;

    return +(select?.value ?? 0);
  }

  /** Get page count */
  get #max() {
    const rows = this.querySelectorAll('tbody tr:not([data-ignored])');

    return Math.ceil(rows.length / this.#view);
  }

  /** Get page index */
  get #index() {
    return +(this.dataset.index ?? 0);
  }

  /** Set page index */
  set #index(n: number) {
    if (n >= 0 && n < this.#max) this.dataset.index = `${n}`;
  }

  /** Change visible rows */
  #paginate(i: number) {
    const min = this.#view * i;
    const max = this.#view * (i + 1);

    const rows = this.querySelectorAll('tbody tr:not([data-ignored])');
    rows.forEach((tr, i) => {
      const hidden = max === 0 ?
        false :
        i < min || i >= max;
      tr.toggleAttribute('hidden', hidden);
    });

    const status = this.querySelector('[role="toolbar"] output');
    if (status) status.textContent = `Showing ${min + 1} to ${Math.min(max, rows.length)} of ${rows.length} entries`;
  }

  #search(query: string) {
    this.querySelectorAll('tbody tr').forEach(tr => {
      const matches = Array.from(tr.querySelectorAll('td'))
        .some(td => td.textContent.toLocaleLowerCase().includes(query));

      tr.toggleAttribute('data-ignored', !matches);
      tr.toggleAttribute('hidden', true);
    });
  }

  #sort(i: number) {
    const buttons = this.querySelectorAll('th > button');
    buttons.forEach(button => {
      button.setAttribute('aria-sort', 'none');
      button.querySelectorAll('[data-sort]').forEach(icon => icon.toggleAttribute('hidden', true));
    });

    const cell = this.querySelectorAll('th').item(i);
    const descending = cell.getAttribute('aria-sort') === 'descending';
    cell.setAttribute('aria-sort', descending ? 'ascending' : 'descending');
    cell.querySelector('[data-sort="ascending"]')?.toggleAttribute('hidden', descending);
    cell.querySelector('[data-sort="descending"]')?.toggleAttribute('hidden', !descending);

    const type = cell.getAttribute('data-type');
    const text = (row: Element) =>
      (row.children.item(i) as HTMLElement | null)?.textContent ?? '';

    const rows = Array
      .from(this.querySelectorAll('tbody tr'))
      .sort((a, b) => {
        if (type === 'number') {
          if (descending) return +text(b) - +text(a);
          return +text(a) - +text(b);
        }

        if (type === 'string') {
          if (descending) return text(b).localeCompare(text(a));
          return text(a).localeCompare(text(b));
        }

        return 0;
      });
    rows.forEach((tr, i) => {
      // +1 (1-index), +1 (th)
      tr.setAttribute('aria-rowindex', `${i + 2}`);
    });

    const tbody = this.querySelector('tbody');
    tbody?.replaceChildren(...rows);
  }

  protected _init() {
    super._init();

    /**
     * `connectedCallback` gets called every time the element is moved
     * and does not act like a constructor.
     * 
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#lifecycle_callbacks_and_state-preserving_moves
     */
    this.id ||= crypto.randomUUID();

    // Attributes
    const rows = this.querySelectorAll('tr');
    rows.forEach((tr, i) => tr.setAttribute('aria-rowindex', `${i + 1}`));

    const table = this.querySelector('table');

    table?.setAttribute('role', 'grid');
    table?.setAttribute('aria-rowcount', `${rows.length + 1}`);

    const tbody = this.querySelector('tbody');
    tbody?.setAttribute('id', `${this.id}-container`);

    this.querySelectorAll('th').forEach((cell, i) => th({
      type: Array
        .from(this.querySelectorAll(`td:nth-child(${i + 1})`))
        .some(cell => maybe(is.number)(cell.textContent)) ? 'number' : 'string',
      tabindex: i === 0 ? 0 : -1
    })(cell));

    const cells = this.querySelectorAll('td');
    cells.forEach(td => {
      (td.querySelector('a') ?? td).setAttribute('tabindex', '-1');
    });

    // Sort
    const thead = this.querySelector('thead');
    thead?.addEventListener('click', event => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('button') ?? target;

      if (button?.dataset.action === 'sort') {
        const i = maybe(childIndex)(button.closest('th'));

        if (typeof i === 'number') {
          this.#sort(i);
          this.#index = 0;
        }
      }
    }, { passive: true });

    // Keyboard controls
    const createFocus = (event: KeyboardEvent) =>
      (cell: Element) => {
        const root = (cell.querySelector('[tabindex]') ?? cell) as HTMLElement;

        event.preventDefault();
        document.activeElement?.setAttribute('tabindex', '-1');
        root.setAttribute('tabindex', '0');
        root.focus();
      };

    table?.addEventListener('keydown', event => {
      const rows = this.querySelectorAll('tr:not([hidden])');
      const { row, x, y } = this.#active;
      const focus = maybe(createFocus(event));

      /** Move focus to left cell, does not wrap */
      if (
        event.key === 'ArrowLeft' &&
        x !== 0
      ) focus(row?.children.item(x - 1));

      /** Move focus to right cell, does not wrap */
      if (
        event.key === 'ArrowRight' &&
        x < (row?.children.length ?? 0)
      ) focus(row?.children.item(x + 1));

      /**
       * Move focus to previous row (same column),
       * does not change index
       * */
      if (
        event.key === 'ArrowUp' &&
        y > 0
      ) focus(rows.item(y - 1).children.item(x));

      /**
       * Moves focus to next row (same column),
       * does not change index
       */
      if (
        event.key === 'ArrowDown' &&
        y < rows.length - 1
      ) focus(rows.item(y + 1).children.item(x));

      if (
        event.key === 'PageUp' &&
        this.#index > 0
      ) {
        this.#index -= 1;

        const rows = this.querySelectorAll('tr:not([hidden])');
        focus(rows.item(Math.min(rows.length - 1, y)).children.item(x));
      }

      if (
        event.key === 'PageDown' &&
        this.#index < this.#max - 1
      ) {
        this.#index += 1;

        const rows = this.querySelectorAll('tr:not([hidden])');
        focus(rows.item(Math.min(rows.length - 1, y)).children.item(x));
      }

      if (event.key === 'Home') {
        if (event.ctrlKey) {
          this.#index = 0;

          focus(rows.item(0).children.item(0));
        } else {
          focus(row?.children.item(0));
        }
      }

      if (event.key === 'End') {
        if (event.ctrlKey) {
          this.#index = this.#max - 1;

          const rows = this.querySelectorAll('tr:not([hidden])');
          const row = rows.item(rows.length - 1);
          focus(row.children.item(row.children.length - 1));
        } else {
          focus(row?.children.item(row.children.length - 1));
        }
      }
    });

    this.prepend(toolbar({
      id: {
        root: this.id,
        body: `${this.id}-body`
      },
      views: [10, 25, 50],
      search: true
    }));
    this.querySelectorAll('option').item(2).setAttribute('selected', 'true');

    document.getElementById(`${this.id}-view`)?.addEventListener('change', () => {
      this.#paginate(Math.min(this.#index, this.#max));

      if (this.querySelector('table [tabindex="0"]')?.closest('tr')?.hidden) {
        this.querySelector('table th button')?.setAttribute('tabindex', '0');
      }
    }, { passive: true });

    const inputSearch = document.querySelector<HTMLInputElement>('[role="toolbar"] [name="search"] input');
    inputSearch?.addEventListener('change', () => {
      this.#search(inputSearch.value.toLocaleLowerCase());
      this.#index = 0;
    }, { passive: true });
    document.querySelector('[role="toolbar"] [name="search"] button')?.addEventListener('click', () => {
      this.#search(inputSearch?.value.toLocaleLowerCase() ?? '');
      this.#index = 0;
    }, { passive: true });

    // Pagination
    this.querySelector('[role="toolbar"] nav button[data-action="previous"]')?.addEventListener('click', () => {
      this.#index -= 1;
    }, { passive: true });

    this.querySelector('[role="toolbar"] nav button[data-action="next"]')?.addEventListener('click', () => {
      this.#index += 1;
    }, { passive: true });

    this.#paginate(0);
  }

  attributeChangedCallback(attribute: string) {
    if (attribute === 'data-index') this.#paginate(this.#index);
  }
}