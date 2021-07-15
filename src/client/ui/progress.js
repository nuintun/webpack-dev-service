/**
 * @module progress
 */

import onEffectsEnd from './utils/effects';
import { appendHTML, injectCSS } from './utils';

const PROGRESS = 'wds-progress';
const PERIMETER = 219.99078369140625;

const CSS = `
  .${PROGRESS} {
    opacity: 0;
    width: 48px;
    right: 16px;
    height: 48px;
    bottom: 16px;
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
    stroke-width: 10;
    fill: rgba(0, 0, 0, 0);
    stroke: rgb(186, 223, 172);
    stroke-dasharray: ${PERIMETER};
    stroke-dashoffset: -${PERIMETER};
    transition: stroke-dashoffset .3s ease-out;
    transform: rotate(90deg) translate(0, -80px) translateZ(0);
  }
  .${PROGRESS}-value {
    fill: #ffffff;
    font-size: 16px;
    text-anchor: middle;
    font-family: monospace;
    dominant-baseline: middle;
  }
`;

const HTML = `
  <svg class="${PROGRESS}" x="0" y="0" viewBox="0 0 80 80">
    <circle class="${PROGRESS}-bg" cx="50%" cy="50%" r="35" />
    <path class="${PROGRESS}-track" d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0" />
    <text class="${PROGRESS}-value" x="50%" y="52%">0%</text>
  </svg>
`;

export default class Progress {
  constructor() {
    this.init();
  }

  init() {
    injectCSS(CSS);

    [this.svg] = appendHTML(HTML);

    this.track = this.svg.querySelector(`.${PROGRESS}-track`);
    this.value = this.svg.querySelector(`.${PROGRESS}-value`);
  }

  update(value) {
    this.value.innerHTML = `${value}%`;

    const offset = ((100 - value) / 100) * -PERIMETER;

    this.track.setAttribute('style', `stroke-dashoffset: ${offset}`);
  }

  isVisible() {
    return this.svg.classList.contains(`${PROGRESS}-show`);
  }

  show() {
    const { classList } = this.svg;

    if (!this.isVisible()) {
      this.update(0);

      classList.remove(`${PROGRESS}-hide`);
      classList.add(`${PROGRESS}-show`);
    }
  }

  hide() {
    onEffectsEnd(this.track, () => {
      const { classList } = this.svg;

      if (this.isVisible()) {
        classList.remove(`${PROGRESS}-show`);
        classList.add(`${PROGRESS}-hide`);
      }
    });
  }
}
