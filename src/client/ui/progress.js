/**
 * @module progress
 * @see https://github.com/shellscape/webpack-plugin-serve
 * @see https://www.zhangxinxu.com/wordpress/2015/07/svg-circle-loading
 */

import onEffectsEnd from './utils/effects';
import { appendHTML, injectCSS } from './utils';

const PROGRESS = 'wds-progress';
const PERIMETER = 2 * Math.PI * 44;

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
    transform-origin: center;
    transform: scale(0) translateZ(0);
    transition: transform .25s ease-out;
  }
  .${PROGRESS}-show {
    transform: scale(1) translateZ(0);
  }
  .${PROGRESS}-track {
    stroke: #badfac;
    stroke-width: 8;
    fill: rgba(0, 0, 0, 0);
    stroke-dasharray: 0 ${PERIMETER};
    transition: stroke-dasharray .25s linear;
    transform: matrix(0, -1, 1, 0, 0, 96) translateZ(0);
  }
`;

const HTML = `
  <svg class="${PROGRESS}" x="0" y="0" viewBox="0 0 96 96">
    <circle fill="#282d35" cx="50%" cy="50%" r="44" />
    <circle class="${PROGRESS}-track" cx="50%" cy="50%" r="44" />
    <path fill="#fff" d="m48,83.213561l-31.122918,-17.60678l0,-35.21356l31.122918,-17.60678l31.122918,17.60678l0,35.21356l-31.122918,17.60678z"/>
    <path fill="#8ed6fb" d="m22.434956,31.608089l24.537982,-13.880011l0,10.810563l-15.288554,8.410172l-9.249428,-5.340723zm-1.678513,1.520052l0,29.027711l8.979458,-5.182262l0,-18.657318l-8.979458,-5.188131zm52.908373,-1.520052l-24.537982,-13.880011l0,10.810563l15.288554,8.410172l9.249428,-5.340723zm1.678513,1.520052l0,29.027711l-8.979458,-5.182262l0,-18.657318l8.979458,-5.188131zm-1.050538,30.905767l-25.165957,14.238016l0,-10.452558l16.121941,-8.867948l0.123247,-0.070427l8.920768,5.152918zm-52.485811,0l25.165957,14.238016l0,-10.452558l-16.121941,-8.867948l-0.123247,-0.070427l-8.920768,5.152918z"/>
    <path fill="#1c78c0" d="m49.126834,30.997721l15.083141,8.292793l0,16.432994l-15.083141,-8.709487l0,-16.016301zm-2.153896,0l-15.083141,8.292793l0,16.432994l15.083141,-8.709487l0,-16.016301zm16.215844,26.62732l-15.141831,8.328007l-15.141831,-8.328007l15.141831,-8.744701l15.141831,8.744701z"/>
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
  }

  update(value) {
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
