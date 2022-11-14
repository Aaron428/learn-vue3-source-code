const execa = require('execa')

const target = 'reactivity'

// 对所有模块并行打包
async function build(target) {
  await execa('rollup', ['-wc', '--environment', `TARGET:${target}`], {
    stdio: 'inherit',
  })
}

build(target)
