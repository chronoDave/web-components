import fsp from 'fs/promises';
import path from 'path';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const outdir = path.join(process.cwd(), 'dist');

const input = name => `src/components/${name}/${name}.ts`;
const output = name => type => `${outdir}/${name}.${type}`;

await fsp.rm(outdir, { recursive: true, force: true });

const component = name => [{
  input: input(name),
  plugins: [
    esbuild({ target: 'esnext' }),
    nodeResolve()
  ],
  output: [{
    file: output(name)('js'),
    format: 'es'
  }]
}, {
  input: input(name),
  plugins: [dts()],
  output: {
    file: output(name)('d.ts'),
    format: 'es'
  }
}];

export default [
  ...component('datagrid')
];
