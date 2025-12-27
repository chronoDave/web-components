import h from '@chronocide/hyper';

export default (icon: SVGElement) =>
  (id: string) =>
    (label: string) =>
      h('button')({
        'type': 'button',
        'aria-controls': id
      })(icon, h('span')({ class: 'sr-only' })(label));
