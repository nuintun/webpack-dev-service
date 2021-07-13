/**
 * @module utils
 */

export function appendHTML(html, parent) {
  const nodes = [];
  const div = document.createElement('div');

  div.innerHTML = html.trim();

  while (div.firstChild) {
    nodes.push((parent || document.body).appendChild(div.firstChild));
  }

  return nodes;
}

export function injectCSS(css) {
  const style = document.createElement('style');

  if (css.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  document.head.appendChild(style);
}
