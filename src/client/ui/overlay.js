/**
 * @module overlay
 */

import { appendHTML, injectCSS } from './utils';

const ns = 'wds-overlay';

const css = `
  .${ns} {
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
    transform: scale(0);
    flex-direction: column;
    font-family: monospace;
    box-sizing: border-box;
    background: rgba(0, 0, 0, .85);
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
    animation: ${ns}-show .3s ease-out forwards;
  }
  .${ns}-hide {
    animation: ${ns}-hide .3s ease-out forwards;
  }
  .${ns}-title {
    margin: 0;
    color: #fff;
    width: 100%;
    padding: 1em 0;
    line-height: 1em;
    text-align: center;
    background: #282d35;
  }
  .${ns}-nav {
    right: 0;
    padding: 1em;
    line-height: 1em;
    position: absolute;
    transition: transform .3s ease-in-out;
  }
  .${ns}-nav:hover {
    transform: rotate(180deg);
  }
  .${ns}-nav .${ns}-close {
    width: 1em;
    height: 1em;
    color: #fff;
    cursor: pointer;
    text-align: center;
    border-radius: 1em;
    background: #ff5f58;
    display: inline-block;
  }
  .${ns}-errors-title,
  .${ns}-warnings-title {
    color: #ff5f58;
    padding-left: .5em;
  }
  .${ns}-warnings-title {
    color: #ffbd2e;
  }
  .${ns}-problems {
    padding: 0 1em;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .${ns}-problems::-webkit-scrollbar {
    display: none;
  }
  .${ns}-errors,
  .${ns}-warnings {
    color: #ddd;
    margin: 1em 0;
    display: block;
    background: #282d35;
    border-radius: .3em;
    white-space: pre-wrap;
    font-family: monospace;
  }
  .${ns}-errors > div,
  .${ns}-warnings > div {
    padding: 1em 1em 0;
  }
  .${ns}-errors > div > em,
  .${ns}-warnings > div > em {
    color: #641e16;
    line-height: 1.5em;
    font-style: normal;
    padding: .1em .5em;
    background: #ff5f58;
    border-radius: .3em;
    text-transform: uppercase;
  }
  .${ns}-warnings > div > em {
    color: #3e2723;
    background: #ffbd2e;
  }
  .${ns}-errors > div > div,
  .${ns}-warnings > div > div {
    padding: .5em 0 1em 2em;
  }
`;

const html = `
  <aside class="${ns}" title="Build Status">
    <nav class="${ns}-nav">
      <div class="${ns}-close" title="close">×</div>
    </nav>
    <div class="${ns}-title">
      Build Status
      <em class="${ns}-errors-title"></em>
      <em class="${ns}-warnings-title"></em>
    </div>
    <article class="${ns}-problems">
      <pre class="${ns}-errors"></pre>
      <pre class="${ns}-warnings"></pre>
    </article>
  </aside>
`;

export default class Overlay {
  constructor() {
    this.init();
  }

  init() {
    injectCSS(css);

    [this.aside] = appendHTML(html);

    this.close = this.aside.querySelector(`.${ns}-close`);
    this.errorsList = this.aside.querySelector(`.${ns}-errors`);
    this.warningsList = this.aside.querySelector(`.${ns}-warnings`);
    this.errorsTitle = this.aside.querySelector(`.${ns}-errors-title`);
    this.warningsTitle = this.aside.querySelector(`.${ns}-warnings-title`);

    this.close.addEventListener('click', () => {
      this.hide();
    });
  }

  addErrors(errors) {
    const { length } = errors;
    const { errorsTitle, errorsList } = this;

    errorsList.innerHTML = '';
    errorsTitle.innerText = '';

    if (length) {
      for (const { moduleName, message } of errors) {
        appendHTML(`<div><em>Error</em> in ${moduleName}<div>${message}</div></div>`, errorsList);
      }

      errorsTitle.innerText = `${length} Error(s)`;
    }
  }

  addWarnings(warnings) {
    const { length } = warnings;
    const { warningsTitle, warningsList } = this;

    warningsList.innerHTML = '';
    warningsTitle.innerText = '';

    if (length) {
      for (const { moduleName, message } of warnings) {
        appendHTML(`<div><em>Warning</em> in ${moduleName}<div>${message}</div></div>`, warningsList);
      }

      warningsTitle.innerText = `${length} Warning(s)`;
    }
  }

  show({ errors, warnings }) {
    const show = `${ns}-show`;
    const { classList } = this.aside;

    this.addErrors(errors);
    this.addWarnings(warnings);

    if (!classList.contains(show)) {
      classList.remove(`${ns}-hide`);
      classList.add(show);
    }
  }

  hide() {
    const { aside } = this;
    const show = `${ns}-show`;
    const { classList } = aside;

    if (classList.contains(show)) {
      classList.remove(show);
      classList.add(`${ns}-hide`);
    }
  }
}
