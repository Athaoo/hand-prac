react

fiberRoot

HostFiberRoot

Scheduler module

```js
export const scheduleCallback = Scheduler.unstable_scheduleCallback;
export const cancelCallback = Scheduler.unstable_cancelCallback;
export const shouldYield = Scheduler.unstable_shouldYield;
export const requestPaint = Scheduler.unstable_requestPaint;
export const now = Scheduler.unstable_now;
export const getCurrentPriorityLevel =
  Scheduler.unstable_getCurrentPriorityLevel;
export const ImmediatePriority = Scheduler.unstable_ImmediatePriority;
export const UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
export const NormalPriority = Scheduler.unstable_NormalPriority;
export const LowPriority = Scheduler.unstable_LowPriority;
export const IdlePriority = Scheduler.unstable_IdlePriority;
export type SchedulerCallback = (isSync: boolean) => SchedulerCallback | null;
```

ReactFiberRootScheduler module

```js
import {
  // Aliased because `act` will override and push to an internal queue
  scheduleCallback as Scheduler_scheduleCallback,
  shouldYield,
  requestPaint,
  now,
  NormalPriority as NormalSchedulerPriority,
  IdlePriority as IdleSchedulerPriority,
} from './Scheduler';
```

```js
function scheduleCallback(priorityLevel: any, callback) {
  if (__DEV__) {
    // If we're currently inside an `act` scope, bypass Scheduler and push to
    // the `act` queue instead.
    const actQueue = ReactCurrentActQueue.current;
    if (actQueue !== null) {
      actQueue.push(callback);
      return fakeActCallbackNode;
    } else {
      return Scheduler_scheduleCallback(priorityLevel, callback);
    }
  } else {
    // In production, always call Scheduler. This function will be stripped out.
    return Scheduler_scheduleCallback(priorityLevel, callback);
  }
} 

export function ensureRootIsScheduled(root: FiberRoot): void {}
```

ReactFiberWorkLoop module

```js
export function performConcurrentWorkOnRoot(
  root: FiberRoot,
  didTimeout: boolean,
): RenderTaskFn | null {}
```

performWorkUntilDeadline

scheduleHostCallback

ReactFiberHooks.js

Hook和FIber都有memorizedState、

Fiber的updateQueue和Hook的queue都是环形列表，处理方式也相似，但它们是相互独立的，里面的update对象都是完全独立的，hook.queue只参与`hook对象`的状态维护

```js
export type Update<S, A> = {
  lane: Lane,
  revertLane: Lane,
  action: A,
  hasEagerState: boolean,
  eagerState: S | null,
  next: Update<S, A>,
};

export type UpdateQueue<S, A> = {
  pending: Update<S, A> | null,
  lanes: Lanes,
  dispatch: (A => mixed) | null,
  lastRenderedReducer: ((S, A) => S) | null,
  lastRenderedState: S | null,
};

export type Hook = {
  memoizedState: any,
  baseState: any,
  baseQueue: Update<any, any> | null,
  queue: any,
  next: Hook | null,
};
```

1. 状态相关: `fiber树构造`阶段.
   
   1. `useState`在`fiber树构造`阶段(`renderRootSync[Concurrent]`)执行, 可以修改`Hook.memoizedState`.

2. 副作用相关: `fiber树渲染`阶段.
   
   1. `useEffect`在`fiber树渲染`阶段(`commitRoot->commitBeforeMutationEffects->commitBeforeMutationEffectOnFiber`)执行(注意是异步执行, [链接](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L2290-L2295)).
   2. `useLayoutEffect`在`fiber树渲染`阶段(`commitRoot->commitLayoutEffects->commitLayoutEffectOnFiber->commitHookEffectListMount`)执行(同步执行, [链接](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/src/ReactFiberCommitWork.old.js#L481)).

3. 从定义来看, `Hook`对象共有 5 个属性(有关这些属性的应用, 将在`Hook 原理(状态)`章节中具体分析.):
   
   1. `hook.memoizedState`: 保持在内存中的局部状态.
   2. `hook.baseState`: `hook.baseQueue`中所有`update`对象合并之后的状态.
   3. `hook.baseQueue`: 存储`update对象`的环形链表, 只包括高于本次渲染优先级的`update对象`.
   4. `hook.queue`: 存储`update对象`的环形链表, 包括所有优先级的`update对象`.
   5. `hook.next`: `next`指针, 指向链表中的下一个`hook`.
   
   所以`Hook`是一个链表, 单个`Hook`拥有自己的状态`hook.memoizedState`和自己的更新队列`hook.queue`

4. 对于Function类型的组件，其与Hook关联的方式是Fiber节点中的memorizedState属性，它存放了其自身的hook链表，这成为了两个模块数据层面关联的方式。在beginWork->updateFunctionComponent->renderWithHooks这一调用栈中，实现了运行时两个模块的关联。而实际上两个模块可以相互独立，比如class组件也会生成fiber结构，而vue也有自己实现hook的方式
