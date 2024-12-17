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
 * @description Dispatch middlewares.
 * @param middlewares The middlewares list.
 * @param index The current middleware index.
 * @param stack The call stack.
 * @param context The execution context.
 * @param next The next middleware.
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
 * @description Compose middlewares.
 * @param middlewares The middlewares list.
 */
export function compose<C>(...middlewares: Middleware<C>[]): Composed<C> {
  /**
   * @function compose
   * @description Compose middlewares.
   * @param context The execution context.
   * @param next The next middleware.
   */
  return (context, next) => {
    const stack = { index: -1 };

    return dispatch<C>(middlewares, 0, stack, context, next);
  };
}
