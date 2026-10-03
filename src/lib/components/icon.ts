import { svg } from '@chronocide/dom';

export type IconAttributes = {
  id: string;
  d: string;
  viewbox: string;
};

export type IconState = {
  hidden?: boolean;
};

const icon = (attributes: IconAttributes) =>
  (state?: IconState) => svg('svg')({
    'xmlns': 'http://www.w3.org/2000/svg',
    'class': 'icon',
    'viewBox': attributes.viewbox,
    'width': 16,
    'hidden': state?.hidden,
    'height': 16,
    'aria-hidden': 'true',
    'data-icon': attributes.id
  })(svg('path')({ d: attributes.d })());

export default icon;

/** @see https://fontawesome.com/icons/chevron-left?f=classic&s=solid */
export const chevronLeft = icon({
  id: 'chevron-left',
  viewbox: '0 0 320 512',
  d: 'M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z'
});

/** @see https://fontawesome.com/icons/chevron-right?f=classic&s=solid */
export const chevronRight = icon({
  id: 'chevron-right',
  viewbox: '0 0 320 512',
  d: 'M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z'
});

/** @see https://fontawesome.com/icons/caret-up?f=classic&s=solid */
export const caretUp = icon({
  id: 'caret-up',
  viewbox: '0 0 320 512',
  d: 'M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z'
});

/** @see https://fontawesome.com/icons/caret-down?f=classic&s=solid */
export const caretDown = icon({
  id: 'caret-down',
  viewbox: '0 0 320 512',
  d: 'M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z'
});

/** @see https://fontawesome.com/icons/magnifying-glass?f=classic&s=solid */
export const magnifyingGlass = icon({
  id: 'magnifying-glass',
  viewbox: '0 0 512 512',
  d: 'M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z'
});
