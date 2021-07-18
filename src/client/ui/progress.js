/**
 * @module progress
 * @see https://github.com/shellscape/webpack-plugin-serve
 */

import onEffectsEnd from './utils/effects';
import { appendHTML, injectCSS } from './utils';

const PROGRESS = 'wds-progress';
const PERIMETER = 2 * Math.PI * 36;

const CSS = `
  .${PROGRESS} {
    width: 48px;
    right: 16px;
    height: 48px;
    bottom: 16px;
    display: block;
    font-size: 16px;
    position: fixed;
    cursor: default;
    user-select: none;
    font-style: normal;
    font-weight: normal;
    z-index: 2147483645;
    transform: scale(0) translateZ(0);
    transition: transform .25s ease-out;
  }
  .${PROGRESS}-show {
    transform: scale(1) translateZ(0);
  }
  .${PROGRESS}-bg {
    fill: #282d35;
  }
  .${PROGRESS}-track {
    stroke: #badfac;
    stroke-width: 8;
    fill: rgba(0, 0, 0, 0);
    stroke-dasharray: 0 ${PERIMETER};
    transition: stroke-dasharray .25s linear;
    transform: matrix(0, -1, 1, 0, 0, 80) translateZ(0);
  }
  .${PROGRESS}-value {
    fill: #ffffff;
    font-size: 18px;
    text-anchor: middle;
    font-family: monospace;
    dominant-baseline: middle;
  }
`;

const HTML = `
  <svg class="${PROGRESS}" x="0" y="0" viewBox="0 0 80 80">
    <circle class="${PROGRESS}-bg" cx="50%" cy="50%" r="36" />
    <circle class="${PROGRESS}-track" cx="50%" cy="50%" r="36" />
    <text class="${PROGRESS}-value" x="50%" y="52%">0%</text>
  </svg>
`;

function calcPercent(value) {
  if (value <= 0) return 0;

  if (value >= 100) return 1;

  return value / 100;
}

export default class Progress {
  hidden = true;

  constructor() {
    injectCSS(CSS);

    [this.svg] = appendHTML(HTML);

    this.track = this.svg.querySelector(`.${PROGRESS}-track`);
    this.value = this.svg.querySelector(`.${PROGRESS}-value`);
  }

  update(value) {
    this.value.innerHTML = `${value}%`;

    const percent = calcPercent(value);
    const dashWidth = PERIMETER * percent;
    const dashSpace = PERIMETER * (1 - percent);

    this.track.style.strokeDasharray = `${dashWidth} ${dashSpace}`;
  }

  show() {
    if (this.hidden) {
      this.hidden = false;

      this.svg.classList.add(`${PROGRESS}-show`);
    }
  }

  hide() {
    if (!this.hidden) {
      this.hidden = true;

      onEffectsEnd(this.track, () => {
        this.svg.classList.remove(`${PROGRESS}-show`);
      });
    }
  }
}
