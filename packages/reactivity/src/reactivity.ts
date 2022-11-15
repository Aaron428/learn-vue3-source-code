import { isObject } from '@vue/shared'
import {
  mutableHandlers,
  shallowReactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers'

const reactiveMap = new WeakMap()
const shallowReactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
const shallowReadonlyMap = new WeakMap()

export function reactive(target: unknown) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

export function shallowReactive(target: unknown) {
  return createReactiveObject(
    target,
    shallowReactiveHandlers,
    shallowReactiveMap
  )
}

export function readonly(target: unknown) {
  return createReactiveObject(target, readonlyHandlers, readonlyMap)
}

export function shallowReadonly(target: unknown) {
  return createReactiveObject(
    target,
    shallowReadonlyHandlers,
    shallowReadonlyMap
  )
}

export function createReactiveObject(
  target: unknown,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<any, any>
) {
  if (!isObject(target)) {
    return target
  }

  const existingProxy = proxyMap.get(target)

  if (existingProxy) {
    return existingProxy
  }

  const proxy = new Proxy(target, baseHandlers)

  proxyMap.set(target, proxy)

  return proxy
}
