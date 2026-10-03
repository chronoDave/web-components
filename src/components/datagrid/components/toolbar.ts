import h from '@chronocide/dom';

export const view = (id: string) =>
  (values: number[]): HTMLFieldSetElement =>
    h('fieldset')({ name: 'view' })(
      h('label')({ for: `${id}-view` })('Show entries'),
      h('select')({ id: `${id}-view` })(
        h('option')({ value: 0 })('All'),
        ...values.map(value => h('option')({ value })(`${value}`))
      )
    );

export const search = (id: string): HTMLFieldSetElement =>
  h('fieldset')({ name: 'search' })(
    h('label')({ for: `${id}-search` })('Search'),
    h('input')({ id: `${id}-search`, type: 'search' })(),
    h('button')({ type: 'submit' })('Search')
  );

export const output = (id: string): HTMLOutputElement =>
  h('output')({
    'aria-live': 'polite',
    'hidden': true,
    'for': `${id}-view ${id}-search`
  })();

export const navigation = (id: string): HTMLElement =>
  h('nav')({ 'aria-label': 'Pagination' })(
    h('button')({
      'type': 'button',
      'aria-controls': id,
      'data-action': 'previous'
    })('Previous'),
    h('button')({
      'type': 'button',
      'aria-controls': id,
      'data-action': 'next'
    })('Next')
  );

export type ToolbarOptions = {
  id: {
    root: string;
    body: string;
  };
  views?: number[];
  search?: boolean;
};

export default (options: ToolbarOptions): HTMLElement => {
  const hidden = (options.views ?? []).length === 0 && !options.search;

  return h('div')({
    'role': 'toolbar',
    'aria-label': 'Table actions',
    hidden 
  })(
    view(options.id.root)(options.views ?? []),
    search(options.id.root),
    navigation(options.id.body),
    output(options.id.root)
  );
};
