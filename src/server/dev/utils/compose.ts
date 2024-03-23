/**
 * @module compose
 */

interface CallStack {
  index: number;
}

export interface Next {
  (): Promise<void>;
}

export interface Composed<C> {
  (context: C, next?: Next): Promise<void>;
}

export interface Middleware<C> {
  (context: C, next: Next): Promise<void> | void;
}

/**
 * @function dispatch
 * @param middlewares 中间件数组
 * @param index 要执行的中间件索引
 * @param stack 调用栈信息
 * @param context 执行上下文
 * @param [next] 下一个中间件
 */
async function dispatch<C>(
  middlewares: Middleware<C>[],
  index: number,
  stack: CallStack,
  context: C,
  next?: Next
): Promise<void> {
  if (index <= stack.index) {
    throw new Error('next() called multiple times');
  }

  stack.index = index;

  const { length } = middlewares;

  if (index < length) {
    const middleware = middlewares[index];

    await middleware(context, () => {
      return dispatch(middlewares, index + 1, stack, context, next);
    });
  } else if (next) {
    await next();
  }
}

/**
 * @function compose
 * @description 生成融合中间件
 * @param middlewares 中间件数组
 */
export function compose<C>(...middlewares: Middleware<C>[]): Composed<C> {
  /**
   * @function middleware
   * @description 融合中间件
   * @param context 执行上下文
   * @param [next] 下一个中间件
   */
  return (context, next) => {
    const stack = { index: -1 };

    return dispatch<C>(middlewares, 0, stack, context, next);
  };
}
