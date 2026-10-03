import fsp from 'fs/promises';
import path from 'path';
import esbuild from 'esbuild';
import { JSDOM } from 'jsdom';

/** Create JSDOM and initialize web component */
export const dom = async (file: string) => {
  const { name } = path.parse(file);
  const { outputFiles: [{ text }] } = await esbuild.build({
    entryPoints: [file],
    outdir: 'tmp',
    platform: 'browser',
    format: 'iife',
    globalName: 'components',
    bundle: true,
    write: false
  });

  const id = `chrono-${name}`;
  const script = `<script>${text};customElements.define("${id}", components.HTML${name[0].toUpperCase()}${name.slice(1)}Element)</script>`;

  return async (html: string) => {
    const dom = new JSDOM(`${html}${script}`, { runScripts: 'dangerously' });
    await dom.window.customElements.whenDefined(id);

    return { window: dom.window, document: dom.window.document };
  };
};

export default (dir: string) =>
  async (name: string) => {
    const [struct, html] = await Promise.all([
      dom(path.join(dir, `${name}.ts`)),
      fsp.readFile(path.join(dir, `${name}.struct.html`), 'utf-8')
    ]);

    return struct(html);
  };
