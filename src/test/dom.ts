import { JSDOM } from 'jsdom';
import { env } from '@chronocide/dom';

export default (html?: string) => {
  const dom = new JSDOM(html ?? '');
  env.document = dom.window.document;

  return { window: dom.window, document: dom.window.document };
};
