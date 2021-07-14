/**
 * @module utils
 */

function parseHTML(html) {
  try {
    const parser = new DOMParser();
    const { body } = parser.parseFromString(html.trim(), 'text/html');

    return body.children;
  } catch {
    return [];
  }
}

export function appendHTML(html, parent) {
  const nodes = [];
  const stage = parent || document.body;

  for (const node of parseHTML(html)) {
    nodes.push(stage.appendChild(node));
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
