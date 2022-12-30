import App from './App';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app');
const root = createRoot(app);

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept(['./App.jsx'], () => {
    root.render(<App />);
  });

  import(
    // webpackMode: 'eager'
    '../../client'
  ).then(({ on }) => {
    on('ok', ({ builtAt }) => {
      console.log(`[HMR] App is up to date at ${new Date(builtAt).toLocaleString()}`);
    });
  });
}
