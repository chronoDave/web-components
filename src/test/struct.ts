import fsp from 'fs/promises';
import path from 'path';
import h, { env } from '@chronocide/hyper';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

/**
 * Create JSDOM context and initialize Web Component.
*/
export default async (file: URL) => {
  const name = path.parse(fileURLToPath(file)).name.replace('.struct', '');
  const id = `chrono-${name}`;
  const [raw, struct] = await Promise.all([
    fsp.readFile(path.join(process.cwd(), `dist/${name}.js`), 'utf-8'),
    fsp.readFile(file, 'utf-8')
  ]);

  const dom = new JSDOM(`${struct}<script>${raw.replace(/export.*/, '')};customElements.define("${id}", HTML${name[0].toUpperCase()}${name.slice(1)}Element);</script>`, {
    runScripts: 'dangerously'
  });
    
  await dom.window.customElements.whenDefined(id);

  return { window: dom.window, document: dom.window.document };
};

export const element = () => {
  const dom = new JSDOM();
  env.document = dom.window.document;

  return h;
};
