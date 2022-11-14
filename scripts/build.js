const { readdirSync, statSync } = require('fs')
const execa = require('execa')

const targets = readdirSync('packages').filter((file) =>
  statSync(`packages/${file}`).isDirectory()
)

async function build(target) {
  try {
    await execa('rollup', ['-c', '--environment', `TARGET:${target}`], {
      stdio: 'inherit',
    })
  } catch (e) {
    console.error('build error: try again')
  }
}

function runParallel(targets, iteratorFunc) {
  const res = []
  for (const target of targets) {
    res.push(iteratorFunc(target))
  }
  return Promise.all(res)
}

runParallel(targets, build)
