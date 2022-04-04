import App from './App';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app');
const root = createRoot(app);

root.render(<App />);

if (module.hot) {
  module.hot.accept(['./App.jsx'], () => {
    root.render(<App />);
  });
}
