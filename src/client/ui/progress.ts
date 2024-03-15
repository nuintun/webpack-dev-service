/**
 * @module progress
 * @see https://github.com/shellscape/webpack-plugin-serve
 * @see https://www.zhangxinxu.com/wordpress/2015/07/svg-circle-loading
 */

import { appendHTML, getRootElement, injectCSS } from './utils';

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
  z-index: 2147483647;
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
  stroke-linecap: round;
  fill: rgba(0, 0, 0, 0);
  stroke-dasharray: ${PERIMETER};
  stroke-dashoffset: ${PERIMETER};
  transition: stroke-dashoffset .25s linear;
  transform: matrix(0, -1, 1, 0, 0, 96) translateZ(0);
}
`;

const HTML = `
<svg class="${PROGRESS}" x="0" y="0" viewBox="0 0 96 96">
  <circle fill="#282d35" cx="50%" cy="50%" r="44" />
  <circle class="${PROGRESS}-track" cx="50%" cy="50%" r="44" />
  <path fill="#fff" d="m48,83.213561l-31.122918,-17.60678l0,-35.21356l31.122918,-17.60678l31.122918,17.60678l0,35.21356l-31.122918,17.60678z" />
  <path fill="#8ed6fb" d="m22.434956,31.608089l24.537982,-13.880011l0,10.810563l-15.288554,8.410172l-9.249428,-5.340723zm-1.678513,1.520052l0,29.027711l8.979458,-5.182262l0,-18.657318l-8.979458,-5.188131zm52.908373,-1.520052l-24.537982,-13.880011l0,10.810563l15.288554,8.410172l9.249428,-5.340723zm1.678513,1.520052l0,29.027711l-8.979458,-5.182262l0,-18.657318l8.979458,-5.188131zm-1.050538,30.905767l-25.165957,14.238016l0,-10.452558l16.121941,-8.867948l0.123247,-0.070427l8.920768,5.152918zm-52.485811,0l25.165957,14.238016l0,-10.452558l-16.121941,-8.867948l-0.123247,-0.070427l-8.920768,5.152918z" />
  <path fill="#1c78c0" d="m49.126834,30.997721l15.083141,8.292793l0,16.432994l-15.083141,-8.709487l0,-16.016301zm-2.153896,0l-15.083141,8.292793l0,16.432994l15.083141,-8.709487l0,-16.016301zm16.215844,26.62732l-15.141831,8.328007l-15.141831,-8.328007l15.141831,-8.744701l15.141831,8.744701z" />
</svg>
`;

export default class Progress {
  private timer?: number;
  private hidden: boolean = true;

  private readonly svg: SVGElement;
  private readonly track: SVGElement;

  constructor() {
    const root = getRootElement(PROGRESS);

    injectCSS(CSS, root);

    [this.svg] = appendHTML(HTML, root) as [SVGElement];

    this.track = this.svg.querySelector(`.${PROGRESS}-track`)!;
  }

  update(value: number): void {
    value = Math.max(0, Math.min(100, value));

    this.track.style.strokeDashoffset = (((100 - value) / 100) * PERIMETER).toString();
  }

  show(): void {
    if (this.hidden) {
      this.hidden = false;

      clearTimeout(this.timer);

      this.svg.classList.add(`${PROGRESS}-show`);
    }
  }

  hide(): void {
    if (!this.hidden) {
      this.hidden = true;

      this.timer = self.setTimeout(() => {
        this.update(0);

        this.svg.classList.remove(`${PROGRESS}-show`);
      }, 300);
    }
  }
}
