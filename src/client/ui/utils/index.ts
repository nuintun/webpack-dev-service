/**
 * @module utils
 */

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
