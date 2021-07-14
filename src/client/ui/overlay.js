/**
 * @module overlay
 */

import onEffectsEnd from './utils/effects';
import { appendHTML, injectCSS } from './utils';

const ns = 'wps-overlay';

const css = `
  .${ns} {
    top:0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 1;
    width: 100vw;
    height: 100vh;
    display: flex;
    position: fixed;
    font-size: 16px;
    overflow: hidden;
    z-index: 2147483644;
    flex-direction: column;
    font-family: monospace;
    box-sizing: border-box;
    background: rgba(0, 0, 0, .85);
  }
  @keyframes ${ns}-show {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;

    }
  }
  .${ns}.${ns}-hidden {
    display: none;
    animation: ${ns}-show .3s;
    animation-fill-mode:forwards;
  }
  .${ns}-title {
    margin: 0;
    color: #fff;
    width: 100%;
    padding: 1em 0;
    line-height: 1em;
    text-align: center;
    background: #282d35;
    font-weight: normal;
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
  .${ns}-title-errors,
  .${ns}-title-warnings {
    color: #ff5f58;
    padding-left: .5em;
    font-style: normal;
  }
  .${ns}-title-warnings {
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
  <aside class="${ns} ${ns}-hidden" title="Build Status">
    <nav class="${ns}-nav">
      <div class="${ns}-close" title="close">×</div>
    </nav>
    <div class="${ns}-title">
      Build Status
      <em class="${ns}-title-errors"></em>
      <em class="${ns}-title-warnings"></em>
    </div>
    <article class="${ns}-problems">
      <pre class="${ns}-errors"></pre>
      <pre class="${ns}-warnings"></pre>
    </article>
  </aside>
`;

const hidden = `${ns}-hidden`;

export default class Overlay {
  constructor() {
    this.init();
  }

  init() {
    injectCSS(css);

    [this.aside] = appendHTML(html);

    this.close = this.aside.querySelector(`.${ns}-close`);
    this.preErrors = this.aside.querySelector(`.${ns}-errors`);
    this.preWarnings = this.aside.querySelector(`.${ns}-warnings`);
    this.titleErrors = this.aside.querySelector(`.${ns}-title-errors`);
    this.titleWarnings = this.aside.querySelector(`.${ns}-title-warnings`);

    this.close.addEventListener('click', () => {
      this.aside.classList.add(`${ns}-hidden`);
    });
  }

  addErrors(errors) {
    const { length } = errors;
    const { titleErrors } = this;

    if (length) {
      const { preErrors } = this;

      for (const { moduleName, message } of errors) {
        appendHTML(`<div><em>Error</em> in ${moduleName}<div>${message}</div></div>`, preErrors);
      }

      titleErrors.innerText = `${length} Error(s)`;
    } else {
      titleErrors.innerText = '';
    }
  }

  addWarnings(warnings) {
    const { length } = warnings;
    const { titleWarnings } = this;

    if (length) {
      const { preWarnings } = this;

      for (const { moduleName, message } of warnings) {
        appendHTML(`<div><em>Warning</em> in ${moduleName}<div>${message}</div></div>`, preWarnings);
      }

      titleWarnings.innerText = `${length} Warning(s)`;
    } else {
      titleWarnings.innerText = '';
    }
  }

  show({ errors, warnings }) {
    this.addErrors(errors);
    this.addWarnings(warnings);

    this.aside.classList.remove(hidden);
  }

  hide() {
    this.aside.classList.add(hidden);

    this.preErrors.innerHTML = '';
    this.preWarnings.innerHTML = '';
    this.titleErrors.innerText = '';
    this.titleWarnings.innerText = '';
  }
}
