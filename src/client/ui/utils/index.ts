/**
 * @module utils
 */

import Ansi, { AnsiBlock } from './ansi';

const defaultStyleElement = document.createElement('style');

export function injectCSS(css: string, styleElement = defaultStyleElement): HTMLStyleElement {
  const { head } = document;

  styleElement.appendChild(document.createTextNode(css.trim()));

  if (!head.contains(styleElement)) {
    head.appendChild(styleElement);
  }

  return styleElement;
}

export function appendHTML(html: string, parent?: HTMLElement): ChildNode[] {
  const nodes: ChildNode[] = [];
  const parser = new DOMParser();
  const stage = parent || document.body;
  const fragment = document.createDocumentFragment();
  const { body } = parser.parseFromString(html.trim(), 'text/html');

  while (body.firstChild) {
    nodes.push(fragment.appendChild(body.firstChild));
  }

  stage.appendChild(fragment);

  return nodes;
}

export function escapeHTML(text: string): string {
  return text.replace(/[&<>"']/gm, match => {
    switch (match) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#x27;';
      default:
        return match;
    }
  });
}

export function blockToHTML({ style, value, url }: AnsiBlock): string {
  const styles: string[] = [];
  const textDecorations: string[] = [];

  if (style.dim) {
    styles.push(`opacity: 0.5`);
  }

  if (style.bold) {
    styles.push(`font-weight: bold`);
  }

  if (style.italic) {
    styles.push(`font-style: italic`);
  }

  if (style.inverse) {
    styles.push(`filter: invert(1)`);
  }

  if (style.hidden) {
    styles.push(`visibility: hidden`);
  }

  if (style.blink) {
    textDecorations.push('blink');
  }

  if (style.overline) {
    textDecorations.push('overline');
  }

  if (style.underline) {
    textDecorations.push('underline');
  }

  if (style.strikethrough) {
    textDecorations.push('line-through');
  }

  const { color, background } = style;

  if (color) {
    styles.push(`color: rgb(${color})`);
  }

  if (background) {
    styles.push(`background-color: rgb(${background})`);
  }

  if (textDecorations.length > 0) {
    styles.push(`text-decoration: ${textDecorations.join(' ')}`);
  }

  const escapedValue = escapeHTML(value);

  if (styles.length <= 0) {
    return escapedValue;
  }

  const inlineStyle = JSON.stringify(`${styles.join(';')};`);

  if (!url) {
    return `<span style=${inlineStyle}>${escapedValue}</span>`;
  }

  const href = JSON.stringify(escapeHTML(url));

  return `<a style=${inlineStyle} href=${href} target="_blank">${escapedValue}</a>`;
}

const ansi = new Ansi();

export function ansiToHTML(text: string): string {
  let html = '';

  const blocks = ansi.parse(text);
  const flushedBlock = ansi.flush();

  for (const block of blocks) {
    html += blockToHTML(block);
  }

  if (flushedBlock) {
    html += blockToHTML(flushedBlock);
  }

  return html;
}
