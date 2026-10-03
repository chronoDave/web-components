import h from '@chronocide/dom';

import * as icon from '../../../lib/components/icon.ts';

export type ToolbarOptions = {
  views?: number[];
  search?: boolean;
};

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
    h('button')({ type: 'submit' })(
      icon.magnifyingGlass(),
      h('span')({ class: 'sr-only' })('Search')
    )
  );

export default (id: string, options?: ToolbarOptions): HTMLElement =>
  h('div')({
    'role': 'toolbar',
    'aria-label': 'Table actions',
    'hidden': (options?.views ?? []).length === 0 && !options?.search
  })(
    view(id)(options?.views ?? []),
    search(id)
  );
