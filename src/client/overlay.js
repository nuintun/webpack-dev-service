import ansiHTML from 'ansi-html';
import { encode } from 'html-entities';

const overlay = document.createElement('div');

const colors = {
  red: 'ff3348',
  blue: '169be0',
  cyan: '0ad8e9',
  black: '181818',
  green: '3fff4f',
  yellow: 'ffd30e',
  magenta: 'f840b7',
  darkgrey: '6d7891',
  lightgrey: 'ebe7e3',
  reset: ['transparent', 'transparent']
};

const overlayTypeColors = {
  error: colors.red,
  warning: colors.yellow
};

const styles = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  padding: '10px',
  color: '#e8e8e8',
  fontSize: '16px',
  overflow: 'auto',
  whiteSpace: 'pre',
  position: 'fixed',
  textAlign: 'left',
  background: 'rgba(0, 0, 0, 0.85)',
  fontFamily: 'Menlo, Consolas, monospace'
};

ansiHTML.setColors(colors);

for (const key in styles) {
  overlay.style[key] = styles[key];
}

function overlayType(type) {
  const displayType = type.toUpperCase();
  const color = overlayTypeColors[type] || colors.red;
  const styles = `background: #${color}; color: #000; padding: 3px 6px; border-radius: 4px;`;

  return `<span style="${styles}">${displayType}</span>`;
}

export function show(type, messages) {
  overlay.innerHTML = '';

  messages.forEach(({ moduleName, message }) => {
    const div = document.createElement('div');

    div.style.marginBottom = '26px';

    message = ansiHTML(encode(message));

    div.innerHTML = `${overlayType(type)} in ${moduleName}<div style="padding: 16px 0 0 16px;">${message}</div>`;

    overlay.appendChild(div);
  });

  if (document.body) {
    document.body.appendChild(overlay);
  }
}

export function hide() {
  if (document.body && overlay.parentNode) {
    document.body.removeChild(overlay);
  }
}
