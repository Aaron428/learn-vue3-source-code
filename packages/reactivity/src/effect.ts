import { TrackOperators } from './operator'

interface EffectOption {
  lazy?: boolean
}

let uuid = 0
// 当前正在运行的 effect
let activeEffect: Function
// effect 存储栈
const effectStack: Function[] = []

function createReactiveEffect(fn: Function, options = {}) {
  const ret = function reactiveEffect() {
    // 防止循环
    if (!effectStack.includes(ret)) {
      try {
        effectStack.push(ret)
        activeEffect = ret
        return fn()
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }

  ret.id = uuid++
  ret._isEffect = true
  ret.raw = fn
  ret.options = options

  return ret
}

export function effect(fn: Function, options: EffectOption = {}) {
  const reactiveEffect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    reactiveEffect()
  }
  return reactiveEffect
}

const targetWeakMap = new WeakMap()

export function track(target: unknown, type: TrackOperators, key: PropertyKey) {
  if (activeEffect === undefined) {
    return
  }

  let depsMap = targetWeakMap.get(target as object)

  if (!depsMap) {
    targetWeakMap.set(target as object, (depsMap = new Map))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    // 防止多次调用，重复设置
    depsMap.set(key, (dep = new Set))
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }

  console.log(targetWeakMap)
}
