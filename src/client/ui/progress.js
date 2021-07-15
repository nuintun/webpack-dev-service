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
    opacity: 0;
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
  }
  @keyframes ${PROGRESS}-show {
    0% {
      opacity: 0;
      transform: scale(0) translateZ(0);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateZ(0);
    }
  }
  @keyframes ${PROGRESS}-hide {
    0% {
      opacity: 1;
      transform: scale(1) translateZ(0);
    }
    100% {
      opacity: 0;
      transform: scale(0) translateZ(0);
    }
  }
  .${PROGRESS}-show {
    animation: ${PROGRESS}-show .3s ease-out forwards;
  }
  .${PROGRESS}-hide {
    animation: ${PROGRESS}-hide .3s ease-out forwards;
  }
  .${PROGRESS}-bg {
    fill: #282d35;
  }
  .${PROGRESS}-track {
    stroke: #badfac;
    stroke-width: 8;
    fill: rgba(0, 0, 0, 0);
    transition: stroke-dasharray .3s linear;
    transform: matrix(0, -1, 1, 0, 0, 80) translateZ(0);
  }
  .${PROGRESS}-track-animate {
    transition: stroke-dasharray .3s linear;
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

    this.track.setAttribute('stroke-dasharray', `${dashWidth} ${dashSpace}`);
  }

  animateTrack(animate) {
    this.track.classList[animate ? 'add' : 'remove'](`${PROGRESS}-track-animate`);
  }

  show() {
    if (this.hidden) {
      this.hidden = false;

      const { classList } = this.svg;

      this.animateTrack(true);

      classList.remove(`${PROGRESS}-hide`);
      classList.add(`${PROGRESS}-show`);
    }
  }

  hide() {
    onEffectsEnd(this.track, () => {
      const { svg } = this;
      const { classList } = svg;

      if (!this.hidden) {
        this.hidden = true;

        this.animateTrack(false);

        classList.remove(`${PROGRESS}-show`);
        classList.add(`${PROGRESS}-hide`);

        onEffectsEnd(svg, () => {
          classList.remove(`${PROGRESS}-hide`);
        });
      }
    });
  }
}
