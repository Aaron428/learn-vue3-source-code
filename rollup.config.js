import { resolve } from 'path'
import JsonPlugin from '@rollup/plugin-json'
import NodeResolve from '@rollup/plugin-node-resolve'
import TsPlugin from 'rollup-plugin-typescript2'

const packagesDir = resolve(__dirname, 'packages')

const pkgName = process.env.TARGET ?? ''

const targetPkgDir = resolve(packagesDir, pkgName)

const targetPkgDirResolver = (p) => resolve(targetPkgDir, p)
const { buildOptions } = require(targetPkgDirResolver('package.json'))

function createConfig(format) {
  return {
    input: targetPkgDirResolver('src/index.ts'),
    output: {
      name: buildOptions.name,
      file: targetPkgDirResolver(`dist/${pkgName}.${format}.js`),
      format,
    },
    plugins: [
      JsonPlugin(),
      TsPlugin({
        tsconfig: resolve(__dirname, 'tsconfig.json'),
      }),
      NodeResolve(),
    ],
  }
}

export default buildOptions.formats.map((item) => createConfig(item))
