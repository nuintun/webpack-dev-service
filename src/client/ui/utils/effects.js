/**
 * @module effects
 */

// 默认样式
const styles = document.documentElement.style;

// Animation 映射表
const ANIMATION_MAPS = [
  ['animation', 'animationend'],
  ['WebkitAnimation', 'webkitAnimationEnd'],
  ['MozAnimation', 'mozAnimationEnd'],
  ['OAnimation', 'oAnimationEnd'],
  ['msAnimation', 'MSAnimationEnd'],
  ['KhtmlAnimation', 'khtmlAnimationEnd']
];

// Transition 映射表
const TRANSITION_MAPS = [
  ['transition', 'transitionend'],
  ['WebkitTransition', 'webkitTransitionEnd'],
  ['MozTransition', 'mozTransitionEnd'],
  ['OTransition', 'oTransitionEnd'],
  ['msTransition', 'MSTransitionEnd'],
  ['KhtmlTransition', 'khtmlTransitionEnd']
];

/**
 * @function detect
 * @param {object} maps
 */
function detect(maps) {
  for (const [prop, event] of maps) {
    if (prop in styles) {
      return [prop, event];
    }
  }
}

// Animation
const [ANIMATION, ANIMATION_END] = detect(ANIMATION_MAPS);
// Transition
const [TRANSITION, TRANSITION_END] = detect(TRANSITION_MAPS);

/**
 * @function toMs
 * @param {string} value
 */
function toMs(value) {
  return Number(value.slice(0, -1).replace(',', '.')) * 1000;
}

/**
 * @function calcTimeout
 * @param {Array} delays
 * @param {Array} durations
 */
function calcTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  const times = durations.map((duration, index) => toMs(duration) + toMs(delays[index]));

  // 获取最大时长
  return Math.max.apply(null, times);
}

/**
 * @function toArray
 * @param {any} value
 */
function toArray(value) {
  return value ? value.split(', ') : [];
}

/**
 * @function calcEffects
 * @param {HTMLElement} node
 */
function calcEffects(node) {
  const styles = window.getComputedStyle(node);

  const transitioneDelays = toArray(styles.getPropertyValue(TRANSITION + '-delay'));
  const transitionDurations = toArray(styles.getPropertyValue(TRANSITION + '-duration'));
  const transitionTimeout = calcTimeout(transitioneDelays, transitionDurations);
  const animationDelays = toArray(styles.getPropertyValue(ANIMATION + '-delay'));
  const animationDurations = toArray(styles.getPropertyValue(ANIMATION + '-duration'));
  const animationTimeout = calcTimeout(animationDelays, animationDurations);

  const timeout = Math.max(transitionTimeout, animationTimeout);
  const effect = timeout > 0 ? (transitionTimeout > animationTimeout ? TRANSITION : ANIMATION) : null;
  const count = effect ? (effect === TRANSITION ? transitionDurations.length : animationDurations.length) : 0;

  return { effect, count, timeout };
}

/**
 * @function onEffectsEnd
 * @param {HTMLElement} node
 * @param {Function} callback
 * @see https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/transition-util.js
 */
export default function onEffectsEnd(node, callback) {
  // 不支持动画
  if (!ANIMATION && !TRANSITION) return callback();

  const { count, effect, timeout } = calcEffects(node);

  // 没有动画
  if (!effect) return callback();

  let ended = 0;

  // 防止有些动画没有触发结束事件
  const timer = setTimeout(function () {
    if (ended < count) {
      end();
    }
  }, timeout + 1);

  const event = effect === TRANSITION ? TRANSITION_END : ANIMATION_END;

  const end = () => {
    clearTimeout(timer);

    node.removeEventListener(event, onEnd);

    callback();
  };

  const onEnd = function (e) {
    if (e.target === node) {
      if (++ended >= count) {
        end();
      }
    }
  };

  // 监听动画完成事件
  node.addEventListener(event, onEnd);
}
