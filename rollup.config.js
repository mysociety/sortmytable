import pkg from './package.json' assert { type: 'json' }
import terser from '@rollup/plugin-terser'

const banner = `/** ${pkg.name} ${pkg.version} @license ${pkg.homepage} */`

export default {
  input: 'src/sortmytable.esm.js',
  output: [
    {
      file: 'dist/sortmytable.esm.js',
      format: 'es',
      banner: banner
    },
    {
      file: 'dist/sortmytable.esm.min.js',
      format: 'es',
      banner: banner,
      plugins: [
        terser({
          module: true
        })
      ]
    },
    {
      file: 'dist/sortmytable.js',
      format: 'iife',
      banner: banner,
      name: 'SortMyTable'
    },
    {
      file: 'dist/sortmytable.min.js',
      format: 'iife',
      banner: banner,
      name: 'SortMyTable',
      plugins: [
        terser()
      ]
    }
  ]
}
