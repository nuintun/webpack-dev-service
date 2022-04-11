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
  console.info(`📌 %c[HMR]: App is up to date at ${new Date(builtAt).toLocaleString()}.`, 'color: #099160;');
});
