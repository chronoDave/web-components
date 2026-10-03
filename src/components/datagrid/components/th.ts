import h from '@chronocide/dom';

export type TableHeadingOptions = {
  type: string;
  tabindex: number;
};

/** In-place enhance `th` element to sortable `th` */
export default (options: TableHeadingOptions) =>
  (th: HTMLTableCellElement): void => {
    th.setAttribute('aria-sort', 'none');
    th.setAttribute('data-type', options.type);

    th.replaceChildren(h('button')({
      'type': 'button',
      'data-action': 'sort',
      'tabindex': options.tabindex
    })(
      h('span')({ 'hidden': true, 'data-sort': 'ascending' })('↑'),
      h('span')({ 'hidden': true, 'data-sort': 'descending' })('↓'),
      ...th.childNodes
    ));
  };
