import type { DOMWindow } from 'jsdom';

const dispatchMouseEvent = (type: string) =>
  (window: DOMWindow) =>
    (element: Element | null) =>
      element?.dispatchEvent(new window.MouseEvent(type, { bubbles: true }));

export const click = dispatchMouseEvent('click');

const dispatchKeyboardEvent = (type: string) =>
  (key: string, options?: Partial<KeyboardEvent>) =>
    (window: DOMWindow) =>
      (element: Element | null) =>
        element?.dispatchEvent(new window.KeyboardEvent(type, { ...options, key, bubbles: true }));

const dispatchKeyDownEvent = dispatchKeyboardEvent('keydown');

export const arrowLeft = dispatchKeyDownEvent('ArrowLeft');
export const arrowRight = dispatchKeyDownEvent('ArrowRight');
export const arrowUp = dispatchKeyDownEvent('ArrowUp');
export const arrowDown = dispatchKeyDownEvent('ArrowDown');
export const pageUp = dispatchKeyDownEvent('PageUp');
export const pageDown = dispatchKeyDownEvent('PageDown');
export const home = dispatchKeyDownEvent('Home');
export const end = dispatchKeyDownEvent('End');
export const ctrlHome = dispatchKeyDownEvent('Home', { ctrlKey: true });
export const ctrlEnd = dispatchKeyDownEvent('End', { ctrlKey: true });
