/**
 * @module progress
 */

import onEffectsEnd from './utils/effects';
import { appendHTML, injectCSS } from './utils';

const ns = 'wds-progress';
const perimeter = 219.99078369140625;

const css = `
  .${ns} {
    opacity: 0;
    right: 1em;
    bottom: 1em;
    width: 48px;
    height: 48px;
    font-size: 16px;
    position: fixed;
    transform: scale(0);
    z-index: 2147483645;
  }
  .${ns}-bg {
    fill: #282d35;
  }
  .${ns}-track {
    stroke-width: 10;
    fill: rgba(0, 0, 0, 0);
    stroke: rgb(186, 223, 172);
    stroke-dasharray: ${perimeter};
    stroke-dashoffset: -${perimeter};
    transition: stroke-dashoffset .3s;
    transform: rotate(90deg) translate(0, -80px);
  }
  .${ns}-value {
    fill: #ffffff;
    font-size: 1em;
    text-anchor: middle;
    font-family: monospace;
    dominant-baseline: middle;
  }
  .${ns}-noselect {
    cursor: default;
    user-select: none;
  }
  @keyframes ${ns}-show {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes ${ns}-hide {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
  .${ns}-show {
    animation: ${ns}-show .3s;
    animation-fill-mode: forwards;
  }
  .${ns}-hide {
    animation: ${ns}-hide .3s;
    animation-fill-mode: forwards;
  }
`;

const html = `
  <svg class="${ns} ${ns}-noselect" x="0" y="0" viewBox="0 0 80 80">
    <circle class="${ns}-bg" cx="50%" cy="50%" r="35" />
    <path class="${ns}-track" d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0" />
    <text class="${ns}-value" x="50%" y="52%">0%</text>
  </svg>
`;

export default class Progress {
  constructor() {
    this.init();
  }

  init() {
    injectCSS(css);

    [this.svg] = appendHTML(html);

    this.track = this.svg.querySelector(`.${ns}-track`);
    this.value = this.svg.querySelector(`.${ns}-value`);
  }

  update(value) {
    this.value.innerHTML = `${value}%`;

    const offset = ((100 - value) / 100) * -perimeter;

    this.track.setAttribute('style', `stroke-dashoffset: ${offset}`);
  }

  show() {
    const show = `${ns}-show`;
    const { classList } = this.svg;

    if (!classList.contains(show)) {
      classList.remove(`${ns}-hide`);
      classList.add(show);
    }
  }

  hide() {
    onEffectsEnd(this.track, () => {
      const show = `${ns}-show`;
      const { classList } = this.svg;

      if (classList.contains(show)) {
        classList.remove(show);
        classList.add(`${ns}-hide`);
      }

      onEffectsEnd(this.svg, () => {
        this.update(0);
      });
    });
  }
}
