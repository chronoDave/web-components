/** Get index of child in children */
export const childIndex = (child: Element): number | null => Array
  .from(child.parentElement?.children ?? [])
  .indexOf(child);
