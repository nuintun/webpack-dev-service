/**
 * @module overlay
 */

import onEffectsEnd from './utils/effects';
import { appendHTML, injectCSS } from './utils';

const OVERLAY = 'wds-overlay';

const CSS = `
  .${OVERLAY} {
    top:0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    position: fixed;
    font-size: 16px;
    overflow: hidden;
    font-style: normal;
    font-weight: normal;
    z-index: 2147483644;
    flex-direction: column;
    font-family: monospace;
    box-sizing: border-box;
    background: rgba(0, 0, 0, .85);
    transform: scale(0) translateZ(0);
  }
  @keyframes ${OVERLAY}-show {
    0% {
      opacity: 0;
      transform: scale(0) translateZ(0);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateZ(0);
    }
  }
  @keyframes ${OVERLAY}-hide {
    0% {
      opacity: 1;
      transform: scale(1) translateZ(0);
    }
    100% {
      opacity: 0;
      transform: scale(0) translateZ(0);
    }
  }
  .${OVERLAY}-show {
    animation: ${OVERLAY}-show .3s ease-out forwards;
  }
  .${OVERLAY}-hide {
    animation: ${OVERLAY}-hide .3s ease-out forwards;
  }
  .${OVERLAY}-nav {
    right: 0;
    padding: 1em;
    line-height: 1em;
    position: absolute;
    transition: transform .3s ease-in-out;
  }
  .${OVERLAY}-nav:hover {
    transform: rotate(180deg) translateZ(0);
  }
  .${OVERLAY}-close {
    width: 1em;
    height: 1em;
    color: #fff;
    cursor: pointer;
    font-style: normal;
    text-align: center;
    border-radius: 1em;
    font-weight: normal;
    background: #ff5f58;
    display: inline-block;
  }
  .${OVERLAY}-title {
    margin: 0;
    color: #fff;
    width: 100%;
    padding: 1em 0;
    line-height: 1em;
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
    padding-left: .5em;
  }
  .${OVERLAY}-warnings-title {
    color: #ffbd2e;
  }
  .${OVERLAY}-problems {
    padding: 0 1em;
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
    margin: 1em 0;
    display: block;
    background: #282d35;
    border-radius: .3em;
    white-space: pre-wrap;
    font-family: monospace;
  }
  .${OVERLAY}-errors > div,
  .${OVERLAY}-warnings > div {
    padding: 1em 1em 0;
  }
  .${OVERLAY}-errors > div > em,
  .${OVERLAY}-warnings > div > em {
    color: #641e16;
    line-height: 1.5em;
    font-style: normal;
    padding: .1em .5em;
    font-weight: normal;
    background: #ff5f58;
    border-radius: .3em;
    text-transform: uppercase;
  }
  .${OVERLAY}-warnings > div > em {
    color: #3e2723;
    background: #ffbd2e;
  }
  .${OVERLAY}-errors > div > div,
  .${OVERLAY}-warnings > div > div {
    padding: .5em 0 1em 2em;
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

export default class Overlay {
  constructor() {
    this.init();
  }

  init() {
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

  addErrors(errors = []) {
    const { length } = errors;
    const { errorsTitle, errorsList } = this;

    errorsList.innerHTML = '';
    errorsTitle.innerText = '';

    if (length) {
      errorsTitle.innerText = `${length} Error(s)`;

      for (const { moduleName, message } of errors) {
        appendHTML(`<div><em>Error</em> in ${moduleName}<div>${message}</div></div>`, errorsList);
      }
    }
  }

  addWarnings(warnings = []) {
    const { length } = warnings;
    const { warningsTitle, warningsList } = this;

    warningsList.innerHTML = '';
    warningsTitle.innerText = '';

    if (length) {
      warningsTitle.innerText = `${length} Warning(s)`;

      for (const { moduleName, message } of warnings) {
        appendHTML(`<div><em>Warning</em> in ${moduleName}<div>${message}</div></div>`, warningsList);
      }
    }
  }

  isVisible() {
    return this.aside.classList.contains(`${OVERLAY}-show`);
  }

  show({ errors, warnings }) {
    const { classList } = this.aside;

    this.addErrors(errors);
    this.addWarnings(warnings);

    if (!this.isVisible()) {
      classList.remove(`${OVERLAY}-hide`);
      classList.add(`${OVERLAY}-show`);
    }
  }

  hide(onHidden) {
    const { aside } = this;
    const { classList } = aside;

    if (this.isVisible()) {
      classList.remove(`${OVERLAY}-show`);
      classList.add(`${OVERLAY}-hide`);

      if (onHidden) {
        onEffectsEnd(aside, onHidden);
      }
    } else if (onHidden) {
      onHidden();
    }
  }
}
