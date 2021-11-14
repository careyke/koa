/**
 * koa-compose 模块的代码
 * koa中间件 ”洋葱模型“ 的实现
 */
'use strict';

/**
 * Expose compositor.
 */

module.exports = compose;

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function(context, next) {
    // last called middleware #
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        // 洋葱模型实现的关键
        // 由当前中间件函数来触发下一个中间件的执行ßß
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1))); // 执行结果包装成promise对象
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
