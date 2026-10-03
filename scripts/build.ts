import esbuild from 'esbuild';
import { exec } from 'node:child_process';

const run = async (cmd: string) =>
  new Promise<void>((resolve, reject) => exec(cmd, err => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  }));

const component = async (name: string) => Promise.all([
  esbuild.build({
    entryPoints: [`src/components/${name}/${name}.ts`],
    external: ['@chronocide/dom'],
    outdir: 'dist',
    platform: 'node',
    bundle: true,
    format: 'esm'
  }),
  run(`dts-bundle-generator -o dist/${name}.d.ts src/components/${name}/${name}.ts --export-referenced-types=false --no-banner=true --no-check=true`)
]);

await Promise.all([
  component('datagrid')
]);
