/**
 * @module utils
 */

import Ansi, { AnsiBlock } from './ansi';

const ansi = new Ansi();

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
    styles.push(`opacity:0.5`);
  }

  if (style.bold) {
    styles.push(`font-weight:bold`);
  }

  if (style.italic) {
    styles.push(`font-style:italic`);
  }

  if (style.inverse) {
    styles.push(`filter:invert(1)`);
  }

  if (style.hidden) {
    styles.push(`visibility:hidden`);
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
    styles.push(`color:rgb(${color})`);
  }

  if (background) {
    styles.push(`background-color:rgb(${background})`);
  }

  if (textDecorations.length > 0) {
    styles.push(`text-decoration:${textDecorations.join(' ')}`);
  }

  const escapedValue = escapeHTML(value);
  const href = url ? JSON.stringify(new URL(url).toString()) : null;

  if (styles.length <= 0) {
    if (!href) {
      return escapedValue;
    }

    return `<a href=${href} target="_blank">${escapedValue}</a>`;
  }

  const inlineStyle = JSON.stringify(`${styles.join(';')};`);

  if (!href) {
    return `<span style=${inlineStyle}>${escapedValue}</span>`;
  }

  return `<a style=${inlineStyle} href=${href} target="_blank">${escapedValue}</a>`;
}

export function ansiToHTML(text: string): string {
  let html = '';

  ansi.write(text, block => {
    html += blockToHTML(block);
  });

  ansi.flush(block => {
    html += blockToHTML(block);
  });

  return html;
}
