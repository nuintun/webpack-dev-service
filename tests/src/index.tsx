import App from './App';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app')!;
const root = createRoot(app);

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept('./App.tsx', () => {
    root.render(<App />);
  });

  import(
    // webpackMode: 'eager'
    'webpack-dev-service/events'
  ).then(({ on }) => {
    on('ok', ({ builtAt }) => {
      console.log(`[HMR] App is up to date at ${new Date(builtAt).toLocaleString()}`);
    });
  });
}