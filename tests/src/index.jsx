import App from './App';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);

if (module.hot) {
  module.hot.accept(['./App.jsx'], () => {
    root.render(<App />);
  });
}
