import h from '@chronocide/hyper';

/** Get index of child in children */
export const childIndex = (child: Element): number | null => Array
  .from(child.parentElement?.children ?? [])
  .indexOf(child);

/** Wrap element within `div` */
export const wrap = (root: Element) => {
  const wrapper = h('div')()();
  root.parentElement?.insertBefore(wrapper, root);
  wrapper.appendChild(root);

  return wrapper;
};
