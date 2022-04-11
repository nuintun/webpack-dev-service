import App from './App';
import { on } from '../../client';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app');
const root = createRoot(app);

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept(['./App.jsx'], () => {
    root.render(<App />);
  });
}

on('ok', ({ builtAt }) => {
  console.info(
    `%c⭕%c[HMR]: App is up to date at ${new Date(builtAt).toLocaleString()}`,
    'color: #f92f60; font-weight: normal;',
    'color: #1890ff; font-weight: bold;'
  );
});
