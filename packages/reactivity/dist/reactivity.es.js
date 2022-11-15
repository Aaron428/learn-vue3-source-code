const isObject = (value) => typeof value === 'object' && value !== null;

let uuid = 0;
// 当前正在运行的 effect
let activeEffect;
// effect 存储栈
const effectStack = [];
function createReactiveEffect(fn, options = {}) {
    const ret = function reactiveEffect() {
        // 防止循环
        if (!effectStack.includes(ret)) {
            try {
                effectStack.push(ret);
                activeEffect = ret;
                return fn();
            }
            finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    };
    ret.id = uuid++;
    ret._isEffect = true;
    ret.raw = fn;
    ret.options = options;
    return ret;
}
function effect(fn, options = {}) {
    const reactiveEffect = createReactiveEffect(fn, options);
    if (!options.lazy) {
        reactiveEffect();
    }
    return reactiveEffect;
}
const targetWeakMap = new WeakMap();
function track(target, type, key) {
    if (activeEffect === undefined) {
        return;
    }
    let depsMap = targetWeakMap.get(target);
    if (!depsMap) {
        targetWeakMap.set(target, (depsMap = new Map));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        // 防止多次调用，重复设置
        depsMap.set(key, (dep = new Set));
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
    }
    console.log(targetWeakMap);
}

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);
        if (!isReadonly) {
            // 不是 readonly 要收集依赖，数据更新时要更新试图
            track(target, 0 /* TrackOperators.GET */, key);
            // return res
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter(isShallow = false) {
    return function set(target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver);
        return res;
    };
}
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const set = createSetter();
const shallowSet = createSetter(true);
// let readonlyObj = {
//   set: (target: object, key: string) => {
//     console.warn(`${target} is readonly set fail ${key} on it `)
//   },
// }
const mutableHandlers = {
    get,
    set
};
const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet
};
const readonlyHandlers = {
    get: readonlyGet,
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
};

const reactiveMap = new WeakMap();
const shallowReactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
function reactive(target) {
    return createReactiveObject(target, mutableHandlers, reactiveMap);
}
function shallowReactive(target) {
    return createReactiveObject(target, shallowReactiveHandlers, shallowReactiveMap);
}
function readonly(target) {
    return createReactiveObject(target, readonlyHandlers, readonlyMap);
}
function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, baseHandlers, proxyMap) {
    if (!isObject(target)) {
        return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}

export { createReactiveObject, effect, reactive, readonly, shallowReactive, shallowReadonly };
