import fsp from 'fs/promises';
import path from 'path';
import esbuild from 'esbuild';
import h, { env } from '@chronocide/dom';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

/**
 * Create JSDOM context and initialize Web Component.
*/
export default async (file: URL) => {
  const name = path.parse(fileURLToPath(file)).name.replace('.struct', '');
  const [bundle, struct] = await Promise.all([
    esbuild.build({
      entryPoints: [`src/components/${name}/${name}.ts`],
      outdir: 'tmp',
      platform: 'browser',
      format: 'iife',
      globalName: 'components',
      bundle: true,
      write: false
    }),
    fsp.readFile(file, 'utf-8')
  ]);

  const id = `chrono-${name}`;
  const element = `HTML${name[0].toUpperCase()}${name.slice(1)}Element`;
  const html = `${struct}<script>${bundle.outputFiles[0].text};customElements.define("${id}", components.${element})</script>`;

  return async () => {
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    await dom.window.customElements.whenDefined(id);

    return { window: dom.window, document: dom.window.document };
  };
};

export const element = () => {
  const dom = new JSDOM();
  env.document = dom.window.document;

  return h;
};
