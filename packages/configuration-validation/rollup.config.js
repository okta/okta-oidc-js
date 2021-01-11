import pkg from './package.json'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/lib.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: 'hidden'
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: 'hidden'
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    terser()
  ]
}
