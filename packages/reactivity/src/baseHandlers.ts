import { isObject } from '@vue/shared'
import { track } from './effect'
import { TrackOperators } from './operator'
import { reactive, readonly } from './reactivity'


function createGetter(isReadonly = false, shallow = false) {
  return function get(target: object, key: PropertyKey, receiver: unknown) {
    const res = Reflect.get(target, key, receiver)
    if (!isReadonly) {
      // 不是 readonly 要收集依赖，数据更新时要更新试图
      track(target, TrackOperators.GET, key)
      // return res
    }

    if (shallow) {
      return res
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

function createSetter(isShallow = false) {
  return function set(
    target: object,
    key: PropertyKey,
    value: unknown,
    receiver: unknown
  ) {
    const res = Reflect.set(target, key, value, receiver)
    return res
  }
}

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)

// let readonlyObj = {
//   set: (target: object, key: string) => {
//     console.warn(`${target} is readonly set fail ${key} on it `)
//   },
// }

export const mutableHandlers = {
  get,
  set
}

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
}

export const readonlyHandlers = {
  get: readonlyGet,
}

export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
}
