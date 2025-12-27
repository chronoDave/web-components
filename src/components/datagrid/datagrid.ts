import h from '@chronocide/hyper';

import { uid } from '../../lib/string.ts';
import * as is from '../../lib/is.ts';
import { maybe } from '../../lib/fn.ts';
import { childIndex, wrap } from '../../lib/dom.ts';
import * as icon from '../../lib/components/icon.ts';
import buttonIcon from '../../lib/components/button-icon.ts';

type Cell = {
  row: Element | null;
  col: Element | null;
  x: number;
  y: number;
};

export class HTMLDatagridElement extends HTMLElement {
  static observedAttributes = ['data-index'];

  private _initialised: boolean;

  /** Get active table cell */
  private get _active(): Cell {
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
  private get _view() {
    const select = document.getElementById(`${this.id}-view`) as HTMLSelectElement | null;
    
    return +(select?.value ?? 0);
  }

  /** Get page count */
  private get _max() {
    const rows = this.querySelectorAll('tbody tr:not([data-ignored])');

    return Math.ceil(rows.length / this._view);
  }

  /** Get page index */
  private get _index() {
    return +(this.dataset.index ?? 0);
  }

  /** Set page index */
  private set _index(n: number) {
    if (n >= 0 && n < this._max) this.dataset.index = `${n}`;
  }

  /** Change visible rows */
  private _paginate(i: number) {
    const min = this._view * i;
    const max = this._view * (i + 1);

    const rows = this.querySelectorAll('tbody tr:not([data-ignored])');
    rows.forEach((tr, i) => {
      const hidden = max === 0 ?
        false :
        i < min || i >= max;
      tr.toggleAttribute('hidden', hidden);
    });

    const status = this.querySelector<HTMLParagraphElement>('.status');
    if (status) status.textContent = `Showing ${min + 1} to ${Math.min(max, rows.length)} of ${rows.length} entries`;
  }

  private _search(query: string) {
    this.querySelectorAll('tbody tr').forEach(tr => {
      const matches = Array.from(tr.querySelectorAll('td'))
        .some(td => td.textContent.toLocaleLowerCase().includes(query));

      tr.toggleAttribute('data-ignored', !matches);
      tr.toggleAttribute('hidden', true);
    });
  }

  private _sort(i: number) {
    const buttons = this.querySelectorAll('th > button');
    buttons.forEach(button => {
      button.setAttribute('aria-sort', 'none');
      button.querySelectorAll('[data-icon]').forEach(icon => icon.toggleAttribute('hidden', true));
    });

    const cell = this.querySelectorAll('th').item(i);
    const descending = cell.getAttribute('aria-sort') === 'descending';
    cell.setAttribute('aria-sort', descending ? 'ascending' : 'descending');
    cell.querySelector('[data-icon="caret-up"]')?.toggleAttribute('hidden', descending);
    cell.querySelector('[data-icon="caret-down"]')?.toggleAttribute('hidden', !descending);

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

  constructor() {
    super();

    this._initialised = false;
  }

  connectedCallback() {
    /**
     * `connectedCallback` gets called every time the element is moved
     * and does not act like a constructor.
     * 
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#lifecycle_callbacks_and_state-preserving_moves
     */
    if (this._initialised) return;
    this._initialised = true;

    if (this.id === '') this.id = uid();
    
    // Attributes
    const rows = this.querySelectorAll('tr');
    rows.forEach((tr, i) => tr.setAttribute('aria-rowindex', `${i + 1}`));
    
    const table = this.querySelector('table');
    table?.setAttribute('role', 'grid');
    table?.setAttribute('aria-rowcount', `${rows.length + 1}`);
    if (table?.getAttribute('aria-label') === null) table.setAttribute('aria-labelledby', `${this.id}-label`);

    const tbody = this.querySelector('tbody');
    tbody?.setAttribute('id', `${this.id}-container`);

    const ths = this.querySelectorAll('th');
    ths.forEach((th, i) => {
      th.setAttribute('aria-sort', 'none');

      const cells = Array.from(this.querySelectorAll(`td:nth-child(${i + 1})`));
      th.setAttribute('data-type', cells.some(cell => maybe(is.number)(cell.textContent)) ? 'number' : 'string');

      th.replaceChildren(h('button')({
        'type': 'button',
        'data-action': 'sort',
        'tabindex': i === 0 ? '0' : '-1'
      })(
        icon.caretUp({ hidden: true }),
        icon.caretDown({ hidden: true }),
        ...th.childNodes
      ));
    });

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
          this._sort(i);
          this._index = 0;
        }
      }
    }, { passive: true });

    // Wrap
    const wrapper = maybe(wrap)(table);
    wrapper?.classList.add('datagrid');
    if (wrapper) this.append(wrapper);

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
      const { row, x, y } = this._active;
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
        this._index > 0
      ) {
        this._index -= 1;

        const rows = this.querySelectorAll('tr:not([hidden])');
        focus(rows.item(Math.min(rows.length - 1, y)).children.item(x));
      }

      if (
        event.key === 'PageDown' &&
        this._index < this._max - 1
      ) {
        this._index += 1;

        const rows = this.querySelectorAll('tr:not([hidden])');
        focus(rows.item(Math.min(rows.length - 1, y)).children.item(x));
      }

      if (event.key === 'Home') {
        if (event.ctrlKey) {
          this._index = 0;

          focus(rows.item(0).children.item(0));
        } else {
          focus(row?.children.item(0));
        }
      }

      if (event.key === 'End') {
        if (event.ctrlKey) {
          this._index = this._max - 1;

          const rows = this.querySelectorAll('tr:not([hidden])');
          const row = rows.item(rows.length - 1);
          focus(row.children.item(row.children.length - 1));
        } else {
          focus(row?.children.item(row.children.length - 1));
        }
      }
    });

    // Search
    const inputSearch = h('input')({ type: 'search', id: `${this.id}-search` })();
    const buttonSearch = buttonIcon(icon.magnifyingGlass())(`${this.id}-search`)('Search');
    const search = () => {
      this._search(inputSearch.value.toLocaleLowerCase());
      this._index = 0;
    };
    inputSearch.addEventListener('change', search, { passive: true });
    buttonSearch.addEventListener('click', search, { passive: true });

    // Toolbar
    const selectView = h('select')({ id: `${this.id}-view` })(
      h('option')({ value: 10 })('10'),
      h('option')({ value: 25, selected: true })('25'),
      h('option')({ value: 50 })('50'),
      h('option')({ value: 0 })('All')
    );
    selectView.addEventListener('change', () => {
      this._paginate(Math.min(this._index, this._max));

      if (this.querySelector('table [tabindex="0"]')?.closest('tr')?.hidden) {
        this.querySelector('table th button')?.setAttribute('tabindex', '0');
      }
    }, { passive: true });
    this.prepend(h('div')({ class: 'toolbar' })(
      h('div')({ class: 'view' })(
        h('label')({ for: `${this.id}-view` })('Show entries'),
        selectView
      ),
      h('div')({ class: 'search' })(
        h('label')({ for: `${this.id}-search` })('Search'),
        inputSearch,
        buttonSearch
      )
    ));

    // Pagination
    const buttonPrevious = buttonIcon(icon.chevronLeft())(`${this.id}-container`)('Previous');
    buttonPrevious.addEventListener('click', () => {
      this._index -= 1;
    }, { passive: true });
    const buttonNext = buttonIcon(icon.chevronRight())(`${this.id}-container`)('Next');
    buttonNext.addEventListener('click', () => {
      this._index += 1;
    }, { passive: true });

    // Footer
    this.appendChild(h('div')({ class: 'footer' })(
      h('p')({ class: 'status' })(),
      h('div')({ class: 'controls' })(buttonPrevious, buttonNext)
    ));

    this._paginate(0);
  }

  attributeChangedCallback(attribute: string) {
    if (attribute === 'data-index') this._paginate(this._index);
  }
}