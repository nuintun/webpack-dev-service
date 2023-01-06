/**
 * @module overlay
 * @see https://github.com/shellscape/webpack-plugin-serve
 */

import { StatsError } from 'webpack';
import { ansiToHTML, appendHTML, injectCSS } from './utils';

const OVERLAY = 'wds-overlay';

const CSS = `
 .${OVERLAY} {
   top:0;
   left: 0;
   right: 0;
   bottom: 0;
   display: flex;
   position: fixed;
   font-size: 16px;
   overflow: hidden;
   font-style: normal;
   font-weight: normal;
   z-index: 2147483646;
   flex-direction: column;
   box-sizing: border-box;
   transform-origin: center;
   background: rgba(0, 0, 0, .85);
   transform: scale(0) translateZ(0);
   transition: transform .25s ease-out;
   font-family: Menlo, "Lucida Console", monospace;
 }
 .${OVERLAY}-show {
   transform: scale(1) translateZ(0);
 }
 .${OVERLAY}-close {
   top: 16px;
   right: 16px;
   width: 16px;
   height: 16px;
   cursor: pointer;
   position: absolute;
   border-radius: 16px;
   background: #ff5f58;
   display: inline-block;
   transform-origin: center;
   box-shadow: #ff5f58 0 0 6px;
   transform: rotate(0) translateZ(0);
   transition: transform .25s ease-in-out;
 }
 .${OVERLAY}-close:before,
 .${OVERLAY}-close:after {
   top: 7px;
   left: 3px;
   content: "";
   width: 10px;
   height: 2px;
   position: absolute;
   background-color: white;
   transform-origin: center;
 }
 .${OVERLAY}-close:before {
   transform: rotate(45deg);
 }
 .${OVERLAY}-close:after {
   transform: rotate(-45deg);
 }
 .${OVERLAY}-close:hover {
   transform: rotate(180deg) translateZ(0);
 }
 .${OVERLAY}-title {
   margin: 0;
   color: #fff;
   line-height: 16px;
   text-align: center;
   background: #282d35;
   overflow-wrap: break-word;
   border-radius: 0 0 4px 4px;
   padding: 16px 48px 16px 16px;
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
   font-style: normal;
 }
 .${OVERLAY}-warnings-title {
   color: #ffbd2e;
 }
 .${OVERLAY}-problems {
   padding: 0 16px;
   overflow-y: auto;
   scrollbar-width: none;
   -ms-overflow-style: none;
   -ms-scroll-chaining: none;
   overscroll-behavior: contain;
   -webkit-overflow-scrolling: touch;
 }
 .${OVERLAY}-problems::-webkit-scrollbar {
   display: none;
 }
 .${OVERLAY}-errors,
 .${OVERLAY}-warnings {
   color: #ddd;
   padding: 16px;
   margin: 16px 0;
   display: block;
   line-height: 1.2;
   border-radius: 4px;
   background: #282d35;
   white-space: pre-wrap;
   font-family: Consolas, "Lucida Console", monospace;
 }
 .${OVERLAY}-errors > div,
 .${OVERLAY}-warnings > div {
   overflow-wrap: break-word;
 }
 .${OVERLAY}-errors > div + div,
 .${OVERLAY}-warnings > div + div {
   margin: 16px 0 0;
 }
 .${OVERLAY}-errors > div > em,
 .${OVERLAY}-warnings > div > em {
   line-height: 1;
   color: #641e16;
   padding: 4px 8px;
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
   font-size: 14px;
   padding: 8px 0 0 16px;
   overflow-wrap: break-word;
 }
 .${OVERLAY}-hidden {
   display: none;
 }
 `;

const DEFAULT_NAME = 'webpack';

const HTML = `
 <aside class="${OVERLAY}">
   <i class="${OVERLAY}-close"></i>
   <div class="${OVERLAY}-title">
     <em class="${OVERLAY}-name"></em>
     <em class="${OVERLAY}-errors-title"></em>
     <em class="${OVERLAY}-warnings-title"></em>
   </div>
   <article class="${OVERLAY}-problems">
     <pre class="${OVERLAY}-errors ${OVERLAY}-hidden"></pre>
     <pre class="${OVERLAY}-warnings ${OVERLAY}-hidden"></pre>
   </article>
 </aside>
 `;

export default class Overlay {
  private hidden: boolean = true;

  private readonly name: HTMLElement;
  private readonly close: HTMLElement;
  private readonly aside: HTMLElement;
  private readonly errorsList: HTMLElement;
  private readonly errorsTitle: HTMLElement;
  private readonly warningsList: HTMLElement;
  private readonly warningsTitle: HTMLElement;

  constructor(name: string) {
    injectCSS(CSS);

    [this.aside] = appendHTML(HTML) as [HTMLElement];

    this.name = this.aside.querySelector(`.${OVERLAY}-name`)!;
    this.close = this.aside.querySelector(`.${OVERLAY}-close`)!;
    this.errorsList = this.aside.querySelector(`.${OVERLAY}-errors`)!;
    this.warningsList = this.aside.querySelector(`.${OVERLAY}-warnings`)!;
    this.errorsTitle = this.aside.querySelector(`.${OVERLAY}-errors-title`)!;
    this.warningsTitle = this.aside.querySelector(`.${OVERLAY}-warnings-title`)!;

    this.name.innerHTML = `⭕ ${name || DEFAULT_NAME}`;

    this.close.addEventListener('click', () => {
      this.hide();
    });
  }

  setProblems(type: 'errors' | 'warnings', problems: StatsError[]): void {
    const count = problems.length;
    const hidden = `${OVERLAY}-hidden`;

    const problemMaps: Record<string, [string, HTMLElement, HTMLElement]> = {
      errors: ['Error', this.errorsTitle, this.errorsList],
      warnings: ['Warning', this.warningsTitle, this.warningsList]
    };
    const [name, problemTitle, problemList] = problemMaps[type];

    if (count > 0) {
      let html = '';

      problemTitle.innerText = `${count} ${name}(s)`;

      for (const { moduleName = 'unknown', message } of problems) {
        const src = ansiToHTML(moduleName);
        const details = ansiToHTML(message);

        html += `<div><em>${name}</em> in ${src}<div>${details}</div></div>`;
      }

      problemList.innerHTML = html;

      problemList.classList.remove(hidden);
      problemTitle.classList.remove(hidden);
    } else {
      problemList.classList.add(hidden);
      problemTitle.classList.add(hidden);
    }
  }

  show(): void {
    if (this.hidden) {
      this.hidden = false;

      this.aside.classList.add(`${OVERLAY}-show`);
    }
  }

  hide(): void {
    if (!this.hidden) {
      this.hidden = true;

      this.aside.classList.remove(`${OVERLAY}-show`);
    }
  }
}
