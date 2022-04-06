import App from './App';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app');
const root = createRoot(app);

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept(['./App.jsx'], () => {
    root.render(<App />);
  });
}
