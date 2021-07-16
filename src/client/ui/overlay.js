/**
 * @module overlay
 * @see https://github.com/shellscape/webpack-plugin-serve
 */

import Ansi from './utils/ansi';
import { appendHTML, injectCSS } from './utils';

const OVERLAY = 'wds-overlay';

const CSS = `
  .${OVERLAY} {
    top:0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    display: block;
    position: fixed;
    font-size: 16px;
    overflow: hidden;
    font-style: normal;
    font-weight: normal;
    z-index: 2147483644;
    font-family: monospace;
    box-sizing: border-box;
    background: rgba(0, 0, 0, .85);
    transform: scale(0) translateZ(0);
    transition: transform .3s ease-out;
  }
  .${OVERLAY}-show {
    transform: scale(1) translateZ(0);
  }
  .${OVERLAY}-nav {
    right: 0;
    padding: 16px;
    line-height: 16px;
    position: absolute;
    transform: rotate(0) translateZ(0);
    transition: transform .3s ease-in-out;
  }
  .${OVERLAY}-nav:hover {
    transform: rotate(180deg) translateZ(0);
  }
  .${OVERLAY}-close {
    width: 16px;
    height: 16px;
    color: #fff;
    cursor: pointer;
    font-style: normal;
    text-align: center;
    border-radius: 16px;
    font-weight: normal;
    background: #ff5f58;
    display: inline-block;
  }
  .${OVERLAY}-title {
    margin: 0;
    color: #fff;
    width: 100%;
    padding: 16px 0;
    line-height: 16px;
    text-align: center;
    background: #282d35;
  }
  .${OVERLAY}-name {
    font-weight: bold;
    font-style: normal;
    text-transform: uppercase;
  }
  .${OVERLAY}-errors-title,
  .${OVERLAY}-warnings-title {
    color: #ff5f58;
    padding-left: 8px;
  }
  .${OVERLAY}-warnings-title {
    color: #ffbd2e;
  }
  .${OVERLAY}-problems {
    padding: 0 16px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .${OVERLAY}-problems::-webkit-scrollbar {
    display: none;
  }
  .${OVERLAY}-errors,
  .${OVERLAY}-warnings {
    color: #ddd;
    margin: 16px 0;
    display: block;
    border-radius: 4px;
    background: #282d35;
    white-space: pre-wrap;
    font-family: monospace;
  }
  .${OVERLAY}-errors > div,
  .${OVERLAY}-warnings > div {
    font-size: 15px;
    padding: 16px 16px 0;
  }
  .${OVERLAY}-errors > div > em,
  .${OVERLAY}-warnings > div > em {
    color: #641e16;
    padding: 2px 8px;
    font-style: normal;
    border-radius: 4px;
    font-weight: normal;
    background: #ff5f58;
    display: inline-block;
    text-transform: uppercase;
  }
  .${OVERLAY}-warnings > div > em {
    color: #3e2723;
    background: #ffbd2e;
  }
  .${OVERLAY}-errors > div > div,
  .${OVERLAY}-warnings > div > div {
    font-size: 13px;
    padding: 8px 0 16px 16px;
  }
`;

const DEFAULT_NAME = 'webpack';

const HTML = `
  <aside class="${OVERLAY}">
    <nav class="${OVERLAY}-nav">
      <i class="${OVERLAY}-close">×</i>
    </nav>
    <div class="${OVERLAY}-title">
      <em class="${OVERLAY}-name">${DEFAULT_NAME}</em>
      <em class="${OVERLAY}-errors-title"></em>
      <em class="${OVERLAY}-warnings-title"></em>
    </div>
    <article class="${OVERLAY}-problems">
      <pre class="${OVERLAY}-errors"></pre>
      <pre class="${OVERLAY}-warnings"></pre>
    </article>
  </aside>
`;

const ANSI = new Ansi({
  black: '#181818',
  red: '#ff3348',
  green: '#3fff4f',
  yellow: '#ffd30e',
  blue: '#169be0',
  magenta: '#f840b7',
  cyan: '#0ad8e9',
  lightgrey: '#ebe7e3',
  darkgrey: '#6d7891',
  reset: ['#fff', '#282d35']
});

function ansiHTML(text) {
  return ANSI.convert(text);
}

export default class Overlay {
  hidden = true;

  constructor() {
    injectCSS(CSS);

    [this.aside] = appendHTML(HTML);

    this.name = this.aside.querySelector(`.${OVERLAY}-name`);
    this.close = this.aside.querySelector(`.${OVERLAY}-close`);
    this.errorsList = this.aside.querySelector(`.${OVERLAY}-errors`);
    this.warningsList = this.aside.querySelector(`.${OVERLAY}-warnings`);
    this.errorsTitle = this.aside.querySelector(`.${OVERLAY}-errors-title`);
    this.warningsTitle = this.aside.querySelector(`.${OVERLAY}-warnings-title`);

    this.close.addEventListener('click', () => {
      this.hide();
    });
  }

  setName(name) {
    this.name.innerHTML = name || DEFAULT_NAME;
  }

  problems(type, problems) {
    const problemMaps = {
      errors: ['Error', this.errorsTitle, this.errorsList],
      warnings: ['Warning', this.warningsTitle, this.warningsList]
    };
    const [name, problemTitle, problemList] = problemMaps[type];

    problemList.innerHTML = '';
    problemTitle.innerText = '';

    const count = problems.length;
    const hasProblems = count > 0;

    if (hasProblems) {
      problemTitle.innerText = `${count} ${name}(s)`;

      for (const { moduleName, message } of problems) {
        const src = ansiHTML(moduleName);
        const details = ansiHTML(message);

        appendHTML(`<div><em>${name}</em> in ${src}<div>${details}</div></div>`, problemList);
      }
    }

    return hasProblems;
  }

  show({ errors, warnings }) {
    const hasErrors = this.problems('errors', errors);
    const hasWarnings = this.problems('warnings', warnings);

    if (this.hidden && (hasErrors || hasWarnings)) {
      this.hidden = false;

      const { classList } = this.aside;

      classList.add(`${OVERLAY}-show`);
    }
  }

  hide() {
    const { aside } = this;
    const { classList } = aside;

    if (!this.hidden) {
      this.hidden = true;

      classList.remove(`${OVERLAY}-show`);
    }
  }
}
